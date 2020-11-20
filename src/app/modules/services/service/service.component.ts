import { Component, OnInit } from '@angular/core';
import { DialogComponent } from '@app/shared/dialog/dialog.component';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { Validators, FormBuilder, FormArray, FormGroup, ValidatorFn } from '@angular/forms';
import { AuthService } from '@app/core/services';
import { SpinnerService } from '@app/shared/spinner.service';
import { MonitorService } from '@app/shared/monitor.service';
import { ServService, BusinessService } from '@app/services';
import { ConfirmValidParentMatcher } from '@app/validators';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { GreaterThanValidator } from '@app/validators';
import { ActivatedRoute, Router } from '@angular/router';
import { ShopdialogComponent } from '@app/shared/shopdialog/shopdialog.component';
import { LearnDialogComponent } from '@app/shared/learn-dialog/learn-dialog.component';

@Component({
  selector: 'app-service',
  templateUrl: './service.component.html',
  styleUrls: ['./service.component.scss']
})
export class ServiceComponent implements OnInit {
  businessId: string = '';
  service$: Observable<any>;
  saveService$: Observable<any>; 
  appos$: Observable<any>;

  free: number = 0;
  invalid: number = 0;
  email: string = '';

  serviceDataList: string = '';
  palette: any[] = [];
  textStatus: string = '';
  
  // ,"EDEDED","FFF2CC","DDEBF7","8EA9DB","F4B084","C9C9C9","FFD966","9BC2E6","F2E5FF","FFFFB3","ABDBFF","FFC1EF","E2EFDA","CC99FF","FFFF00","47B0FF","FF6DD9","A9D08E"];

  confirmValidParentMatcher = new ConfirmValidParentMatcher();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private spinnerService: SpinnerService,
    private route: ActivatedRoute,
    private router: Router,
    private serviceService: ServService,
    private dialog: MatDialog,
    private learnmore: MatDialog,
    private businessService: BusinessService,
    private data: MonitorService
  ) { }

  get f(){
    return this.serviceForm.controls;
  }

  serviceForm = this.fb.group({
    ServiceId: [''],
    Name: ['', [Validators.required, Validators.maxLength(100), Validators.minLength(3)]],
    TimeService: ['', [Validators.required, Validators.max(4), Validators.min(1)]],
    CustomerPerTime: ['', [Validators.required, Validators.max(9999), Validators.min(1)]],
    CustomerPerBooking: ['', [Validators.required, Validators.max(9999), Validators.min(1)]],
    BufferTime: ['', [Validators.required, Validators.max(50), Validators.min(1)]],
    Color: ['', [Validators.required]],
    Status: [true]
  }, { validator: GreaterThanValidator });

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

  openShopDialog(header: string, message: string, business: string, email: string): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      header: header,
      message: message,
      businessId: business,
      email: email
    };
    dialogConfig.width = '280px';
    dialogConfig.minWidth = '280px';
    dialogConfig.maxWidth = '280px';
    this.dialog.open(ShopdialogComponent, dialogConfig);
  }

  openLearnMore(message: string): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      message: message
    };
    this.learnmore.open(LearnDialogComponent, dialogConfig);
  }
  
  ngOnInit(): void {
    this.data.handleData('Add');
    this.serviceDataList = this.route.snapshot.paramMap.get('serviceId');

    this.businessId = this.authService.businessId();
    this.email = this.authService.email();
    if (this.serviceDataList == "0"){
      this.appos$ = this.businessService.getBusinessAppos(this.businessId).pipe(
        map((res: any) => {
          if (res != null){
            this.free  = (res.Name.toString().toUpperCase() == 'FREE' || res.Name.toString().toUpperCase() == 'GRATIS' ? 1: 0); 
            if (this.free == 1){
              this.openShopDialog($localize`:@@shared.shopheader:`, $localize`:@@shared.shopmessage:`, this.businessId, this.email);
              this.router.navigate(['/services']);
            }
            return res;
          }
        }),
        catchError(err => {
          return err;
        })
      );
    }

    this.palette = [{id:"#D9E1F2",value:"#D9E1F2"},{id:"#FCE4D6",value:"#FCE4D6"},{id:"#EDEDED",value:"#EDEDED"},{id:"#FFF2CC",value:"#FFF2CC"},{id:"#DDEBF7",value:"#DDEBF7"},{id:"#8EA9DB",value:"#8EA9DB"},{id:"#F4B084",value:"#F4B084"},{id:"#C9C9C9",value:"#C9C9C9"},{id:"#FFD966",value:"#FFD966"},{id:"#9BC2E6",value:"#9BC2E6"},{id:"#F2E5FF",value:"#F2E5FF"},{id:"#FFFFB3",value:"#FFFFB3"},{id:"#ABDBFF",value:"#ABDBFF"},{id:"#FFC1EF",value:"#FFC1EF"},{id:"#E2EFDA",value:"#E2EFDA"},{id:"#CC99FF",value:"#CC99FF"},{id:"#FFFF00",value:"#FFFF00"},{id:"#47B0FF",value:"#47B0FF"},{id:"#FF6DD9",value:"#FF6DD9"},{id:"#A9D08E",value:"#A9D08E"}];
    this.onDisplay();
  }

  onDisplay(){
    if (this.serviceDataList != undefined && this.serviceDataList != "0"){
      var spinnerRef = this.spinnerService.start($localize`:@@services.loadingserv:`);
      this.serviceForm.reset({ ServiceId: '', Name: '', TimeService: '', BufferTime: '', CustomerPerTime: '', CustomerPerBooking: '', Color: '', Status: true});
      this.service$ = this.serviceService.getService(this.businessId, this.serviceDataList).pipe(
        map(res => {
          if (res != ''){
            this.serviceForm.setValue({
              ServiceId: res.ServiceId,
              Name: res.Name,
              TimeService: res.TimeService,
              CustomerPerBooking: res.CustomerPerBooking,
              CustomerPerTime: res.CustomerPerTime,
              BufferTime: res.BufferTime,
              Color: res.Color,
              Status: (res.Status == 1 ? true : false)
            });
            this.textStatus = (res.Status == 0 ? $localize`:@@shared.disabled:` : $localize`:@@shared.enabled:`);
          } else {
            this.invalid = 1;
          }
          this.spinnerService.stop(spinnerRef);
          return res;
        }),
        catchError(err => {
          this.spinnerService.stop(spinnerRef);
          this.openDialog($localize`:@@shared.error:`, err.Message, false, true, false);
          return throwError(err || err.Message);
        })
      );
    }
  }

  getErrorMessage(component: string){
    const val3 = '3';
    const val100 = '100';
    const val1 = '1';
    const val4 = '4';
    const val50 = '50';
    const val9999 = '9999';
    if (component === 'Name'){
      return this.f.Name.hasError('required') ? $localize`:@@shared.entervalue:` :
        this.f.Name.hasError('minlength') ? $localize`:@@shared.minimun: ${val3}` :
          this.f.Name.hasError('maxlength') ? $localize`:@@shared.maximun: ${val100}` :
            '';
    }
    if (component === 'TimeService'){
      return this.f.TimeService.hasError('required') ? $localize`:@@shared.entervalue:` :
        this.f.TimeService.hasError('min') ? $localize`:@@shared.minvalue: ${val1}` :
          this.f.TimeService.hasError('max') ? $localize`:@@shared.maxvalue: ${val4}` :
          '';
    }
    if (component === 'BufferTime'){
      return this.f.BufferTime.hasError('required') ? $localize`:@@shared.entervalue:` :
        this.f.BufferTime.hasError('min') ? $localize`:@@shared.minvalue: ${val1}` :
          this.f.BufferTime.hasError('max') ? $localize`:@@shared.maxvalue: ${val50}` :
          '';
    }
    if (component === 'CustomerPerTime'){
      return this.f.CustomerPerTime.hasError('required') ? $localize`:@@shared.entervalue:` :
        this.f.CustomerPerTime.hasError('min') ? $localize`:@@shared.minvalue: ${val1}`:
          this.f.CustomerPerTime.hasError('max') ? $localize`:@@shared.maxvalue: ${val9999}` :
          '';
    }
    if (component === 'CustomerPerBooking'){
      return this.f.CustomerPerBooking.hasError('required') ? $localize`:@@shared.entervalue:` :
        this.f.CustomerPerBooking.hasError('min') ? $localize`:@@shared.minvalue: ${val1}`:
          this.f.CustomerPerBooking.hasError('max') ? $localize`:@@shared.maxvalue: ${val9999}` :
            '';
    }
    if (component === 'GreaterThan'){
      const valVar = this.f.CustomerPerTime.value.toString();
      return this.serviceForm.hasError('greaterthan') ? $localize`:@@shared.maxvalue: ${valVar}`:
        '';
    }
    if (component === 'Color'){
      return this.f.Color.hasError('required') ? $localize`:@@shared.invalidselectvalue:` :
        '';
    }
  }

  onCancel(){
    this.router.navigate(['/services']);
  }

  onSubmit(){
    if (this.serviceForm.invalid) { return; }

    let dataForm = {
      ServiceId: this.serviceForm.value.ServiceId,
      BusinessId: this.businessId,
      TimeService: this.serviceForm.value.TimeService,
      BufferTime: this.serviceForm.value.BufferTime,
      Name: this.serviceForm.value.Name,
      CustomerPerTime: this.serviceForm.value.CustomerPerTime,
      CustomerPerBooking: this.serviceForm.value.CustomerPerBooking,
      Color: this.serviceForm.value.Color,
      Status: this.serviceForm.value.Status == true ? 1 : 0
    }

    var spinnerRef = this.spinnerService.start($localize`:@@services.savingserv:`);
    this.saveService$ =  this.serviceService.postServices(dataForm).pipe(
      map((res:any) => {
        if (res != null){
          if (res.Code == 200){
            this.spinnerService.stop(spinnerRef);
            this.serviceForm.patchValue({ServiceId: res.ServiceId});
            this.openDialog($localize`:@@services.service:`, $localize`:@@services.savingsuccess:`, true, false, false);
          } else {
            this.spinnerService.stop(spinnerRef);
            this.openDialog($localize`:@@shared.error:`, $localize`:@@shared.wrong:`, false, true, false);
          }
          this.router.navigate(['/services']);
        } else {
          this.spinnerService.stop(spinnerRef);
          this.openDialog($localize`:@@shared.error:`, $localize`:@@shared.wrong:`, false, true, false);
        }
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        this.openDialog($localize`:@@shared.error:`, err.Message, false, true, false);
        return throwError (err || err.message);
      })
    );
  }

  learnMore(textNumber: number){
    let message = '';
    switch(textNumber) { 
      case 22: { 
        message = $localize`:@@learnMore.LMCON22:`;
        break; 
      } 
      case 23: { 
        message = $localize`:@@learnMore.LMCON23:`;
        break; 
      }
      case 24: { 
        message = $localize`:@@learnMore.LMCON24:`; 
        break; 
      }
      case 25: { 
        message = $localize`:@@learnMore.LMCON25:`;
        break; 
      }
      case 45: { 
        message = $localize`:@@learnMore.LMCON45:`;
        break; 
      }
      default: { 
        message = ''; 
        break; 
      } 
    } 
    this.openLearnMore(message);
  }
}
