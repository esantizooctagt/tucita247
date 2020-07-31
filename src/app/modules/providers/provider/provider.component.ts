import { Component, OnInit } from '@angular/core';
import { DialogComponent } from '@app/shared/dialog/dialog.component';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { Validators, FormBuilder, FormArray } from '@angular/forms';
import { AuthService } from '@app/core/services';
import { SpinnerService } from '@app/shared/spinner.service';
import { MonitorService } from '@app/shared/monitor.service';
import { LocationService, ProviderService } from '@app/services';
import { ConfirmValidParentMatcher } from '@app/validators';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-provider',
  templateUrl: './provider.component.html',
  styleUrls: ['./provider.component.scss']
})
export class ProviderComponent implements OnInit {
  businessId: string = '';
  locs$: Observable<any[]>;
  provider$: Observable<any>;
  saveProvider$: Observable<any>; 
  providerDataList: any;

  confirmValidParentMatcher = new ConfirmValidParentMatcher();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private spinnerService: SpinnerService,
    private providerService: ProviderService,
    private dialog: MatDialog,
    private data: MonitorService,
    private locationService: LocationService
  ) { }

  get f(){
    return this.providerForm.controls;
  }

  providerForm = this.fb.group({
    ServiceId: [''],
    Name: ['', [Validators.required, Validators.maxLength(100), Validators.minLength(3)]],
    LocationId: ['', [Validators.required]],
    CustomerPerBucket: ['', [Validators.required, Validators.max(999), Validators.min(1)]],
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
    var spinnerRef = this.spinnerService.start("Loading Service provider...");
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

    this.data.objectMessage.subscribe(res => this.providerDataList = res);
    this.onDisplay();
  }

  onDisplay(){
    if (this.providerDataList != undefined){
      var spinnerRef = this.spinnerService.start("Loading Service provider...");
      this.providerForm.reset({ ServiceId: '', Name: '', LocationId: '', CustomerPerBucket: '', Status: true});
      this.provider$ = this.providerService.getProvider(this.businessId, this.providerDataList).pipe(
        map(provider => {
          this.providerForm.setValue({
            ServiceId: provider.ServiceId,
            Name: provider.Name,
            LocationId: provider.LocationId,
            CustomerPerBucket: provider.CustomerPerBucket,
            Status: (provider.Status == 1 ? true : false)
          });
          this.spinnerService.stop(spinnerRef);
          return provider;
        }),
        catchError(err => {
          this.spinnerService.stop(spinnerRef);
          this.openDialog('Error !', err.Message, false, true, false);
          return throwError(err || err.Message);
        })
      );
    }
  }

  getErrorMessage(component: string){
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
    if (component === 'CustomerPerBucket'){
      return this.f.DatePoll.hasError('required') ? 'You must enter a value' :
        this.f.DatePoll.hasError('min') ? 'Minimun length 1':
          this.f.DatePoll.hasError('max') ? 'Maximun length 999' :
          '';
    }
  }

  onCancel(){
    this.providerForm.reset({ ServiceId: '', Name: '', LocationId: '', CustomerPerBucket: '', Status: true});
  }

  onSubmit(){
    if (this.providerForm.invalid) { return; }

    let dataForm = {
      ServiceId: this.providerForm.value.ServiceId,
      BusinessId: this.businessId,
      LocationId: this.providerForm.value.LocationId,
      Name: this.providerForm.value.Name,
      CustomerPerBucket: this.providerForm.value.CustomerPerBucket,
      Status: 1
    }

    var spinnerRef = this.spinnerService.start("Saving Service provider...");
    this.saveProvider$ =  this.providerService.postProviders(dataForm).pipe(
      map((res:any) => {
        if (res != null){
          if (res.Code == 200){
            this.spinnerService.stop(spinnerRef);
            this.providerForm.patchValue({ServiceId: res.ServiceId});
            // this.pollForm.reset({ PollId: '', Name: '', LocationId: '', DatePoll: '', DateFinPoll: '', Happy: 0, Neutral: 0, Angry: 0, Status: true});
            this.openDialog('Service provider', 'Saving successfully', true, false, false);
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
