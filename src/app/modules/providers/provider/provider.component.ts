import { Component, OnInit } from '@angular/core';
import { DialogComponent } from '@app/shared/dialog/dialog.component';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { Validators, FormBuilder, FormArray } from '@angular/forms';
import { AuthService } from '@app/core/services';
import { SpinnerService } from '@app/shared/spinner.service';
import { MonitorService } from '@app/shared/monitor.service';
import { LocationService, ProviderService, ServService } from '@app/services';
import { ConfirmValidParentMatcher } from '@app/validators';
import { Observable, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  providerDataList: any;

  confirmValidParentMatcher = new ConfirmValidParentMatcher();

  constructor(
    private fb: FormBuilder,
    private _snackBar: MatSnackBar,
    private authService: AuthService,
    private spinnerService: SpinnerService,
    private providerService: ProviderService,
    private serviceService: ServService,
    private dialog: MatDialog,
    private data: MonitorService,
    private locationService: LocationService
  ) { }

  get f(){
    return this.providerForm.controls;
  }

  providerForm = this.fb.group({
    ProviderId: [''],
    Name: ['', [Validators.required, Validators.maxLength(100), Validators.minLength(3)]],
    LocationId: ['', [Validators.required]],
    Status: [true]
  });

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

  ngOnInit(): void {
    var spinnerRef = this.spinnerService.start($localize`:@@providers.loadserviceprov:`);
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
      let provId = '';
      var spinnerRef = this.spinnerService.start($localize`:@@providers.loadserviceprov:`);
      this.providerForm.reset({ ProviderId: '', Name: '', LocationId: '', Status: true});
      this.provider$ = this.providerService.getProvider(this.businessId, this.providerDataList).pipe(
        map((res: any) => {
          if (res.Code == 200){
            let provider = res.Data;
            this.providerForm.setValue({
              ProviderId: provider.ProviderId,
              Name: provider.Name,
              LocationId: provider.LocationId,
              Status: (provider.Status == 1 ? true : false)
            });
            provId = provider.ProviderId;
            this.spinnerService.stop(spinnerRef);
            return provider;
          }
        }),
        switchMap(_ => this.serviceService.getServicesProvider(this.businessId, provId).pipe(
          map((res: any) =>{
            this.services = res.services;
            return res.services;
          })
        )),
        catchError(err => {
          this.spinnerService.stop(spinnerRef);
          this.openDialog($localize`:@@shared.error:`, err.Message, false, true, false);
          return throwError(err || err.Message);
        })
      );
    } else {
      this.services$ = this.serviceService.getServicesProvider(this.businessId, '_').pipe(
        map((res: any) =>{
          this.services = res.services;
          return res.services;
        }),
        catchError(err => {
          return throwError(err || err.message);
        })
      );
    }
  }

  getErrorMessage(component: string){
    if (component === 'Name'){
      return this.f.Name.hasError('required') ? $localize`:@@shared.entervalue:` :
        this.f.Name.hasError('minlength') ? $localize`:@@shared.minimun: 3`:
          this.f.Name.hasError('maxlength') ? $localize`:@@shared.maximun: 100` :
            '';
    }
    if (component === 'LocationId'){
      return this.f.LocationId.hasError('required') ? $localize`:@@shared.invalidselectvalue:` :
        '';
    }
  }

  onCancel(){
    this.providerForm.reset({ ProviderId: '', Name: '', LocationId: '', Status: true});
  }

  onSubmit(){
    if (this.providerForm.invalid) { return; }

    let dataForm = {
      ProviderId: this.providerForm.value.ProviderId,
      BusinessId: this.businessId,
      LocationId: this.providerForm.value.LocationId,
      Name: this.providerForm.value.Name,
      Status: this.providerForm.value.Status == true ? 1 : 0
    }

    var spinnerRef = this.spinnerService.start("Saving Service provider...");
    let provId = '';
    this.saveProvider$ =  this.providerService.postProviders(dataForm).pipe(
      map((res:any) => {
        if (res != null){
          if (res.Code == 200){
            this.spinnerService.stop(spinnerRef);
            this.providerForm.patchValue({ProviderId: res.ProviderId});
            provId = res.ProviderId;
            this.openDialog($localize`:@@providers.servprovider:`, $localize`:@@providers.savingserviprov:`, true, false, false);
          } else {
            this.spinnerService.stop(spinnerRef);
            this.openDialog($localize`:@@shared.error:`, $localize`:@@shared.wrong:`, false, true, false);
          }
        } else {
          this.spinnerService.stop(spinnerRef);
          this.openDialog($localize`:@@shared.error:`, $localize`:@@shared.wrong:`, false, true, false);
        }
      }),
      switchMap(_ => this.serviceService.getServicesProvider(this.businessId, provId).pipe(
        map((res: any) =>{
          this.services = res.services;
          return res.services;
        })
      )),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        this.openDialog($localize`:@@shared.error:`, err.Message, false, true, false);
        return throwError (err || err.message);
      })
    );
  }

  onSelectService(event){
    let servId = event.option.value;
    let activo = (event.option.selected == true ? 1 : 0);
    
    if (servId == '') {return;}
    
    this.servProvider$ = this.serviceService.putServiceProvider(this.businessId, this.providerForm.value.ProviderId, servId, activo).pipe(
      map((res: any) => {
        if (res.Code == 200){
          if (activo == 1){
            this.openSnackBar($localize`:@@providers.servadded:`,$localize`:@@providers.servprovider:`);
          } else {
            this.openSnackBar($localize`:@@providers.servremove:`,$localize`:@@providers.servprovider:`);
          }
        }
      }),
      catchError(err => {
        this.openSnackBar($localize`:@@shared.wrong:`,$localize`:@@providers.servprovider:`);
        return err;
      })
    );
  }
}
