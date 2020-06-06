import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormArray } from '@angular/forms';
import { ConfirmValidParentMatcher } from '@app/validators';
import { LocationService, PollsService } from '@app/services';
import { AuthService } from '@app/core/services';
import { catchError, map } from 'rxjs/operators';
import { SpinnerService } from '@app/shared/spinner.service';
import { throwError, Observable } from 'rxjs';
import { ArrayValidators } from '@app/validators';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '@app/shared/dialog/dialog.component';

@Component({
  selector: 'app-poll',
  templateUrl: './poll.component.html',
  styleUrls: ['./poll.component.scss']
})
export class PollComponent implements OnInit {
  minDate: Date;
  todayDate: Date;
  businessId: string = '';
  locs$: Observable<any[]>;
  savePoll$: Observable<any>; 

  confirmValidParentMatcher = new ConfirmValidParentMatcher();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private spinnerService: SpinnerService,
    private pollService: PollsService,
    private dialog: MatDialog,
    private locationService: LocationService
  ) { }

  get fQuestions(){
    return this.pollForm.get('Questions') as FormArray;
  }

  get f(){
    return this.pollForm.controls;
  }

  pollForm = this.fb.group({
    PollId: [''],
    Name: ['', [Validators.required, Validators.maxLength(100), Validators.minLength(3)]],
    LocationId: ['', [Validators.required]],
    DatePoll: ['', Validators.required],
    Status: [false],
    Questions : this.fb.array([this.addQuestion()], ArrayValidators.minLength(1))
  });

  addQuestion(): FormGroup {
    return this.fb.group({
      QuestionId: [''],
      Description: ['', [Validators.required, Validators.maxLength(100), Validators.minLength(3)]],
      Status: [1]
    });
  }

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
    this.minDate = new Date();
    this.todayDate = new Date();
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

  onAddQuestion(): void{
    (<FormArray>this.pollForm.get('Questions')).push(this.addQuestion());
  }

  onCancel(){
    this.pollForm.reset({ PollId: '', Name: '', LocationId: '', DatePoll: ''});
    this.fQuestions.clear();
    (<FormArray>this.pollForm.get('Questions')).push(this.addQuestion());
  }

  onSubmit(){
    if (this.pollForm.invalid) { return; }
    let dateVal = new Date();
    dateVal = this.pollForm.value.DatePoll;

    let dataForm = {
      PollId: this.pollForm.value.PollId,
      BusinessId: this.businessId,
      LocationId: this.pollForm.value.LocationId,
      DatePoll: dateVal.getFullYear().toString() + '-' + dateVal.getMonth().toString().padStart(2,'0') + '-' + dateVal.getDate().toString().padStart(2, '0'),
      Name: this.pollForm.value.Name,
      Status: (this.pollForm.value.Status == false ? 0 : 1),
      Questions: this.pollForm.value.Questions
    }
    var spinnerRef = this.spinnerService.start("Saving Poll...");
    this.savePoll$ =  this.pollService.postPolls(dataForm).pipe(
      map((res:any) => {
        if (res != null){
          if (res.Code == 200){
            this.spinnerService.stop(spinnerRef);
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

  onRemoveQuestion(index: number){
    let quest =  this.pollForm.get('Questions') as FormArray;
    let item = quest.at(index);
    if (item.value.QuestionId == ''){
      quest.removeAt(index);
    } else {
      item.patchValue({Status: 0});
    }
  }

}
