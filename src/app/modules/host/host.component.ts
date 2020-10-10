import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LocationService, ReasonsService, BusinessService, AppointmentService, ServService } from '@app/services';
import { AuthService } from '@app/core/services';
import { SpinnerService } from '@app/shared/spinner.service';
import { map, catchError, switchMap, mergeMap } from 'rxjs/operators';
import { Appointment, Reason } from '@app/_models';
import { FormBuilder, Validators } from '@angular/forms';
import { ConfirmValidParentMatcher } from '@app/validators';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from '@app/shared/dialog/dialog.component';
import { VideoDialogComponent } from '@app/shared/video-dialog/video-dialog.component';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { DirDialogComponent } from '@app/shared/dir-dialog/dir-dialog.component';

@Component({
  selector: 'app-host',
  templateUrl: './host.component.html',
  styleUrls: ['./host.component.scss']
})
export class HostComponent implements OnInit {
  locations$: Observable<Location[]>;
  appointmentsSche$: Observable<Appointment[]>;
  appointmentsWalk$: Observable<Appointment[]>;
  appointmentsPre$: Observable<Appointment[]>;
  appointmentsPrevious$: Observable<Appointment[]>;
  getWalkIns$: Observable<any[]>;
  messages$: Observable<any>;
  newAppointment$: Observable<any>;
  updAppointment$: Observable<any>;
  getMessages$: Observable<any[]>;
  quantityPeople$: Observable<any>;
  checkIn$: Observable<any>;
  comments$: Observable<any>;
  opeHours$: Observable<any>;
  getLocInfo$: Observable<any>;
  reasons$: Observable<any>;
  openLoc$: Observable<any>;
  closedLoc$: Observable<any>;
  manualCheckOut$: Observable<any>;

  showMessageSche=[];
  showMessageWalk=[];
  showMessageCheck=[];
  showMessagePrev=[];

  getCommentsSche=[];
  getCommentsWalk=[];
  getCommentsCheck=[];
  getCommentsPrev=[];

  showDetailsSche=[];
  showDetailsWalk=[];
  showDetailsCheck=[];
  showDetailsPrev=[];

  showCancelOptionsCheck=[];
  showCancelOptionsWalk=[];
  showCancelOptionsSche=[];
  showCancelOptionsPrev=[];

  showPrevious: boolean = false;
  
  selectedCheck=[];
  selectedWalk=[];
  selectedSche=[];
  selectedPrev=[];

  getWalkInstoCheckOut=[];

  buckets=[];
  currHour: number = 0;
  prevHour: number = 0;
  firstHour: number = 0;
  bucketInterval: number = 0;
  manualCheckOut: number = 0;
  qtyPeople: string = '';
  perLocation: number = 0;
  totLocation: number = 0;
  reasons: Reason[]=[];

  doors: string[]=[];
  businessId: string = '';
  userId: string = '';
  showDoorInfo: boolean = false;
  showApp: boolean = false;
  locationStatus: number = 0;
  closedLoc: number = 0;
  textOpenLocation: string = '';
  locName: string = '';

  locations: any[]=[];

  locationId: string = '';
  doorId: string = '';
  qrCode: string = '';

  onError: string = '';

  lastItemWalk: string = '_';
  lastItemPre: string = '_';
  lastItem: string = '_';
  appoIdWalk: string = '_';
  appoIdPre: string = '_';
  appoIdSche: string = '_';

  manualGuests: number =  1;

  operationText: string = '';

  Providers: any[]=[];
  services: []=[];
  providerId: string = '';
  panelOpenState = false;
  seeDetails: string = $localize`:@@shared.seedetails:`;
  hideDetails: string = $localize`:@@shared.hidedetails:`;
  get f(){
    return this.clientForm.controls;
  }

  confirmValidParentMatcher = new ConfirmValidParentMatcher();

  constructor(
    private domSanitizer: DomSanitizer,
    private spinnerService: SpinnerService,
    private _snackBar: MatSnackBar,
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private businessService: BusinessService,
    private reasonService: ReasonsService,
    private locationService: LocationService,
    private serviceService: ServService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private matIconRegistry: MatIconRegistry,
    private router: Router
  ) {
    this.matIconRegistry.addSvgIcon('cancel',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/cancel.svg'));
    this.matIconRegistry.addSvgIcon('clock',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/clock.svg'));
    this.matIconRegistry.addSvgIcon('expand',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/expand.svg'));
    this.matIconRegistry.addSvgIcon('handicap',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/handicap.svg'));
    this.matIconRegistry.addSvgIcon('older',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/older.svg'));
    this.matIconRegistry.addSvgIcon('pregnant',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/pregnant.svg'));
    this.matIconRegistry.addSvgIcon('readycheck',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/readycheck.svg'));
    this.matIconRegistry.addSvgIcon('sms',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/sms.svg'));
    this.matIconRegistry.addSvgIcon('mas',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/mas.svg'));
    this.matIconRegistry.addSvgIcon('menos',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/menos.svg'));
  }

  clientForm = this.fb.group({
    Phone: ['',[Validators.maxLength(17)]],
    Name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    ServiceId: ['', [Validators.required]],
    Email: ['', [Validators.maxLength(200), Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]],
    DOB: [''],
    Gender: [''],
    Preference: [''],
    Disability: [''],
    Guests: ['1', [Validators.required, Validators.max(99), Validators.min(1)]],
    ProviderId: ['']
  })

  schedule = [];
  walkIns = [];
  preCheckIn =[]
  previous=[];

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

    var spinnerRef = this.spinnerService.start($localize`:@@host.loadinglocs:`);
    this.getLocInfo$ = this.appointmentService.getHostLocations(this.businessId, this.userId).pipe(
      map((res: any) => {
        if (res.Locs != null){
          if (res.Locs.length > 0){
            this.locations = res.Locs;
            this.locationId = res.Locs[0].LocationId;
            this.doorId = res.Locs[0].Door;
            this.manualCheckOut = res.Locs[0].ManualCheckOut;
            this.totLocation = res.Locs[0].MaxCustomers;
            this.Providers = res.Locs[0].Providers;
            this.locName = res.Locs[0].Name;
            this.locationStatus = res.Locs[0].Open;
            this.closedLoc = res.Locs[0].Closed;
            this.textOpenLocation = (this.locationStatus == 0 ? $localize`:@@host.locclosed:` : (this.closedLoc == 1 ? $localize`:@@host.loccopenandclosed:` : $localize`:@@host.locopen:`));
            if (this.Providers.length > 0){
              this.operationText = this.locName + ' / ' + $localize`:@@host.allproviders:`; //this.Providers[0].Name;
              // this.providerId = this.Providers[0].ProviderId;
              this.providerId = "0";
            }
          }
          return res;
        } else {
          this.spinnerService.stop(spinnerRef);
          this.openDialog($localize`:@@shared.error:`, $localize`:@@host.missloc:`, false, true, false);
          this.router.navigate(['/']);
          return;
        }
      }),
      // switchMap(val => val = this.serviceService.getServicesProvider(this.businessId, this.providerId).pipe(
      //     map((res: any) =>{
      //       this.services = res.services.filter(x => x.Selected === 1);
      //       return res;
      //     })
      //   )
      // ),
      switchMap(val => val = this.businessService.getBusinessOpeHours(this.businessId, this.locationId)),
      map((res: any) => {
        if (res.Code == 200) {
          this.bucketInterval = 1;//parseFloat(res.BucketInterval);
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
      switchMap((value: any) => {
        value = this.locationService.getLocationQuantity(this.businessId, this.locationId);
        return value;
      }),
      map((res: any) => {
        this.qtyPeople = res.Quantity;
        this.perLocation = (+this.qtyPeople / +this.totLocation)*100;
      }),
      map(_ => {
        if (this.locationId != '' && this.locationStatus == 1 && this.closedLoc == 0){
          this.getAppointmentsSche();
          this.getAppointmentsWalk();
          this.getAppointmentsPre();
        }
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        this.onError = err.Message;
        return '0';
      })
    );

    this.reasons$ = this.reasonService.getReasons(this.businessId).pipe(
      map((res: any) => {
        if (res != null ){
          if (res.Code == 200){
            this.reasons = res.Reasons.split(',');
            return res.Reasons.split(',');
          }
        }
      }),
      catchError(err => {
        this.onError = err.Message;
        return '0';
      })
    );

    setInterval(() => {
      this.preCheckIn.forEach(res => {
        let options = {
          timeZone: 'America/Puerto_Rico',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          hour12: false,
        },
        formatter = new Intl.DateTimeFormat([], options);
        var actual = formatter.format(new Date());
        var d = new Date();
        d.setHours(+res.CheckInTime.substring(11,13));
        d.setMinutes(+res.CheckInTime.substring(14,16));
        
        var a = new Date();
        a.setHours(+actual.substring(0,2));
        a.setMinutes(+actual.substring(3,5));
        
        var diff = (+a - +d); 
        var diffHrs = Math.floor((diff % 86400000) / 3600000); // hours
        var diffMins = Math.round(((diff % 86400000) % 3600000) / 60000); // minutes
        var diff = (diffHrs*60)+diffMins;
        res.ElapsedTime = diff.toString();
      });

    }, 60000);

    setInterval(() => {
      for (var i=0; i<=this.buckets.length-1; i++){
        if (this.buckets[i].Time == this.currHour){
          this.currHour = this.buckets[i].Time;
          if (i-1 >= 0){
            this.prevHour = this.buckets[i-1].Time;
          }
        }
      }
    }, 1200000);
  
    setInterval(() => {
      if (this.locationId != '' && this.locationStatus == 1 && this.closedLoc == 0){
        this.getAppointmentsSche();
        this.getAppointmentsWalk();
        this.getAppointmentsPre();
      }
    }, 3500000);
  }

  openLocation(){
    var spinnerRef = this.spinnerService.start($localize`:@@host.loadingopeloc:`);
    this.openLoc$ = this.locationService.updateOpenLocation(this.locationId, this.businessId).pipe(
      map((res: any) => {
        if (res != null){
          if (res['Business'].OPEN == 1){
            this.locationStatus = 1;
            this.closedLoc = 0;
            this.lastItem = "_";
            this.lastItemPre = "_";
            this.lastItemWalk = "_";
            this.textOpenLocation = (this.locationStatus == 0 ? $localize`:@@host.locclosed:` : (this.closedLoc == 1 ? $localize`:@@host.loccopenandclosed:` : $localize`:@@host.locopen:`));
            this.spinnerService.stop(spinnerRef);
            this.getAppointmentsSche();
            this.getAppointmentsWalk();
            this.getAppointmentsPre();
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
    this.closedLoc$ = this.locationService.updateClosedLocation(this.locationId, this.businessId).pipe(
      map((res: any) => {
        if (res != null){
          if (res['Business'].OPEN == 0){
            this.locationStatus = 0;
            this.textOpenLocation = (this.locationStatus == 0 ? $localize`:@@host.locclosed:` : (this.closedLoc == 1 ? $localize`:@@host.loccopenandclosed:` : $localize`:@@host.locopen:`));
            this.spinnerService.stop(spinnerRef);
            this.previous = [];
            this.schedule = [];
            this.walkIns = [];
            this.preCheckIn = [];
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

  checkOutQR(){
    const dialogRef = this.dialog.open(VideoDialogComponent, {
      width: '450px',
      height: '595px',
      data: {guests: 0, title: $localize`:@@host.checkoutpop:`, tipo: 2, businessId: this.businessId, locationId: this.locationId, providerId: this.providerId}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result != undefined) {
        let qtyGuests = result.Guests;
        this.qrCode = result.qrCode;
        if (this.qrCode != ''){
          this.checkOutAppointment(this.qrCode);
        }
        if (qtyGuests > 0 && this.qrCode == ''){
          this.setManualCheckOut(qtyGuests);
        }
      }
    });
  }

  checkOutAppointment(qrCode: string){
    let formData = {
      Status: 4,
      qrCode: qrCode,
      BusinessId: this.businessId,
      LocationId: this.locationId,
      ProviderId: this.providerId
    }
    this.checkIn$ = this.appointmentService.updateAppointmentCheckOut(formData).pipe(
      map((res: any) => {
        if (res.Code == 200){
          this.openSnackBar($localize`:@@host.checkoutsuccess:`, $localize`:@@host.checkoutpop:`);
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
      catchError(err => {
        if (err.Status == 404){
          this.openSnackBar(err.Message, $localize`:@@host.checkoutpop:`);
          return err.Message;
        }
        this.onError = err.Message;
        this.openSnackBar($localize`:@@shared.wrong:`, $localize`:@@host.checkoutpop:`);
        return this.onError;
      })
    );
  }

  setManualCheckOut(qtyOut: number){
    this.manualCheckOut$ = this.appointmentService.updateManualCheckOut(this.businessId, this.locationId, this.providerId, qtyOut).pipe(
      map((res: any) => {
        if (res.Code == 200){
          this.openSnackBar($localize`:@@host.checkoutsuccess:`, $localize`:@@host.checkoutpop:`);
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
      catchError(err => {
        this.onError = err.Message;
        this.openSnackBar($localize`:@@shared.wrong:`, $localize`:@@host.checkoutpop:`);
        return this.onError;
      })
    );
  }

  getWalkInsCheckOut(){
    let yearCurr = this.getYear();
    let monthCurr = this.getMonth();
    let dayCurr = this.getDay();
    let dateAppo = yearCurr + '-' + monthCurr + '-' + dayCurr;

    var spinnerRef = this.spinnerService.start($localize`:@@host.loadingwalkins:`);
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

          this.dialog.afterAllClosed.subscribe(
            () =>{
              //ACTUALIZA NUMERO DE PERSONAS
              this.quantityPeople$ = this.locationService.getLocationQuantity(this.businessId, this.locationId).pipe(
                map((res: any) => {
                  if (res != null){
                    this.qtyPeople = res.Quantity;
                    this.perLocation = (+this.qtyPeople / +this.totLocation)*100;
                    return res.Quantity.toString();
                  }
                }),
                catchError(err => {
                  this.onError = err.Message;
                  return '0';
                })
              )
            }
          );
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

  addAppointment(){
    let timeAppo = this.getTime();
    if (timeAppo == ""){
      this.openSnackBar($localize`:@@host.invalidTime:`, $localize`:@@shared.error:`);
      return;
    }
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
    let phoneNumber = this.clientForm.value.Phone.toString().replace(/[^0-9]/g,'');
    let yearCurr = this.getYear();
    let monthCurr = this.getMonth();
    let dayCurr = this.getDay();
    let dateAppo = yearCurr + '-' + monthCurr + '-' + dayCurr;
    let formData = {
      BusinessId: this.businessId,
      LocationId: this.locationId,
      ProviderId: (this.providerId != '0' ? this.providerId : this.clientForm.value.ProviderId),
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
      AppoDate: dateAppo,
      AppoHour: timeAppo,
      Type: 2
    }
    var spinnerRef = this.spinnerService.start($localize`:@@host.addingappo:`);
    this.newAppointment$ = this.appointmentService.postNewAppointment(formData).pipe(
      map((res: any) => {
        if (res.Code == 200){
          this.walkIns.push(res.Appointment);
        }
        this.spinnerService.stop(spinnerRef);
        this.clientForm.reset({Phone:'', Name:'', Email:'', DOB:'', Gender:'', Preference:'', Disability:'', ProviderId: '', ServiceId:'', Guests: 1});
        this.showApp = false;
        return res.Code;
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        this.onError = err.Message;
        this.openDialog($localize`:@@shared.error:`, $localize`:@@shared.wrong:`, false, true, false);
        return this.onError;
      })
    );
  }

  showAppointment(){
    this.showApp = !this.showApp;
    if (this.showApp){
      this.clientForm.reset({Phone:'', Name:'', Email:'', DOB:'', Gender:'', Preference:'', Disability:'', ProviderId:'', ServiceId:'', Guests: 1});
    }
  }

  onCancelAddAppointment(){
    this.clientForm.reset({Phone:'', Name:'', Email:'', DOB:'', Gender:'', Preference:'', Disability:'', ProviderId:'', ServiceId:'', Guests: 1});
    this.showApp = false;
  }

  getErrorMessage(component: string){
    const val200 = '200';
    const val3 = '3';
    const val2 = '2';
    const val1 = '1';
    const val6 = '6';
    const val14 = '14';
    const val99 = '99';
    const val100 = '100';
    if (component === 'Email'){
      return this.f.Email.hasError('required') ? $localize`:@@shared.entervalue:` :
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
    if (component === 'ProviderId'){
      return this.f.ProviderId.hasError('required') ? $localize`:@@shared.invalidselectvalue:` :
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

  onCancelApp(appo: any, reasonId: string, index: number, origin: string){
    //CANCELAR APPOINTMENT
    if (reasonId == undefined){
      this.openSnackBar($localize`:@@host.selectreason:`,$localize`:@@host.cancelappodyn:`);
    }
    let formData = {
      Status: 5,
      DateAppo: appo.DateFull,
      Reason: reasonId,
      Guests: appo.Guests,
      CustomerId: appo.ClientId
    }
    this.updAppointment$ = this.appointmentService.updateAppointment(appo.AppId, formData).pipe(
      map((res: any) => {
        if (res.Code == 200){
          if (origin == 'checkin'){
            var data = this.preCheckIn.findIndex(e => e.AppId === appo.AppId);
            this.preCheckIn.splice(data, 1);
            this.showCancelOptionsCheck[index] = false;
            this.selectedCheck[index] = undefined; 
          }
          if (origin == 'walkin'){
            var data = this.walkIns.findIndex(e => e.AppId === appo.AppId);
            this.walkIns.splice(data, 1);
            this.showCancelOptionsWalk[index] = false;
            this.selectedWalk[index] = undefined; 
          }
          if (origin == 'schedule'){
            var data = this.schedule.findIndex(e => e.AppId === appo.AppId);
            this.schedule.splice(data, 1);
            this.showCancelOptionsSche[index] = false;
            this.selectedSche[index] = undefined; 
          }
          if (origin == 'previous'){
            var data = this.previous.findIndex(e => e.AppId === appo.AppId);
            this.previous.splice(data, 1);
            this.showCancelOptionsPrev[index] = false;
            this.selectedPrev[index] = undefined; 
          }
          this.openSnackBar($localize`:@@host.cancelsuccess:`, $localize`:@@shared.cancel:`);
        }
      }),
      catchError(err => {
        this.onError = err.Message;
        this.openSnackBar($localize`:@@shared.wrong:`, $localize`:@@shared.cancel:`);
        return this.onError;
      })
    );
  }

  onCheckInApp(appo: any){
    //READ QR CODE AND CHECK-IN PROCESS
    if (appo.Type == 1) {
      const dialogRef = this.dialog.open(VideoDialogComponent, {
        width: '450px',
        height: '675px',
        data: {guests: appo.Guests, title: $localize`:@@host.checkintitle:`, tipo: 1 }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result != undefined) {
          this.qrCode = result.qrCode;
          let guestsAppo = result.Guests;
          if (this.qrCode != '' && guestsAppo > 0){
            this.checkInAppointment(this.qrCode, appo, guestsAppo);
          }
        }
      });
    } else {
      this.checkInAppointment('VALID', appo, appo.Guests);
    }
  }

  checkInAppointment(qrCode: string, appo: any, guests: number){
    let formData = {
      Status: 3,
      DateAppo: appo.DateFull,
      qrCode: qrCode,
      Guests: guests,
      BusinessId: this.businessId,
      LocationId: this.locationId,
      ProviderId: appo.ProviderId
    }
    this.checkIn$ = this.appointmentService.updateAppointmentCheckIn(appo.AppId, formData).pipe(
      map((res: any) => {
        if (res.Code == 200){
          var data = this.preCheckIn.findIndex(e => e.AppId === appo.AppId);
          this.preCheckIn.splice(data, 1);
          
          this.openSnackBar($localize`:@@host.checkinsuccess:`,$localize`:@@host.checkintitle:`);
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

  onMessageApp(appointmentId: string, value: string, i: number, qeue: string){
    //GET MESSAGES APPOINTMENT
    let formData = {
      Message: value
    }
    this.messages$ = this.appointmentService.putMessage(appointmentId, '1', formData).pipe(
      map((res:any) => {
        if (res != null){
          if (res.Code == 200){
            if (qeue == 'schedule'){
              this.showMessageSche[i] = false;
            }
            if (qeue == 'walkin'){
              this.showMessageWalk[i] = false;
            }
            if (qeue == 'checkin'){
              this.showMessageCheck[i] = false;
            }
            if (qeue == 'previous'){
              this.showMessagePrev[i] = false;
            }
            this.openSnackBar($localize`:@@host.messagessend:`,$localize`:@@host.messages:`);
          } else {
            this.openSnackBar($localize`:@@shared.wrong:`,$localize`:@@host.messages:`);
          }
        } else {
          this.openSnackBar($localize`:@@shared.wrong:`,$localize`:@@host.messages:`);
        }
      }),
      catchError(err => {
        this.openSnackBar($localize`:@@shared.wrong:`,$localize`:@@host.messages:`);
        this.onError = err.Message;
        return this.onError;
      })
    );
  }

  onShowMessage(appo: any, i: number, type: string){
    if (appo.Unread == 'H') {
      appo.Unread = '0';
    }
    this.comments$ = this.appointmentService.getMessages(appo.AppId, 'H').pipe(
      map((res: any) => {
        if (res != null){
          if (res.Code == 200){
            if (type == 'schedule'){
              this.getCommentsSche[i] = res.Messages;
            }
            if (type == 'walkin'){
              this.getCommentsWalk[i] = res.Messages;
            }
            if (type == 'checkin'){
              this.getCommentsCheck[i] = res.Messages;
            }
            if (type == 'previous'){
              this.getCommentsPrev[i] = res.Messages;
            }
          } else {
            this.openSnackBar($localize`:@@shared.wrong:`,$localize`:@@host.messages:`);
          }
        }
      }),
      catchError(err => {
        this.onError = err.Message;
        return this.onError;
      })
    );
  }

  onReadyCheckIn(appo: any, tipo: number){
    //MOVE TO READY TO CHECK-IN INSTEAD OF DRAG AND DROP
    let formData = {
      Status: 2,
      DateAppo: appo.DateFull,
      CustomerId: appo.ClientId
    }
    this.updAppointment$ = this.appointmentService.updateAppointment(appo.AppId, formData).pipe(
      map((res: any) => {
        if (res.Code == 200){
          let appoObj = res.Appo;
          if (tipo == 0){
            var data = this.previous.findIndex(e => e.AppId === appo.AppId);
            this.previous.splice(data, 1);
          }
          if (tipo == 1) { 
            var data = this.schedule.findIndex(e => e.AppId === appo.AppId);
            this.schedule.splice(data, 1);
          }
          if (tipo == 2) {
            var data = this.walkIns.findIndex(e => e.AppId === appo.AppId);
            this.walkIns.splice(data, 1);
          }
          appo.CheckInTime = appoObj['TIMECHEK'];
          appo.ElapsedTime = "0";
          this.preCheckIn.push(appo);
          this.openSnackBar($localize`:@@host.readytocheckin:`,$localize`:@@host.textreadytocheckin:`);
        }
      }),
      catchError(err => {
        this.onError = err.Message;
        this.openSnackBar($localize`:@@shared.wrong:`,$localize`:@@host.texttransfer:`);
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

  getActTime(): string{
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

  getPreviousAppos(x: number){
    // let dateAppo = '2020-05-25-10-00';
    if (this.showPrevious == false) {return;}
    let time: string = '';
    if (x % 1 != 0){
      time = (x - (x%1)).toString().padStart(2,'0') + ':30';
    } else {
      time = x.toString().padStart(2, '0') + ':00';
    }
    let yearCurr = this.getYear();
    let monthCurr = this.getMonth();
    let dayCurr = this.getDay();
    let dateAppo = yearCurr + '-' + monthCurr + '-' + dayCurr + '-' + time.replace(':','-');
    var spinnerRef = this.spinnerService.start($localize`:@@host.loadingappos1:`);
    this.appointmentsPrevious$ = this.appointmentService.getPreviousAppointments(this.businessId, this.locationId, this.providerId, dateAppo, 1).pipe(
      map((res: any) => {
        if (res != null) {
          this.previous = [];
          res['Appos'].forEach(item => {
            let hora = item['DateAppo'].substring(11,16).replace('-',':');
            hora = (+hora.substring(0,2) > 12 ? (+hora.substring(0,2)-12).toString().padStart(2,'0') : hora.substring(0,2)) + ':' + hora.substring(3).toString() + (+hora.substring(0,2) > 12 ? ' PM' : ' AM');
            let data = {
              AppId: item['AppointmentId'],
              ClientId: item['ClientId'],
              ProviderId: item['ProviderId'],
              Name: item['Name'].toLowerCase(),
              OnBehalf: item['OnBehalf'],
              Guests: item['Guests'],
              Door: item['Door'],
              Disability: item['Disability'],
              Phone: item['Phone'],
              DateFull: item['DateAppo'],
              DateAppo: hora,
              Type: item['Type'],
              // Purpose: item['Purpose'],
              Unread: item['Unread']
            }
            this.previous.push(data);
          });
          this.spinnerService.stop(spinnerRef);
        }
        return res.Appos;
      }),
      catchError(err => {
        this.onError = err.Message;
        this.spinnerService.stop(spinnerRef);
        return this.onError;
      })
    );
  }

  getAppointmentsSche(){
    // let dateAppoStr = '2020-05-25-09-00';
    // let dateAppoFinStr = '2020-05-25-23-00';
    let getHours = this.getTime();
    let getInitHour = this.getActTime();
    let hourIni = '00-00';
    let hourFin = '00-00';
    if (getHours.length > 0) {
      hourIni = getInitHour.replace(':','-');
      hourFin = getHours.replace(':','-');
    }
    let yearCurr = this.getYear();
    let monthCurr = this.getMonth();
    let dayCurr = this.getDay();
    let dateAppoStr = yearCurr + '-' + monthCurr + '-' + dayCurr + '-' + hourIni;
    let dateAppoFinStr = yearCurr + '-' + monthCurr + '-' + dayCurr + '-' + hourFin;

    var spinnerRef = this.spinnerService.start($localize`:@@host.loadingappos1:`);
    this.appointmentsSche$ = this.appointmentService.getAppointments(this.businessId, this.locationId, this.providerId, dateAppoStr, dateAppoFinStr, 1, 1, this.lastItem, this.appoIdSche).pipe(
      map((res: any) => {
        if (res != null) {
          this.lastItem = res['lastItem'].toString().replace('1#DT#','');
          this.appoIdSche = res['AppId'].toString();
          res['Appos'].forEach(item => {
            let hora = item['DateAppo'].substring(11,16).replace('-',':');
            hora = (+hora.substring(0,2) > 12 ? (+hora.substring(0,2)-12).toString().padStart(2,'0') : hora.substring(0,2)) + ':' + hora.substring(3).toString() + (+hora.substring(0,2) >= 12 ? ' PM' : ' AM');
            let data = {
              AppId: item['AppointmentId'],
              ClientId: item['ClientId'],
              ProviderId: item['ProviderId'],
              Name: item['Name'].toLowerCase(),
              OnBehalf: item['OnBehalf'],
              Guests: item['Guests'],
              Door: item['Door'],
              Disability: item['Disability'],
              Phone: item['Phone'],
              DateFull: item['DateAppo'],
              Type: item['Type'],
              // Purpose: item['Purpose'],
              DateAppo: hora,
              Unread: item['Unread']
            }
            this.schedule.push(data);
          });
          this.spinnerService.stop(spinnerRef);
        }
        return res.Appos;
      }),
      catchError(err => {
        this.onError = err.Message;
        this.spinnerService.stop(spinnerRef);
        return this.onError;
      })
    );
  }

  getAppointmentsWalk(){
    // let dateAppoStr = '2020-05-25-09-00';
    // let dateAppoFinStr = '2020-05-25-23-00';
    let getHours = this.getTime();
    let hourIni = '00-00';
    let hourFin = '00-00';
    if (this.firstHour % 1 != 0){
      hourIni = (this.firstHour - (this.firstHour%1)).toString().padStart(2,'0') + '-30';
    } else {
      hourIni = this.firstHour.toString().padStart(2, '0') + '-00';
    }
    if (getHours.length > 0) {
      hourFin = getHours.replace(':','-');
    } else {
      hourFin = this.currHour.toString().padStart(2,'0') + '-00';
    }
    let yearCurr = this.getYear();
    let monthCurr = this.getMonth();
    let dayCurr = this.getDay();
    let dateAppoStr = yearCurr + '-' + monthCurr + '-' + dayCurr + '-' + hourIni;
    let dateAppoFinStr = yearCurr + '-' + monthCurr + '-' + dayCurr + '-' + hourFin;

    var spinnerRef = this.spinnerService.start($localize`:@@host.loadingappos1:`);
    this.appointmentsWalk$ = this.appointmentService.getAppointments(this.businessId, this.locationId, this.providerId, dateAppoStr, dateAppoFinStr, 1, 2, this.lastItemWalk, this.appoIdWalk).pipe(
      map((res: any) => {
        if (res != null) {
          this.lastItemWalk = res['lastItem'].toString().replace('1#DT#','');
          this.appoIdWalk = res['AppId'].toString();
          res['Appos'].forEach(item => {
            let hora = item['DateAppo'].substring(11,16).replace('-',':');
            hora = (+hora.substring(0,2) > 12 ? (+hora.substring(0,2)-12).toString().padStart(2,'0') : hora.substring(0,2)) + ':' + hora.substring(3).toString() + (+hora.substring(0,2) >= 12 ? ' PM' : ' AM');
            let data = {
              AppId: item['AppointmentId'],
              ClientId: item['ClientId'],
              ProviderId: item['ProviderId'],
              Name: item['Name'].toLowerCase(),
              OnBehalf: item['OnBehalf'],
              Guests: item['Guests'],
              Door: item['Door'],
              Disability: item['Disability'],
              Phone: item['Phone'],
              DateFull: item['DateAppo'],
              DateAppo: hora,
              Type: item['Type'],
              // Purpose: item['Purpose'],
              Unread: item['Unread']
            }
            this.walkIns.push(data);
          });
          this.spinnerService.stop(spinnerRef);
        }
        return res.Appos;
      }),
      catchError(err => {
        this.onError = err.Message;
        this.spinnerService.stop(spinnerRef);
        return this.onError;
      })
    );
  }

  getAppointmentsPre(){
    // let dateAppoStr = '2020-05-25-09-00';
    // let dateAppoFinStr = '2020-05-25-23-00';
    let getHours = this.getTime();
    let hourIni = '00-00';
    let hourFin = '00-00';
    if (getHours.length > 0) {
      // hourIni = getHours.replace(':','-');
      hourFin = getHours.replace(':','-');
    }
    let yearCurr = this.getYear();
    let monthCurr = this.getMonth();
    let dayCurr = this.getDay();
    let dateAppoStr = yearCurr + '-' + monthCurr + '-' + dayCurr + '-' + hourIni;
    let dateAppoFinStr = yearCurr + '-' + monthCurr + '-' + dayCurr + '-' + hourFin;
    var spinnerRef = this.spinnerService.start($localize`:@@host.loadingappos1:`);
    this.appointmentsPre$ = this.appointmentService.getAppointments(this.businessId, this.locationId, this.providerId, dateAppoStr, dateAppoFinStr, 2, '_', this.lastItemPre, this.appoIdPre).pipe(
      map((res: any) => {
        if (res != null) {
          this.lastItemPre = res['lastItem'].toString().replace('2#DT#','');
          this.appoIdPre = res['AppId'].toString();
          res['Appos'].forEach(item => {
            let hora = item['DateAppo'].substring(11,16).replace('-',':');
            hora = (+hora.substring(0,2) > 12 ? (+hora.substring(0,2)-12).toString().padStart(2,'0') : hora.substring(0,2)) + ':' + hora.substring(3).toString() + (+hora.substring(0,2) >= 12 ? ' PM' : ' AM');
            let data = {
              AppId: item['AppointmentId'],
              ClientId: item['ClientId'],
              ProviderId: item['ProviderId'],
              Name: item['Name'].toLowerCase(),
              OnBehalf: item['OnBehalf'],
              Guests: item['Guests'],
              Door: item['Door'],
              Disability: item['Disability'],
              Phone: item['Phone'],
              DateFull: item['DateAppo'],
              DateAppo: hora,
              Type: item['Type'],
              // Purpose: item['Purpose'],
              Unread: item['Unread'],
              CheckInTime: item['CheckInTime'],
              ElapsedTime: this.calculateTime(item['CheckInTime'])
            }
            this.preCheckIn.push(data);
          });
          this.spinnerService.stop(spinnerRef);
        }
        return res.Appos;
      }),
      catchError(err => {
        this.onError = err.Message;
        this.spinnerService.stop(spinnerRef);
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

    this.previous = [];
    this.schedule = [];
    this.walkIns = [];
    this.preCheckIn = [];
    this.showPrevious = false;
    this.lastItem = '_';
    this.lastItemPre = '_';
    this.lastItemWalk = '_';

    if (data.length > 0){
      this.locName = data[0].Name;
      this.doorId = data[0].Door;
      this.manualCheckOut = data[0].ManualCheckOut;
      this.totLocation = data[0].MaxCustomers;
      this.Providers = data[0].Providers;
      this.locName = data[0].Name;
      this.locationStatus = data[0].Open;
      this.closedLoc = data[0].Closed;
      this.textOpenLocation = (this.locationStatus == 0 ? $localize`:@@host.locclosed:` : (this.closedLoc == 1 ? $localize`:@@host.loccopenandclosed:` : $localize`:@@host.locopen:`));
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
          map(_ => {
            if (this.locationId != '' && this.locationStatus == 1 && this.closedLoc == 0){
              this.getAppointmentsSche();
              this.getAppointmentsWalk();
              this.getAppointmentsPre();
            }
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
      // this.locationStatus = res[0].Open;
      // this.closedLoc = res[0].Closed;
      this.providerId = res[0].ProviderId;
      this.operationText = this.locName + ' / ' + res[0].Name;
      // this.textOpenLocation = (this.locationStatus == 0 ? $localize`:@@host.locclosed:` : (this.closedLoc == 1 ? $localize`:@@host.loccopenandclosed:` : $localize`:@@host.locopen:`));
    } else {
      this.providerId = "0";
      this.operationText = this.locName + ' / ' + $localize`:@@host.allproviders:`;
    }
    this.previous = [];
    this.schedule = [];
    this.walkIns = [];
    this.preCheckIn = [];
    this.showPrevious = false;
    this.lastItem = '_';
    this.lastItemPre = '_';
    this.lastItemWalk = '_';
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
      map(_ => {
        if (this.locationId != '' && this.locationStatus == 1 && this.closedLoc == 0){
          this.getAppointmentsSche();
          this.getAppointmentsWalk();
          this.getAppointmentsPre();
        }
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        this.onError = err.Message;
        return '0';
      })
    );
  }

  onProvChange(event){
    this.getLocInfo$ = this.serviceService.getServicesProvider(this.businessId, event.value).pipe(
      map((res: any) =>{
        this.services = res.services.filter(x => x.Selected === 1);
        return res;
      }),
      catchError(err => {
        this.onError = err.Message;
        return '0';
      })
    );
  }

  calculateTime(cardTime: string): string{
    let options = {
      timeZone: 'America/Puerto_Rico',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    },
    formatter = new Intl.DateTimeFormat([], options);
    var actual = formatter.format(new Date());
    var d = new Date();
    d.setHours(+cardTime.substring(11,13));
    d.setMinutes(+cardTime.substring(14,16));
    
    var a = new Date();
    a.setHours(+actual.substring(0,2));
    a.setMinutes(+actual.substring(3,5));
    
    var diff = (+a - +d); 
    var diffHrs = Math.floor((diff % 86400000) / 3600000); // hours
    var diffMins = Math.round(((diff % 86400000) % 3600000) / 60000); // minutes
    var diff = (diffHrs*60)+diffMins;
    return diff.toString();
  }

  setDoor(event) {
    this.doorId = event.value;
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer != event.container) {
      let appo = event.previousContainer.data[event.previousIndex];
      let container = event.previousContainer.id;
      let formData = {
        Status: 2,
        DateAppo: appo['DateFull']
      }

      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, this.preCheckIn.length);
      this.updAppointment$ = this.appointmentService.updateAppointment(appo['AppId'], formData).pipe(
        map((res: any) => {
          if (res.Code == 200){
            let appoObj = res.Appo;
            let appoGet = this.preCheckIn[this.preCheckIn.length-1];
            appoGet.CheckInTime = appoObj['TIMECHEK'];
            appoGet.ElapsedTime = "0";
            this.openSnackBar($localize`:@@host.readytocheckin:`,$localize`:@@host.textreadytocheckin:`);
          }
        }),
        catchError(err => {
          var data = this.preCheckIn.findIndex(e => e.AppId === appo['AppId']);
          this.preCheckIn.splice(data, 1);

          if (container == "cdk-drop-list-0"){ 
            this.schedule.push(JSON.parse(appo));
          } else {
            this.walkIns.push(JSON.parse(appo));
          }

          this.onError = err.Message;
          this.openSnackBar($localize`:@@shared.wrong:`,$localize`:@@host.texttransfer:`);
          return this.onError;
        })
      );
    }
  }

  onScrollSche(){
    this.getAppointmentsSche();
  }

  onScrollWalk(){
    this.getAppointmentsWalk();
  }

  onScrollPre(){
    this.getAppointmentsPre();
  }
}