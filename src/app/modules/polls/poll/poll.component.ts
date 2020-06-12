import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormArray } from '@angular/forms';
import { ConfirmValidParentMatcher } from '@app/validators';
import { LocationService, PollsService } from '@app/services';
import { AuthService } from '@app/core/services';
import { catchError, map, tap } from 'rxjs/operators';
import { SpinnerService } from '@app/shared/spinner.service';
import { throwError, Observable } from 'rxjs';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '@app/shared/dialog/dialog.component';
import { Poll } from '@app/_models';
import { MonitorService } from '@app/shared/monitor.service';

@Component({
  selector: 'app-poll',
  templateUrl: './poll.component.html',
  styleUrls: ['./poll.component.scss']
})
export class PollComponent implements OnInit {
  minDate: Date = new Date();
  businessId: string = '';
  locs$: Observable<any[]>;
  poll$: Observable<Poll>;
  savePoll$: Observable<any>; 
  pollDataList: Poll;

  confirmValidParentMatcher = new ConfirmValidParentMatcher();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private spinnerService: SpinnerService,
    private pollService: PollsService,
    private dialog: MatDialog,
    private data: MonitorService,
    private locationService: LocationService
  ) { }

  get f(){
    return this.pollForm.controls;
  }

  pollForm = this.fb.group({
    PollId: [''],
    Name: ['', [Validators.required, Validators.maxLength(100), Validators.minLength(3)]],
    LocationId: ['', [Validators.required]],
    DatePoll: [this.minDate, Validators.required],
    DateFinPoll: [''],
    Happy: [0],
    Neutral: [0],
    Angry: [0],
    Status: [true]
  });

  openDialog(header: string, message: string, success: boolean, error: boolean, warn: boolean): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      header: header, 
      message: message, 
      success: success, 
      error: error, 
      warn: warn
    };
    dialogConfig.width ='280px';
    dialogConfig.minWidth = '280px';
    dialogConfig.maxWidth = '280px';

    this.dialog.open(DialogComponent, dialogConfig);
  }
  
  ngOnInit(): void {
    var spinnerRef = this.spinnerService.start("Loading Poll...");
    this.businessId = this.authService.businessId();

    this.locs$ = this.locationService.getLocationsCode(this.businessId).pipe(
      map((res: any) => {
        if (res != null){
          this.spinnerService.stop(spinnerRef);
          return res.locs;
        }
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        return throwError(err || err.message);
      })
    );

    this.data.objectMessage.subscribe(res => this.pollDataList = res);
    this.onDisplay();
  }

  onDisplay(){
    if (this.pollDataList != undefined){
      var spinnerRef = this.spinnerService.start("Loading Poll...");
      this.pollForm.reset({ PollId: '', Name: '', LocationId: '', DatePoll: '', DateFinPoll: '', Happy: 0, Neutral: 0, Angry: 0, Status: true});
      this.poll$ = this.pollService.getPoll(this.pollDataList).pipe(
        map(poll => {
          let dateP = new Date(poll.DatePoll+'T06:00:00');
          let dateFinP = new Date(poll.DateFinPoll+'T06:00:00');
          this.pollForm.setValue({
            PollId: poll.PollId,
            Name: poll.Name,
            LocationId: poll.LocationId,
            DatePoll: dateP,
            DateFinPoll: dateFinP,
            Happy: poll.Happy,
            Neutral: poll.Neutral,
            Angry: poll.Angry,
            Status: (poll.Status == 1 ? true : false)
          });
          this.spinnerService.stop(spinnerRef);
          return poll;
        }),
        catchError(err => {
          this.spinnerService.stop(spinnerRef);
          this.openDialog('Error !', err.Message, false, true, false);
          return throwError(err || err.Message);
        })
      );
    }
  }

  getErrorMessage(component: string, index: number =0){
    if (component === 'Name'){
      return this.f.Name.hasError('required') ? 'You must enter a value' :
        this.f.Name.hasError('minlength') ? 'Minimun length 3':
          this.f.Name.hasError('maxlength') ? 'Maximun length 100' :
            '';
    }
    if (component === 'LocationId'){
      return this.f.LocationId.hasError('required') ? 'You must select a value' :
        '';
    }
    if (component === 'DatePoll'){
      return this.f.DatePoll.hasError('required') ? 'You must enter a value' :
        '';
    }
    if (component === 'QDescription'){
      let sDescription = (<FormArray>this.pollForm.get('Questions')).controls[index].get('Description');
      return sDescription.hasError('required') ? 'You must enter a Description' :
        sDescription.hasError('minlength') ? 'Minimun length 3':
          sDescription.hasError('maxlength') ? 'Maximun length 100' :
            '';
    }
  }

  onCancel(){
    this.pollForm.reset({ PollId: '', Name: '', LocationId: '', DatePoll: this.minDate, DateFinPoll: this.minDate, Happy: 0, Neutral: 0, Angry: 0, Status: true});
  }

  onSubmit(){
    if (this.pollForm.invalid) { return; }
    let dateVal = new Date(this.pollForm.value.DatePoll);
    let dateFinVal;
    if (this.pollForm.value.DateFinPoll == '') {
      dateFinVal = '';
    } 
    else { 
      dateFinVal = new Date(this.pollForm.value.DateFinPoll);
      dateFinVal=dateFinVal.getFullYear().toString() + '-' + (dateFinVal.getMonth()+1).toString().padStart(2,'0') + '-' + dateFinVal.getDate().toString().padStart(2, '0');
    } 

    let dataForm = {
      PollId: this.pollForm.value.PollId,
      BusinessId: this.businessId,
      LocationId: this.pollForm.value.LocationId,
      DatePoll: dateVal.getFullYear().toString() + '-' + (dateVal.getMonth()+1).toString().padStart(2,'0') + '-' + dateVal.getDate().toString().padStart(2, '0'),
      DateFinPoll: dateFinVal,
      Name: this.pollForm.value.Name,
      Status: 1
    }
    if (dateFinVal != ''){
      if (dataForm.DatePoll > dataForm.DateFinPoll) {return;}
    }

    var spinnerRef = this.spinnerService.start("Saving Poll...");
    this.savePoll$ =  this.pollService.postPolls(dataForm).pipe(
      map((res:any) => {
        if (res != null){
          if (res.Code == 200){
            this.spinnerService.stop(spinnerRef);
            this.pollForm.patchValue({PollId: res.PollId});
            // this.pollForm.reset({ PollId: '', Name: '', LocationId: '', DatePoll: '', DateFinPoll: '', Happy: 0, Neutral: 0, Angry: 0, Status: true});
            this.openDialog('Polls', 'Saving successfully', true, false, false);
          } else {
            this.spinnerService.stop(spinnerRef);
            this.openDialog('Error ! ', 'Something goes wrong, try again', false, true, false);
          }
        } else {
          this.spinnerService.stop(spinnerRef);
          this.openDialog('Error ! ', 'Something goes wrong, try again', false, true, false);
        }
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        this.openDialog('Error ! ', err.Message, false, true, false);
        return throwError (err || err.message);
      })
    );
  }

}
