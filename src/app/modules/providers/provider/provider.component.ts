import { Component, OnInit } from '@angular/core';
import { DialogComponent } from '@app/shared/dialog/dialog.component';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { Validators, FormBuilder, FormArray, FormGroup } from '@angular/forms';
import { AuthService } from '@app/core/services';
import { SpinnerService } from '@app/shared/spinner.service';
import { MonitorService } from '@app/shared/monitor.service';
import { LocationService, ProviderService, ServService, BusinessService } from '@app/services';
import { ConfirmValidParentMatcher } from '@app/validators';
import { Observable, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { ShopdialogComponent } from '@app/shared/shopdialog/shopdialog.component';
import { LearnDialogComponent } from '@app/shared/learn-dialog/learn-dialog.component';

@Component({
  selector: 'app-provider',
  templateUrl: './provider.component.html',
  styleUrls: ['./provider.component.scss']
})
export class ProviderComponent implements OnInit {
  businessId: string = '';
  locs$: Observable<any[]>;
  services: any[] = [];
  provider$: Observable<any>;
  services$: Observable<any>;
  servProvider$: Observable<any>;
  saveProvider$: Observable<any>; 
  appos$: Observable<any>;
  providerDataList: string='';
  textStatus: string='';
  invalid: number = 0;
  free: number = 0;
  email: string = '';
  errorServices: string = '';

  confirmValidParentMatcher = new ConfirmValidParentMatcher();

  constructor(
    private fb: FormBuilder,
    private _snackBar: MatSnackBar,
    private authService: AuthService,
    private spinnerService: SpinnerService,
    private providerService: ProviderService,
    private serviceService: ServService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private learnmore: MatDialog,
    private data: MonitorService,
    private businessService: BusinessService,
    private locationService: LocationService
  ) { }

  get f(){
    return this.providerForm.controls;
  }

  get g(): FormArray {
    return this.providerForm.get('Services') as FormArray;
  }

  providerForm = this.fb.group({
    ProviderId: [''],
    Name: ['', [Validators.required, Validators.maxLength(100), Validators.minLength(3)]],
    LocationId: ['', [Validators.required]],
    Services: this.fb.array([this.createService()]),
    Status: [true]
  });

  createService(): FormGroup {
    const access = this.fb.group({
      ServiceId: [''],
      Name: [''],
      BufferTime: [''],
      CustomerPerBooking: [''],
      TimeService: [''],
      Selected: ['0']
    });
    return access;
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
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

  openLearnMore(message: string): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      message: message
    };
    this.learnmore.open(LearnDialogComponent, dialogConfig);
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
  
  ngOnInit(): void {
    this.data.handleData('Add');
    this.businessId = this.authService.businessId();
    this.email = this.authService.email();
    this.providerDataList = this.route.snapshot.paramMap.get('providerId');
    
    var spinnerRef = this.spinnerService.start($localize`:@@providers.loadserviceprov:`);
    if (this.providerDataList == "0"){
      this.appos$ = this.businessService.getBusinessAppos(this.businessId).pipe(
        map((res: any) => {
          if (res != null){
            this.free  = (res.Name.toString().toUpperCase() == 'FREE' || res.Name.toString().toUpperCase() == 'GRATIS' ? 1: 0); 
            if (this.free == 1){
              this.spinnerService.stop(spinnerRef);
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

    this.services$ = this.serviceService.getServicesProvider(this.businessId, '_').pipe(
      map((res: any) =>{
        this.services = res.services;
        this.providerForm.setControl('Services', this.setExistingServices(res.services));
        return res.services;
      }),
      catchError(err => {
        return throwError(err || err.message);
      })
    );

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

    this.onDisplay();
  }

  setExistingServices(servs: any[]){
    const formArray = new FormArray([]);
    servs.forEach(service => {
      formArray.push(
        this.fb.group({
          ServiceId: service.ServiceId,
          Name: service.Name,
          BufferTime: service.BufferTime,
          CustomerPerBooking: service.CustomerPerBooking,
          TimeService: service.TimeService,
          Selected: service.Selected
        }));
    })
    return formArray;
  }

  onDisplay(){
    if (this.providerDataList != undefined && this.providerDataList != "0"){
      let provId = '';
      var spinnerRef = this.spinnerService.start($localize`:@@providers.loadserviceprov:`);
      this.providerForm.reset({ ProviderId: '', Name: '', LocationId: '', Status: true});
      this.provider$ = this.providerService.getProvider(this.businessId, this.providerDataList).pipe(
        map((res: any) => {
          if (res.Code == 200){
            let provider = res.Data;
            if (provider.ProviderId != undefined){
              this.providerForm.patchValue({
                ProviderId: provider.ProviderId,
                Name: provider.Name,
                LocationId: provider.LocationId,
                Status: (provider.Status == 1 ? true : false)
              });
              provId = provider.ProviderId;
              this.textStatus = (provider.Status == 0 ? $localize`:@@shared.disabled:` : $localize`:@@shared.enabled:`);
            } else {
              this.invalid = 1;
              provId='_';
            }
            this.spinnerService.stop(spinnerRef);
            return provider;
          }
        }),
        switchMap(_ => this.serviceService.getServicesProvider(this.businessId, provId).pipe(
          map((res: any) =>{
            this.services = res.services;
            this.providerForm.patchValue({Services: this.services});
            return res.services;
          })
        )),
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
    if (component === 'Name'){
      return this.f.Name.hasError('required') ? $localize`:@@shared.entervalue:` :
        this.f.Name.hasError('minlength') ? $localize`:@@shared.minimun: ${val3}`:
          this.f.Name.hasError('maxlength') ? $localize`:@@shared.maximun: ${val100}` :
            '';
    }
    if (component === 'LocationId'){
      return this.f.LocationId.hasError('required') ? $localize`:@@shared.invalidselectvalue:` :
        '';
    }
  }

  onCancel(){
    this.router.navigate(['/providers']);
  }

  onSubmit(){
    if (this.providerForm.invalid) { return; }

    this.errorServices = '';
    let numberRecords = this.providerForm.value.Services.filter((s: any)=> s.Selected > 0);
    if (numberRecords[0] == undefined) {
      this.errorServices = $localize`:@@providers.serviceItems:`
      return;
    }

    let dataForm = {
      ProviderId: this.providerForm.value.ProviderId,
      BusinessId: this.businessId,
      LocationId: this.providerForm.value.LocationId,
      Name: this.providerForm.value.Name,
      Status: this.providerForm.value.Status == true ? 1 : 0,
      Services: this.providerForm.value.Services
    }
    // this.servProvider$ = this.serviceService.putServiceProvider(this.businessId, this.providerForm.value.ProviderId, servId, activo)
    var spinnerRef = this.spinnerService.start($localize`:@@providers.savingprovider:`);
    // let provId = '';
    this.saveProvider$ =  this.providerService.postProviders(dataForm).pipe(
      map((res:any) => {
        if (res != null){
          if (res.Code == 200){
            this.spinnerService.stop(spinnerRef);
            // this.providerForm.patchValue({ProviderId: res.ProviderId});
            // provId = res.ProviderId;
            this.openDialog($localize`:@@providers.servprovider:`, $localize`:@@providers.savingserviprov:`, true, false, false);
          } else {
            this.spinnerService.stop(spinnerRef);
            this.openDialog($localize`:@@shared.error:`, $localize`:@@shared.wrong:`, false, true, false);
          }
          this.router.navigate(['/providers']);
        } else {
          this.spinnerService.stop(spinnerRef);
          this.openDialog($localize`:@@shared.error:`, $localize`:@@shared.wrong:`, false, true, false);
        }
      }),
      // switchMap(_ => this.serviceService.getServicesProvider(this.businessId, provId).pipe(
      //   map((res: any) =>{
      //     this.services = res.services;
      //     return res.services;
      //   })
      // )),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        this.openDialog($localize`:@@shared.error:`, err.Message, false, true, false);
        return throwError (err || err.message);
      })
    );
  }

  onSelectService(serviceId, selected, index){
    let servs =  this.providerForm.get('Services') as FormArray;
    let item = servs.at(index);
    if (item.value.ServiceId == serviceId){
      item.patchValue({Selected: (selected == 0 ? 1 : 0)});
    }
    return;
  }

  learnMore(textNumber: number){
    let message = '';
    switch(textNumber) {
      case 19: { 
        message = $localize`:@@learnMore.LMCON19:`;
        break; 
      }
      case 20: { 
        message = $localize`:@@learnMore.LMCON20:`; 
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
