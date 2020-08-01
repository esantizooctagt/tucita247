import { Component, OnInit } from '@angular/core';
import { DialogComponent } from '@app/shared/dialog/dialog.component';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { Validators, FormBuilder, FormArray } from '@angular/forms';
import { AuthService } from '@app/core/services';
import { SpinnerService } from '@app/shared/spinner.service';
import { MonitorService } from '@app/shared/monitor.service';
import { ServService } from '@app/services';
import { ConfirmValidParentMatcher } from '@app/validators';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-service',
  templateUrl: './service.component.html',
  styleUrls: ['./service.component.scss']
})
export class ServiceComponent implements OnInit {
  businessId: string = '';
  service$: Observable<any>;
  saveService$: Observable<any>; 
  serviceDataList: any;

  confirmValidParentMatcher = new ConfirmValidParentMatcher();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private spinnerService: SpinnerService,
    private serviceService: ServService,
    private dialog: MatDialog,
    private data: MonitorService
  ) { }

  get f(){
    return this.serviceForm.controls;
  }

  serviceForm = this.fb.group({
    ServiceId: [''],
    Name: ['', [Validators.required, Validators.maxLength(100), Validators.minLength(3)]],
    TimeService: ['', [Validators.required, Validators.max(999), Validators.min(1)]],
    CustomerPerTime: ['', [Validators.required, Validators.max(999), Validators.min(1)]],
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
    this.businessId = this.authService.businessId();

    this.data.objectMessage.subscribe(res => this.serviceDataList = res);
    this.onDisplay();
  }

  onDisplay(){
    if (this.serviceDataList != undefined){
      var spinnerRef = this.spinnerService.start("Loading Service...");
      this.serviceForm.reset({ ServiceId: '', Name: '', TimeService: '', CustomerPerTime: '', Status: true});
      this.service$ = this.serviceService.getService(this.businessId, this.serviceDataList).pipe(
        map(res => {
          this.serviceForm.setValue({
            ServiceId: res.ServiceId,
            Name: res.Name,
            TimeService: res.TimeService,
            CustomerPerTime: res.CustomerPerTime,
            Status: (res.Status == 1 ? true : false)
          });
          this.spinnerService.stop(spinnerRef);
          return res;
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
    if (component === 'TimeService'){
      return this.f.TimeService.hasError('required') ? 'You must enter a value' :
        this.f.TimeService.hasError('min') ? 'Minimun length 1':
          this.f.TimeService.hasError('max') ? 'Maximun length 999' :
          '';
    }
    if (component === 'CustomerPerTime'){
      return this.f.CustomerPerTime.hasError('required') ? 'You must enter a value' :
        this.f.CustomerPerTime.hasError('min') ? 'Minimun length 1':
          this.f.CustomerPerTime.hasError('max') ? 'Maximun length 999' :
          '';
    }
  }

  onCancel(){
    this.serviceForm.reset({ ServiceId: '', Name: '', TimeService: '', CustomerPerTime: '', Status: true});
  }

  onSubmit(){
    if (this.serviceForm.invalid) { return; }

    let dataForm = {
      ServiceId: this.serviceForm.value.ServiceId,
      BusinessId: this.businessId,
      TimeService: this.serviceForm.value.TimeService,
      Name: this.serviceForm.value.Name,
      CustomerPerTime: this.serviceForm.value.CustomerPerTime,
      Status: this.serviceForm.value.Status == true ? 1 : 0
    }

    var spinnerRef = this.spinnerService.start("Saving Service...");
    this.saveService$ =  this.serviceService.postServices(dataForm).pipe(
      map((res:any) => {
        if (res != null){
          if (res.Code == 200){
            this.spinnerService.stop(spinnerRef);
            this.serviceForm.patchValue({ServiceId: res.ServiceId});
            this.openDialog('Service', 'Saving successfully', true, false, false);
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
