import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable, of } from 'rxjs';
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
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { ConfirmValidParentMatcher } from '@app/validators';
import { ZXingScannerComponent, ZXingScannerModule } from '@zxing/ngx-scanner';
import { LearnDialogComponent } from '@app/shared/learn-dialog/learn-dialog.component';
import { MonitorService } from '@app/shared/monitor.service';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import { AppowiDialogComponent } from '@app/shared/appowi-dialog/appowi-dialog.component';

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
  qtyPeople: number = 0;
  perLocation: number = 0;
  totLocation: number = 0;
  checkInModule: number = 0;
  checkOutModule: number = 0;
  numGuests: number = 1;
  textOpenLocation: string = '';
  locName: string = '';
  buckets=[];
  maxGuests: number = 1;
  TimeZone: string = '';
  showCard: boolean =false;

  appoData$: Observable<any>;
  Locs$: Observable<any>;
  getWalkIns$: Observable<any[]>;
  check$: Observable<any>;
  manualCheckOut$: Observable<any>;
  getLocInfo$: Observable<any>;
  openLoc$: Observable<any>;
  closedLoc$: Observable<any>;
  resetLoc$: Observable<any>;
  checkOutQR$: Observable<any>;
  checkIn$: Observable<any>;

  Providers: any[] = [];
  services: any[]=[];
  locations: any[]=[];

  operationText: string = '';
  panelOpenState = false;
  
  seeDetails: string = $localize`:@@shared.seedetails:`;
  hideDetails: string = $localize`:@@shared.hidedetails:`;

  countryCode: string = 'PER';
  get f(){
    return this.clientForm.controls;
  }

  confirmValidParentMatcher = new ConfirmValidParentMatcher();

  liveData$ = this.monitorService.syncMessage.pipe(
    map((message: any) => {
      this.syncData(message);
    })
  );

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
    private learnmore: MatDialog,
    private router: Router,
    private monitorService: MonitorService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {
    this.matIconRegistry.addSvgIcon('addAppo',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/addApo.svg'));
    this.matIconRegistry.addSvgIcon('numCitas',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/numCitas.svg'));
    this.matIconRegistry.addSvgIcon('remAppo',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/remAppo.svg'));
   }

  clientForm = this.fb.group({
    Phone: ['',[Validators.maxLength(17)]],
    Name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    ServiceId: ['', [Validators.required]],
    Email: ['', [Validators.maxLength(200), Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]],
    DOB: [''],
    Gender: [''],
    Preference: ['1'],
    Disability: [''],
    ProviderId:[''],
    Guests: ['1', [Validators.required, (control: AbstractControl) => Validators.max(this.maxGuests)(control), Validators.min(1)]]
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

  openLearnMore(message: string): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      message: message
    };
    this.learnmore.open(LearnDialogComponent, dialogConfig);
  }

  syncData(msg: any){
    //NEW APPOINTMENT
    if (msg == null) {return;}
    console.log(msg);
    if (msg['Tipo'] == 'MOVE'){
      if (msg['BusinessId'] == this.businessId && msg['LocationId'] == this.locationId && this.locationStatus == 1){
        if (msg['To'] == 'CHECKIN'){
          if (this.checkInModule == 0){
            this.qtyPeople = +this.qtyPeople+msg['Guests'];
            this.perLocation = (+this.qtyPeople / +this.totLocation)*100;
          }
          this.checkInModule = 0;
        }
      }
      if (msg['To'] == 'CHECKOUT'){
        if (this.checkOutModule == 0){
          this.qtyPeople = +this.qtyPeople-msg['Guests'];
          this.perLocation = (+this.qtyPeople / +this.totLocation)*100;
        }
        this.checkOutModule = 0;
      }
    }
    if (msg['Tipo'] == 'CLOSED'){
      if (msg['BusinessId'] == this.businessId && msg['LocationId'] == this.locationId && this.locationStatus == 1){
        this.locationStatus = 0;
        this.textOpenLocation = (this.locationStatus == 0 ? $localize`:@@host.locclosed:` : $localize`:@@host.locopen:`);
        this.closedLoc$ = this.appointmentService.getHostLocations(this.businessId, this.userId).pipe(
          map((res: any) => {
            if (res.Locs != null){
              if (res.Locs.length > 0){
                this.locations = res.Locs;
                let indexLoc = this.locations.findIndex(x=>x.LocationId == this.locationId);
                if (indexLoc < 0) { indexLoc = 0; }
                this.locationId = res.Locs[indexLoc].LocationId;
                this.doorId = res.Locs[indexLoc].Door;
                this.totLocation = res.Locs[indexLoc].MaxCustomers;
                this.Providers = res.Locs[indexLoc].Providers;
                this.locName = res.Locs[indexLoc].Name;
                this.locationStatus = res.Locs[indexLoc].Open;
                this.TimeZone = res.Locs[indexLoc].TimeZone;
                this.textOpenLocation = (this.locationStatus == 0 ? $localize`:@@host.locclosed:` : $localize`:@@host.locopen:`);
                if (this.Providers.length > 0){
                  this.operationText = this.locName + ' / ' + $localize`:@@host.allproviders:`; //this.Providers[0].Name;
                  this.providerId = this.Providers[0].ProviderId;
                  this.providerId = "0";
                }
              }
              return res;
            } else {
              // this.spinnerService.stop(spinnerRef);
              this.openDialog($localize`:@@shared.error:`, $localize`:@@host.missloc:`, false, true, false);
              this.router.navigate(['/']);
              return;
            }
          })
        );
        this.openDialog($localize`:@@shared.error:`, $localize`:@@shared.locationclosed:`, false, true, false);
      }
    }
    if (msg['Tipo'] == 'RESET'){
      if (msg['BusinessId'] == this.businessId && msg['LocationId'] == this.locationId && this.locationStatus == 1){
        this.qtyPeople = 0;
        this.perLocation = (+this.qtyPeople / +this.totLocation)*100;
      }
    }
    if (msg['Tipo'] == 'OPEN'){
      if (msg['BusinessId'] == this.businessId && msg['LocationId'] == this.locationId && this.locationStatus == 0){
        this.locationStatus = 1;
        this.textOpenLocation = (this.locationStatus == 0 ? $localize`:@@host.locclosed:` : $localize`:@@host.locopen:`);

        var spinnerRef = this.spinnerService.start($localize`:@@host.loadingopeloc:`);
        this.openLoc$ = this.locationService.getLocationQuantity(this.businessId, this.locationId).pipe(
          map((res: any) => {
            if (res != null){
              this.qtyPeople = res.Quantity;
              this.perLocation = (+this.qtyPeople / +this.totLocation)*100;
              return res.Quantity.toString();
            }
          }),
          switchMap(x => this.appointmentService.getHostLocations(this.businessId, this.userId).pipe(
            map((res: any) => {
              if (res.Locs != null){
                if (res.Locs.length > 0){
                  this.locations = res.Locs;
                  let indexLoc = this.locations.findIndex(x=> x.LocationId == this.locationId);
                  if (indexLoc < 0) { indexLoc = 0;}
                  this.locationId = res.Locs[indexLoc].LocationId;
                  this.doorId = res.Locs[indexLoc].Door;
                  this.totLocation = res.Locs[indexLoc].MaxCustomers;
                  this.Providers = res.Locs[indexLoc].Providers;
                  this.locName = res.Locs[indexLoc].Name;
                  this.locationStatus = res.Locs[indexLoc].Open;
                  this.TimeZone = res.Locs[indexLoc].TimeZone;
                  this.textOpenLocation = (this.locationStatus == 0 ? $localize`:@@host.locclosed:` : $localize`:@@host.locopen:`);
                  if (this.Providers.length > 0){
                    this.operationText = this.locName + ' / ' + $localize`:@@host.allproviders:`; //this.Providers[0].Name;
                    this.providerId = "0";
                  }
                }
                this.spinnerService.stop(spinnerRef);
                return res;
              } else {
                this.spinnerService.stop(spinnerRef);
                this.openDialog($localize`:@@shared.error:`, $localize`:@@host.missloc:`, false, true, false);
                this.router.navigate(['/']);
                return;
              }
            })
          )),
          catchError(err => {
            this.spinnerService.stop(spinnerRef);
            this.locationStatus = 0;
            this.textOpenLocation = (this.locationStatus == 0 ? $localize`:@@host.locclosed:` : $localize`:@@host.locopen:`);
            this.onError = err.Message;
            return this.onError;
          })
        );
      }
    }
  }

  ngOnInit(): void {
    this.businessId = this.authService.businessId();
    this.userId = this.authService.userId();

    var spinnerRef = this.spinnerService.start($localize`:@@lite.loadlocs:`);
    this.Locs$ = this.appointmentService.getHostLocations(this.businessId, this.userId).pipe(
      map((res: any) => {
        if (res.Locs != null){
          if (res.Locs.length > 0){
            this.locations = res.Locs.sort((a, b) => (a.Name < b.Name ? -1 : 1));
            this.locationId = this.locations[0].LocationId;
            this.doorId = this.locations[0].Door;
            this.totLocation = this.locations[0].MaxCustomers;
            this.Providers = this.locations[0].Providers.sort((a, b) => (a.Name < b.Name ? -1 : 1));
            this.locName = this.locations[0].Name;
            this.locationStatus = this.locations[0].Open;  //0 CLOSED, 1 OPEN
            this.TimeZone = this.locations[0].TimeZone;
            this.textOpenLocation = (this.locationStatus == 0 ? $localize`:@@host.locclosed:` : $localize`:@@host.locopen:`);
            if (this.Providers.length > 0){
              this.operationText = this.locName + ' / ' + $localize`:@@host.allproviders:`; 
              this.providerId = "0";
            }
            this.spinnerService.stop(spinnerRef);
          }
          return res;
        } else {
          this.spinnerService.stop(spinnerRef);
          this.openDialog($localize`:@@shared.error:`, $localize`:@@lite.locsassigned:`, false, true, false);
          this.router.navigate(['/']);
          return;
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
      switchMap(val => val = this.businessService.getBusinessOpeHours(this.businessId, this.locationId)),
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
    const dialogRef = new MatDialogConfig();
    dialogRef.width ='450px';
    dialogRef.minWidth = '320px';
    dialogRef.maxWidth = '450px';
    dialogRef.height = '575px';
    dialogRef.data = {guests: 0, title: $localize`:@@host.checkoutpop:`, tipo: 2, businessId: this.businessId, locationId: this.locationId, providerId: this.providerId};
    const qrDialog = this.dialog.open(VideoDialogComponent, dialogRef);
    this.checkOutQR$ = qrDialog.afterClosed().pipe(
      map((result: any) => {
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
        return result;
      }),
      catchError(err => {
        return err;
      })
    );
  }

  setManualCheckOut(qtyOut){
    this.checkOutModule = 1;
    this.manualCheckOut$ = this.appointmentService.updateManualCheckOut(this.businessId, this.locationId, qtyOut).pipe(
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
        this.checkOutModule = 0;
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
      ProviderId: this.providerId,
      BusinessName: this.authService.businessName(),
      Language: this.authService.businessLanguage()
    }
    this.checkOutModule = 1;
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
        this.checkOutModule = 0;
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
    const dialogRef = new MatDialogConfig();
    dialogRef.width ='450px';
    dialogRef.minWidth = '320px';
    dialogRef.maxWidth = '450px';
    dialogRef.height = '575px';
    dialogRef.data = {guests: 0, title: $localize`:@@host.checkintitle:`, tipo: 3 };
    const qrDialog = this.dialog.open(VideoDialogComponent, dialogRef);
    this.checkIn$ = qrDialog.afterClosed().pipe(
      map((result: any) => {
        if (result != undefined) {
          this.qrCode = result.qrCode;
          let guestsAppo = result.Guests;
          if (this.qrCode != '' && guestsAppo > 0){
            this.checkInAppointment(this.qrCode, guestsAppo);
          }
        }
        return result;
      }),
      catchError(err =>{
        return err;
      })
    );
  }

  checkInAppointment(qrCode: string, guests: number){
    let formData = {
      Status: 3,
      qrCode: qrCode,
      Guests: guests,
      BusinessId: this.businessId,
      LocationId: this.locationId,
      ProviderId: this.providerId,
      BusinessName: this.authService.businessName(),
      Language: this.authService.businessLanguage()
    }
    this.checkInModule = 1;
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
        this.checkInModule = 0;
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

  displayAddAppo(){
    const dialogRef = this.dialog.open(AppowiDialogComponent, {
      width: '450px',
      height: '700px',
      data: {timeZone: this.TimeZone, door: this.doorId, businessId: this.businessId, locationId: this.locationId, providerId: this.providerId, services: this.services, buckets: this.buckets, hours: [], providers: this.Providers, tipo: 1}
    });
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

  onLocationChange(event){
    let data = this.locations.filter(val => val.LocationId == event.value);

    if (data.length > 0){
      this.locName = data[0].Name;
      this.doorId = data[0].Door;
      // this.manualCheckOut = data[0].ManualCheckOut;
      this.totLocation = data[0].MaxCustomers;
      this.Providers = data[0].Providers;
      this.locName = data[0].Name;
      this.locationStatus = data[0].Open;
      this.TimeZone = data[0].TimeZone;
      this.textOpenLocation = (this.locationStatus == 0 ? $localize`:@@host.locclosed:` : $localize`:@@host.locopen:`);
      if (data[0].Providers.length > 0){
        this.Providers = data[0].Providers;
        if (this.Providers.length > 0){
          // this.providerId = this.Providers[0].ProviderId;
          // this.operationText = this.locName + ' / ' + this.Providers[0].Name;
          this.providerId = "0";
          this.operationText = this.locName + ' / ' + $localize`:@@host.allproviders:`;
        }
        var spinnerRef = this.spinnerService.start($localize`:@@host.loadinglocationsdata:`);
        this.getLocInfo$ = this.businessService.getBusinessOpeHours(this.businessId, this.locationId).pipe(
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
          switchMap(val => this.serviceService.getServicesProvider(this.businessId, this.providerId).pipe(
            map((res: any) =>{
              this.services = res.services.filter(x => x.Selected === 1);
              return res;
            })
          )),
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
    }
  }

  onServiceChange(event){
    let res = this.Providers.filter(val => val.ProviderId == event.value);
    if (res.length > 0){
      this.providerId = res[0].ProviderId;
    }
    var spinnerRef = this.spinnerService.start($localize`:@@host.loadinglocs:`);
    this.getLocInfo$ = this.businessService.getBusinessOpeHours(this.businessId, this.locationId).pipe(
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

  resetLocation(){
    var spinnerRef = this.spinnerService.start($localize`:@@host.loadinglocs:`);
    this.resetLoc$ = this.locationService.updateClosedLocation(this.locationId, this.businessId, 0, this.authService.businessLanguage()).pipe(
      map((res: any) => {
        if (res.Code == 200){
          this.qtyPeople = 0;
        }
        this.spinnerService.stop(spinnerRef);
      }),
      catchError(err =>{
        this.spinnerService.stop(spinnerRef);
        return err;
      })
    );
  }

  openLocation(){
    var spinnerRef = this.spinnerService.start($localize`:@@host.loadingopeloc:`);
    this.openLoc$ = this.locationService.updateOpenLocation(this.locationId, this.businessId).pipe(
      map((res: any) => {
        if (res != null){
          if (res['Business'].OPEN == 1){
            this.locationStatus = 1;
            this.textOpenLocation = (this.locationStatus == 0 ? $localize`:@@host.locclosed:` : $localize`:@@host.locopen:`);
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
        this.textOpenLocation = (this.locationStatus == 0 ? $localize`:@@host.locclosed:` : $localize`:@@host.locopen:`);
        this.onError = err.Message;
        return this.onError;
      })
    );
  }

  closedLocation(){
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      header: $localize`:@@host.closedlocheader:`, 
      message: $localize`:@@host.closedloc:`, 
      success: false, 
      error: false, 
      warn: false,
      ask: true
    };
    dialogConfig.width ='280px';
    dialogConfig.minWidth = '280px';
    dialogConfig.maxWidth = '280px';

    const dialogRef = this.dialog.open(DialogComponent, dialogConfig);
    let valueSel;
    var spinnerRef: any;
    this.closedLoc$ = dialogRef.afterClosed().pipe(
      map(result => {
        if (!result) {
          throw 'exit process';
        }
        spinnerRef = this.spinnerService.start($localize`:@@shared.closingLoc:`);
        return result;
      }),
      switchMap(x => this.locationService.updateClosedLocation(this.locationId, this.businessId, 1, this.authService.businessLanguage()).pipe(
          map((res: any) => {
            if (res != null){
              if (res['Business'].OPEN == 0){
                this.locationStatus = 0;
                this.textOpenLocation = (this.locationStatus == 0 ? $localize`:@@host.locclosed:` : $localize`:@@host.locopen:`);
              }
            }
          }),
          switchMap(x => this.appointmentService.getHostLocations(this.businessId, this.userId).pipe(
            map((res: any) => {
              if (res.Locs != null){
                if (res.Locs.length > 0){
                  this.locations = res.Locs;
                  let indexLoc = this.locations.findIndex(x=>x.LocationId == this.locationId);
                  if (indexLoc < 0) { indexLoc = 0;}
                  this.locationId = res.Locs[indexLoc].LocationId;
                  this.doorId = res.Locs[indexLoc].Door;
                  this.totLocation = res.Locs[indexLoc].MaxCustomers;
                  this.Providers = res.Locs[indexLoc].Providers;
                  this.locName = res.Locs[indexLoc].Name;
                  this.locationStatus = res.Locs[indexLoc].Open;
                  this.TimeZone = res.Locs[indexLoc].TimeZone;
                  this.textOpenLocation = (this.locationStatus == 0 ? $localize`:@@host.locclosed:` : $localize`:@@host.locopen:`);
                  if (this.Providers.length > 0){
                    this.operationText = this.locName + ' / ' + $localize`:@@host.allproviders:`; //this.Providers[0].Name;
                    this.providerId = this.Providers[0].ProviderId;
                    this.providerId = "0";
                  }
                }
                this.spinnerService.stop(spinnerRef);
                return res;
              } else {
                // this.spinnerService.stop(spinnerRef);
                this.openDialog($localize`:@@shared.error:`, $localize`:@@host.missloc:`, false, true, false);
                this.router.navigate(['/']);
                this.spinnerService.stop(spinnerRef);
                return;
              }
            })
          )),
          mergeMap(v => 
            //ACTUALIZA NUMERO DE PERSONAS
            this.locationService.getLocationQuantity(this.businessId, this.locationId).pipe(
              map((res: any) => {
                if (res != null){
                  this.qtyPeople = +res.Quantity;
                  this.perLocation = (+this.qtyPeople / +this.totLocation)*100;
                  return res.Quantity.toString();
                }
              })
            )
          )
        )
      ),
      catchError(err => {
        if (spinnerRef != undefined) { this.spinnerService.stop(spinnerRef); }
        this.locationStatus = 1;
        this.textOpenLocation = (this.locationStatus == 0 ? $localize`:@@host.locclosed:` : $localize`:@@host.locopen:`);
        console.log(err);
        return of(err);
      })
    );
  }

  getTime(): string{
    let options = {
      timeZone: this.TimeZone,
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
      timeZone: this.TimeZone,
      year: 'numeric'
    },
    formatter = new Intl.DateTimeFormat([], options);
    var actual = formatter.format(new Date());
    return actual;
  }

  getMonth(): string{
    let options = {
      timeZone: this.TimeZone,
      month: 'numeric'
    },
    formatter = new Intl.DateTimeFormat([], options);
    var actual = formatter.format(new Date());
    return actual.padStart(2,'0');
  }

  getDay(): string{
    let options = {
      timeZone: this.TimeZone,
      day: 'numeric'
    },
    formatter = new Intl.DateTimeFormat([], options);
    var actual = formatter.format(new Date());
    return actual.padStart(2,'0');
  }

  learnMore(textNumber: number){
    let message = '';
    switch(textNumber) { 
      case 26: { 
        message = $localize`:@@learnMore.LMCON26:`;
        break; 
      }
      case 44: { 
        message = $localize`:@@learnMore.LMCON44:`;
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
