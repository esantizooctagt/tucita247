import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LocationService, BusinessService, ServService } from '@app/services';
import { AuthService } from '@app/core/services';
import { SpinnerService } from '@app/shared/spinner.service';
import { map, catchError, switchMap, mergeMap } from 'rxjs/operators';
import { AppointmentService } from '@app/services/appointment.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from '@app/shared/dialog/dialog.component';
import { VideoDialogComponent } from '@app/shared/video-dialog/video-dialog.component';
import { Router } from '@angular/router';
import { DirDialogComponent } from '@app/shared/dir-dialog/dir-dialog.component';
import { FormBuilder, Validators } from '@angular/forms';
import { ConfirmValidParentMatcher } from '@app/validators';

@Component({
  selector: 'app-quick-checkin',
  templateUrl: './quick-checkin.component.html',
  styleUrls: ['./quick-checkin.component.scss']
})
export class QuickCheckinComponent implements OnInit {
  qrCode: string = '';
  businessId: string  = '';
  locationId: string = '';
  providerId: string = '';
  doorId: string = '';
  onError: string = '';
  userId: string = '';

  locationStatus: number = 0;
  bucketInterval: number = 0;
  currHour: number = 0;
  prevHour: number = 0;
  firstHour: number = 0;
  closedLoc: number = 0;
  qtyPeople: number = 0;
  perLocation: number = 0;
  totLocation: number = 0;
  textOpenLocation: string = '';
  buckets=[];

  showCard: boolean =false;

  Locs$: Observable<any>;
  getWalkIns$: Observable<any[]>;
  check$: Observable<any>;
  newAppointment$: Observable<any>;
  manualCheckOut$: Observable<any>;
  getLocInfo$: Observable<any>;
  openLoc$: Observable<any>;
  closedLoc$: Observable<any>;

  Providers: any[] = [];
  services: []=[];

  get f(){
    return this.clientForm.controls;
  }

  confirmValidParentMatcher = new ConfirmValidParentMatcher();

  constructor(
    private spinnerService: SpinnerService,
    private _snackBar: MatSnackBar,
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private businessService: BusinessService,
    private locationService: LocationService,
    private serviceService: ServService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private router: Router
  ) { }

  clientForm = this.fb.group({
    Phone: ['',[Validators.maxLength(17)]],
    Name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    ServiceId: ['', [Validators.required]],
    Email: ['', [Validators.maxLength(200), Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]],
    DOB: [''],
    Gender: [''],
    Preference: [''],
    Disability: [''],
    Guests: ['1', [Validators.required, Validators.max(99), Validators.min(1)]]
  })

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
    this.businessId = this.authService.businessId();
    this.userId = this.authService.userId();

    var spinnerRef = this.spinnerService.start($localize`:@@lite.loadlocs:`);
    this.Locs$ = this.appointmentService.getHostLocations(this.businessId, this.userId).pipe(
      map((res: any) => {
        if (res.Locs != null){
          this.locationId = res.Locs.LocationId;
          this.doorId = res.Locs.Door;
          this.Providers = res.Locs.Providers;
          this.totLocation = res.Locs.MaxCustomers;
          if (this.Providers.length > 0){
            this.locationStatus = res.Locs.Providers[0].Open;
            this.closedLoc = res.Locs.Providers[0].Closed;
            this.providerId = res.Locs.Providers[0].ProviderId;
            this.textOpenLocation = (this.locationStatus == 0 ? $localize`:@@host.locclosed:` : (this.closedLoc == 1 ? $localize`:@@host.loccopenandclosed:` : $localize`:@@host.locopen:`));
          }
          this.spinnerService.stop(spinnerRef);
          return res;
        } else {
          this.spinnerService.stop(spinnerRef);
          this.openDialog($localize`:@@shared.error:`, $localize`:@@lite.locsassigned:`, false, true, false);
          this.router.navigate(['/']);
          return;
        }
      }),
      switchMap(val => val = this.serviceService.getServicesProvider(this.businessId, this.providerId).pipe(
        map((res: any) =>{
          this.services = res.services.filter(x => x.Selected === 1);
          return res;
        })
        )
      ),
      switchMap(v => this.locationService.getLocationQuantity(this.businessId, this.locationId).pipe(
        map((res: any) => {
          if (res != null){
            this.qtyPeople = res.Quantity;
            this.perLocation = (+this.qtyPeople / +this.totLocation)*100;
            return res.Quantity.toString();
          }
        })
      )),
      switchMap(val => val = this.businessService.getBusinessOpeHours(this.businessId, this.locationId, this.providerId)),
      map((res: any) => {
        if (res.Code == 200) {
          this.bucketInterval = 1; //parseFloat(res.BucketInterval);
          this.currHour = parseFloat(res.CurrHour);
          let hours = res.Hours;
          this.buckets = [];
          for (var i=0; i<=hours.length-1; i++){
            let horaIni = parseFloat(hours[i].HoraIni);
            let horaFin = parseFloat(hours[i].HoraFin);
            if (i ==0){
              this.firstHour = horaIni;
            }
            for (var x=horaIni; x<=horaFin; x+=this.bucketInterval){
              let hora = '';
              if (x % 1 != 0){
                hora = (x - (x%1)).toString().padStart(2,'0') + ':30';
              } else {
                hora = x.toString().padStart(2, '0') + ':00';
              }
              this.buckets.push({ TimeFormat: hora, Time: x });
              if (x == this.currHour) {
                if (x-this.bucketInterval>= horaIni){
                  this.prevHour = this.currHour-this.bucketInterval;
                }
              }
            }
          }
          this.spinnerService.stop(spinnerRef);
        } else {
          this.spinnerService.stop(spinnerRef);
          return;
        }
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        this.onError = err.Message;
        return '0';
      })
    );
  }

  checkOutQR(){
    const dialogRef = this.dialog.open(VideoDialogComponent, {
      width: '450px',
      height: '660px',
      data: {guests: 0, title: $localize`:@@host.checkoutpop:`, tipo: 2}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result != undefined) {
        let qtyGuests = result.Guests;
        this.qrCode = result.qrCode;
        if  (this.qrCode != ''){
          this.checkOutAppointment(this.qrCode);
        } 
        if (qtyGuests > 0 && this.qrCode == '') {
          this.setManualCheckOut(qtyGuests);
        }
      }
    });
  }

  setManualCheckOut(qtyOut){
    this.manualCheckOut$ = this.appointmentService.updateManualCheckOut(this.businessId, this.locationId, this.providerId, qtyOut).pipe(
      map((res: any) => {
        if (res.Code == 200){
          this.openSnackBar($localize`:@@lite.checkoutsuccess:`, $localize`:@@host.checkoutpop:`);
        }
      }),
      switchMap(v => this.locationService.getLocationQuantity(this.businessId, this.locationId).pipe(
        map((res: any) => {
          if (res != null){
            this.qtyPeople = res.Quantity;
            this.perLocation = (+this.qtyPeople / +this.totLocation)*100;
            return res.Quantity.toString();
          }
        })
      )),
      catchError(err => {
        this.onError = err.Message;
        this.openSnackBar($localize`:@@shared.wrong:`, $localize`:@@host.checkoutpop:`);
        return this.onError;
      })
    );
  }

  checkOutAppointment(qrCode: string){
    let formData = {
      Status: 4,
      qrCode: qrCode,
      BusinessId: this.businessId,
      LocationId: this.locationId,
      ProviderId: this.providerId
    }
    this.check$ = this.appointmentService.updateAppointmentCheckOut(formData).pipe(
      map((res: any) => {
        if (res.Code == 200){
          this.openSnackBar($localize`:@@host.checkoutsuccess:`, $localize`:@@host.checkoutpop:`);
        }
      }),
      switchMap(v => this.locationService.getLocationQuantity(this.businessId, this.locationId).pipe(
        map((res: any) => {
          if (res != null){
            this.qtyPeople = res.Quantity;
            this.perLocation = (+this.qtyPeople / +this.totLocation)*100;
            return res.Quantity.toString();
          }
        })
      )),
      catchError(err => {
        if (err.Status == 404){
          this.openSnackBar($localize`:@@host.invalidqrcode:`,$localize`:@@host.checkoutpop:`);
          return err.Message;
        }
        this.onError = err.Message;
        this.openSnackBar($localize`:@@shared.wrong:`,$localize`:@@host.checkoutpop:`);
        return this.onError;
      })
    );
  }

  onCheckInApp(){
    //READ QR CODE AND CHECK-IN PROCESS
    const dialogRef = this.dialog.open(VideoDialogComponent, {
      width: '450px',
      height: '660px',
      data: {guests: 0, title: $localize`:@@host.checkintitle:`, tipo: 3 }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result != undefined) {
        this.qrCode = result.qrCode;
        let guestsAppo = result.Guests;
        if (this.qrCode != '' && guestsAppo > 0){
          this.checkInAppointment(this.qrCode, guestsAppo);
        }
      }
    });
  }

  checkInAppointment(qrCode: string, guests: number){
    let formData = {
      Status: 3,
      qrCode: qrCode,
      Guests: guests,
      BusinessId: this.businessId,
      LocationId: this.locationId,
      ProviderId: this.providerId
    }
    this.check$ = this.appointmentService.updateAppointmentCheckInQR(qrCode, formData).pipe(
      map((res: any) => {
        if (res.Code == 200){
          this.openSnackBar($localize`:@@host.checkinsuccess:`,$localize`:@@host.checkintitle:`);
        }
      }),
      switchMap(v => this.locationService.getLocationQuantity(this.businessId, this.locationId).pipe(
        map((res: any) => {
          if (res != null){
            this.qtyPeople = res.Quantity;
            this.perLocation = (+this.qtyPeople / +this.totLocation)*100;
            return res.Quantity.toString();
          }
        })
      )),
      catchError(err => {
        if (err.Status == 404){
          this.openSnackBar($localize`:@@host.invalidqrcode:`,$localize`:@@host.checkintitle:`);
          return err.Message;
        }
        this.onError = err.Message;
        this.openSnackBar($localize`:@@shared.wrong:`,$localize`:@@host.checkintitle:`);
        return this.onError;
      })
    );
  }

  getErrorMessage(component: string){
    const val200 = '200';
    const val3 = '3';
    const val100 = '100';
    const val6 = '6';
    const val14 = '14';
    const val2 = '2';
    const val1 = '1';
    const val99 = '99';
    if (component === 'Email'){
      return this.f.Email.hasError('required') ? $localize`:@@login.error:` :
        this.f.Email.hasError('maxlength') ? $localize`:@@shared.maximun: ${val200}` :
          this.f.Email.hasError('pattern') ? $localize`:@@forgot.emailformat:` :
          '';
    }
    if (component === 'Name'){
      return this.f.Name.hasError('required') ? $localize`:@@shared.entervalue:` :
        this.f.Name.hasError('minlength') ? $localize`:@@shared.minimun: ${val3}` :
          this.f.Name.hasError('maxlength') ? $localize`:@@shared.maximun: ${val100}` :
            '';
    }
    if (component === 'ServiceId'){
      return this.f.ServiceId.hasError('required') ? $localize`:@@shared.invalidselectvalue:` :
            '';
    }
    if (component === 'Phone'){
      return this.f.Phone.hasError('minlength') ? $localize`:@@shared.minimun: ${val6}` :
        this.f.Phone.hasError('maxlength') ? $localize`:@@shared.maximun: ${val14}` :
          '';
    }
    if (component === 'Guests'){
      return this.f.Guests.hasError('required') ? $localize`:@@shared.entervalue:` :
      this.f.Guests.hasError('maxlength') ? $localize`:@@shared.maximun: ${val2}` :
        this.f.Guests.hasError('min') ? $localize`:@@shared.minvalue: ${val1}` :
          this.f.Guests.hasError('max') ? $localize`:@@shared.maxvalue: ${val99}` :
            '';
    }
  }

  onCancelAddAppointment(){
    this.clientForm.reset({Phone:'', Name:'', ServiceId:'', Email:'', DOB:'', Gender:'', Preference:'', Disability:'', Guests: 1});
    this.showCard = false;
  }

  addAppointment(){
    //AGREGAR WALK IN Y APPOINTMENT
    let dobClient: Date = this.clientForm.value.DOB;
    let dob: string = '';
    if (dobClient.toString() == '') {
      dob = '';
    } else {
      let month = (dobClient.getMonth()+1).toString().padStart(2, '0'); 
      let day = dobClient.getDate().toString().padStart(2, '0');
      dob = dobClient.getUTCFullYear().toString() + '-' + month + '-' + day;
    }
    let phoneNumber = this.clientForm.value.Phone.toString().replace( /\D+/g, '');
    let yearCurr = this.getYear();
    let monthCurr = this.getMonth();
    let dayCurr = this.getDay();
    let dateAppo = yearCurr + '-' + monthCurr + '-' + dayCurr;
    let timeAppo = this.getTime();
    let formData = {
      BusinessId: this.businessId,
      LocationId: this.locationId,
      ProviderId: this.providerId,
      ServiceId: this.clientForm.value.ServiceId,
      Door: this.doorId,
      Phone: (phoneNumber == '' ?  '00000000000' : (phoneNumber.length <= 10 ? '1' + phoneNumber : phoneNumber)),
      Name: this.clientForm.value.Name,
      Email: (this.clientForm.value.Email == '' ? '' : this.clientForm.value.Email),
      DOB: dob,
      Gender: (this.clientForm.value.Gender == '' ? '': this.clientForm.value.Gender),
      Preference: (this.clientForm.value.Preference == '' ? '': this.clientForm.value.Preference),
      Disability: (this.clientForm.value.Disability == null ? '': this.clientForm.value.Disability),
      Guests: this.clientForm.value.Guests,
      Status: 3,
      AppoDate: dateAppo,
      AppoHour: timeAppo,
      Type: 2
    }
    var spinnerRef = this.spinnerService.start($localize`:@@lite.addingbook:`);
    this.newAppointment$ = this.appointmentService.postNewAppointment(formData).pipe(
      map((res: any) => {
        this.spinnerService.stop(spinnerRef);
        this.clientForm.reset({Phone:'', Name:'', ServiceId:'', Email:'', DOB:'', Gender:'', Preference:'', Disability:'', Guests: 1});
        this.showCard = false;
        this.openSnackBar($localize`:@@lite.walkinadded:`,$localize`:@@host.checkintitle:`);
        return res.Code;
      }),
      switchMap((res: any) => {
        res = this.locationService.getLocationQuantity(this.businessId, this.locationId);
        return res;
      }),
      map((res: any) => {
        this.qtyPeople = res.Quantity;
        this.perLocation = (+this.qtyPeople / +this.totLocation)*100;
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        this.onError = err.Message;
        this.openSnackBar($localize`:@@shared.wrong:`, $localize`:@@host.checkintitle:`);
        return this.onError;
      })
    );
  }

  getWalkInsCheckOut(){
    let yearCurr = this.getYear();
    let monthCurr = this.getMonth();
    let dayCurr = this.getDay();
    let dateAppo = yearCurr + '-' + monthCurr + '-' + dayCurr;

    var spinnerRef = this.spinnerService.start($localize`:@@lite.loadingwalkins:`);
    this.getWalkIns$ = this.locationService.getWalkInsCheckOut(this.businessId, this.locationId, dateAppo).pipe(
      map((res: any) => {
        if (res.Code == 200){
          this.spinnerService.stop(spinnerRef);

          const dialogConfig = new MatDialogConfig();
          dialogConfig.data = { 
            walkIns : res['Appos'],
            businessId: this.businessId,
            locationId: this.locationId
          };
          dialogConfig.width ='80%';
          dialogConfig.minWidth = '80%';
          dialogConfig.height = '600px';
          this.dialog.open(DirDialogComponent, dialogConfig);

          return res.Appos;
        }
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        this.onError = err.Message;
        return this.onError;
      })
    );
  }

  locationStatusChange(){
    if (this.locationStatus == 1){
      this.closedLocation();
    } else {
      this.openLocation();
    }
  }

  onServiceChange(event){
    let res = this.Providers.filter(val => val.ProviderId == event.value);
    if (res.length > 0){
      this.locationStatus = res[0].Open;
      this.closedLoc = res[0].Closed;
      this.providerId = res[0].ProviderId;
      this.textOpenLocation = (this.locationStatus == 0 ? $localize`:@@host.locclosed:` : (this.closedLoc == 1 ? $localize`:@@host.loccopenandclosed:` : $localize`:@@host.locopen:`));
    }
    var spinnerRef = this.spinnerService.start($localize`:@@host.loadinglocs:`);
    this.getLocInfo$ = this.businessService.getBusinessOpeHours(this.businessId, this.locationId, this.providerId).pipe(
      map((res: any) => {
        if (res.Code == 200) {
          this.bucketInterval = 1; // parseFloat(res.BucketInterval);
          this.currHour = parseFloat(res.CurrHour);
          let hours = res.Hours;
          this.buckets = [];
          for (var i=0; i<=hours.length-1; i++){
            let horaIni = parseFloat(hours[i].HoraIni);
            let horaFin = parseFloat(hours[i].HoraFin);
            if (i ==0){
              this.firstHour = horaIni;
            }
            for (var x=horaIni; x<=horaFin; x+=this.bucketInterval){
              let hora = '';
              if (x % 1 != 0){
                hora = (x - (x%1)).toString().padStart(2,'0') + ':30';
              } else {
                hora = x.toString().padStart(2, '0') + ':00';
              }
              this.buckets.push({ TimeFormat: hora, Time: x });
              if (x == this.currHour) {
                if (x-this.bucketInterval>= horaIni){
                  this.prevHour = this.currHour-this.bucketInterval;
                }
              }
            }
          }
          this.spinnerService.stop(spinnerRef);
        } else {
          this.spinnerService.stop(spinnerRef);
          return;
        }
      }),
      switchMap(val => this.serviceService.getServicesProvider(this.businessId, this.providerId).pipe(
        map((res: any) =>{
          this.services = res.services.filter(x => x.Selected === 1);
          return res;
        })
        )
      ),
      switchMap((value: any) => {
        value = this.locationService.getLocationQuantity(this.businessId, this.locationId);
        return value;
      }),
      map((res: any) => {
        this.qtyPeople = res.Quantity;
        this.perLocation = (+this.qtyPeople / +this.totLocation)*100;
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        this.onError = err.Message;
        return '0';
      })
    );
  }

  openLocation(){
    var spinnerRef = this.spinnerService.start($localize`:@@host.loadingopeloc:`);
    this.openLoc$ = this.locationService.updateOpenLocation(this.locationId, this.businessId, this.providerId).pipe(
      map((res: any) => {
        if (res != null){
          if (res['Business'].OPEN == 1){
            this.locationStatus = 1;
            this.closedLoc = 0;
            this.textOpenLocation = (this.locationStatus == 0 ? $localize`:@@host.locclosed:` : (this.closedLoc == 1 ? $localize`:@@host.loccopenandclosed:` : $localize`:@@host.locopen:`));
            this.spinnerService.stop(spinnerRef);
          }
        }
      }),
      mergeMap(v => 
        //ACTUALIZA NUMERO DE PERSONAS
        this.locationService.getLocationQuantity(this.businessId, this.locationId).pipe(
          map((res: any) => {
            if (res != null){
              this.qtyPeople = res.Quantity;
              this.perLocation = (+this.qtyPeople / +this.totLocation)*100;
              return res.Quantity.toString();
            }
          })
        )
      ),
      switchMap(x => this.appointmentService.getHostLocations(this.businessId, this.userId).pipe(
        map((res: any) => {
          if (res.Locs != null){
            this.Providers = res.Locs.Providers;
            return res;
          } else {
            return;
          }
        })
      )),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        this.locationStatus = 0;
        this.textOpenLocation = (this.locationStatus == 0 ? $localize`:@@host.locclosed:` : (this.closedLoc == 1 ? $localize`:@@host.loccopenandclosed:` : $localize`:@@host.locopen:`));
        this.onError = err.Message;
        return this.onError;
      })
    );
  }

  closedLocation(){
    var spinnerRef = this.spinnerService.start($localize`:@@host.closingloc:`);
    this.closedLoc$ = this.locationService.updateClosedLocation(this.locationId, this.businessId, this.providerId).pipe(
      map((res: any) => {
        if (res != null){
          if (res['Business'].OPEN == 0){
            this.locationStatus = 0;
            this.textOpenLocation = (this.locationStatus == 0 ? $localize`:@@host.locclosed:` : (this.closedLoc == 1 ? $localize`:@@host.loccopenandclosed:` : $localize`:@@host.locopen:`));
            this.spinnerService.stop(spinnerRef);
          }
        }
      }),
      switchMap(x => this.appointmentService.getHostLocations(this.businessId, this.userId).pipe(
        map((res: any) => {
          if (res.Locs != null){
            this.Providers = res.Locs.Providers;
            return res;
          } else {
            return;
          }
        })
      )),
      mergeMap(v => 
        //ACTUALIZA NUMERO DE PERSONAS
        this.locationService.getLocationQuantity(this.businessId, this.locationId).pipe(
          map((res: any) => {
            if (res != null){
              this.qtyPeople = res.Quantity;
              this.perLocation = (+this.qtyPeople / +this.totLocation)*100;
              return res.Quantity.toString();
            }
          })
        )
      ),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        this.locationStatus = 1;
        this.textOpenLocation = (this.locationStatus == 0 ? $localize`:@@host.locclosed:` : (this.closedLoc == 1 ? $localize`:@@host.loccopenandclosed:` : $localize`:@@host.locopen:`));
        this.onError = err.Message;
        return this.onError;
      })
    );
  }

  getTime(): string{
    let options = {
      timeZone: 'America/Puerto_Rico',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    },
    formatter = new Intl.DateTimeFormat([], options);
    var actual = formatter.format(new Date());
    var actualTime = '';
    var a = new Date();
    var hour: number = +actual.substring(0,2);
    var min: number = (+actual.substring(3,5) > 30 ? 0.5 : 0);
    if (+actual.substring(3,5) > 30){
      if (hour+1 > 24){
        hour = 1;
        min = 0;
      } else {
        hour = hour+1;
        min = 0;
      }
    }
    var actTime: number = 0;
    if (this.bucketInterval == 0.5){
      actTime = hour+min;
    } else {
      actTime = hour;
    }
    for (var i=0; i<= this.buckets.length-1; i++){
      if (this.buckets[i].Time == actTime){
        actualTime = this.buckets[i].TimeFormat;
        break;
      }
    }
    return actualTime;
  }

  getYear(): string{
    let options = {
      timeZone: 'America/Puerto_Rico',
      year: 'numeric'
    },
    formatter = new Intl.DateTimeFormat([], options);
    var actual = formatter.format(new Date());
    return actual;
  }

  getMonth(): string{
    let options = {
      timeZone: 'America/Puerto_Rico',
      month: 'numeric'
    },
    formatter = new Intl.DateTimeFormat([], options);
    var actual = formatter.format(new Date());
    return actual.padStart(2,'0');
  }

  getDay(): string{
    let options = {
      timeZone: 'America/Puerto_Rico',
      day: 'numeric'
    },
    formatter = new Intl.DateTimeFormat([], options);
    var actual = formatter.format(new Date());
    return actual.padStart(2,'0');
  }

}
