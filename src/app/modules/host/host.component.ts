import { ChangeDetectionStrategy, Component, ElementRef, OnInit, QueryList, ViewChild } from '@angular/core';
import { CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { interval, Observable, of } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LocationService, ReasonsService, BusinessService, AppointmentService, ServService, AdminService } from '@app/services';
import { AuthService } from '@app/core/services';
import { SpinnerService } from '@app/shared/spinner.service';
import { map, catchError, switchMap, mergeMap, tap, shareReplay } from 'rxjs/operators';
import { Appointment, Reason } from '@app/_models';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { ConfirmValidParentMatcher } from '@app/validators';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from '@app/shared/dialog/dialog.component';
import { VideoDialogComponent } from '@app/shared/video-dialog/video-dialog.component';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { DirDialogComponent } from '@app/shared/dir-dialog/dir-dialog.component';
import { MonitorService } from '@app/shared/monitor.service';
import { LearnDialogComponent } from '@app/shared/learn-dialog/learn-dialog.component';
import { MediaMatcher } from '@angular/cdk/layout';

@Component({
  selector: 'app-host',
  templateUrl: './host.component.html',
  styleUrls: ['./host.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HostComponent implements OnInit {
  locations$: Observable<Location[]>;
  appointmentsSche$: Observable<Appointment[]>;
  appointmentsWalk$: Observable<Appointment[]>;
  appointmentsPre$: Observable<Appointment[]>;
  appointmentsWaitList$: Observable<Appointment[]>;
  getWalkIns$: Observable<any[]>;
  messages$: Observable<any>;
  newAppointment$: Observable<any>;
  updAppointment$: Observable<any>;
  getMessages$: Observable<any[]>;
  quantityPeople$: Observable<any>;
  checkOutQR$: Observable<any>;
  checkIn$: Observable<any>;
  comments$: Observable<any>;
  opeHours$: Observable<any>;
  getLocInfo$: Observable<any>;
  reasons$: Observable<any>;
  openLoc$: Observable<any>;
  closedLoc$: Observable<any>;
  manualCheckOut$: Observable<any>;
  newTime$: Observable<any>;
  resetLoc$: Observable<any>;
  cancelAppo$: Observable<any>;
  newCurrTime$: Observable<any>;
  runQeues$: Observable<any>;
  hours$: Observable<any>;

  getCommentsSche=[];
  getCommentsWalk=[];
  getCommentsCheck=[];
  getCommentsWaitList=[];
  
  selectedCheck=[];
  selectedWalk=[];
  selectedSche=[];
  selectedWaitList=[];

  getWalkInstoCheckOut=[];

  buckets=[];
  currHour: number = 0;
  prevHour: number = 0;
  firstHour: number = 0;
  bucketInterval: number = 0;
  manualCheckOut: number = 0;
  qtyPeople: number = 0;
  perLocation: number = 0;
  totLocation: number = 0;
  reasons: Reason[]=[];

  hours: any[]=[];
  doors: string[]=[];
  businessId: string = '';
  userId: string = '';
  showDoorInfo: boolean = false;
  showApp: boolean = false;
  locationStatus: number = 0;
  checkInModule: number = 0;
  checkOutModule: number = 0;
  numGuests: number = 1;
  textOpenLocation: string = '';
  locName: string = '';
  maxGuests: number = 1;

  locations: any[]=[];
  locationId: string = '';
  doorId: string = '';
  qrCode: string = '';

  onError: string = '';
  manualGuests: number =  1;
  operationText: string = '';
  screenDisp: boolean=false;

  Providers: any[]=[];
  services: any[]=[];
  providerId: string = '';
  panelOpenState = false;
  seeDetails: string = $localize`:@@shared.seedetails:`;
  hideDetails: string = $localize`:@@shared.hidedetails:`;
  matcher: MediaQueryList;
  lastTime = new Date().getTime();

  get f(){
    return this.clientForm.controls;
  }

  confirmValidParentMatcher = new ConfirmValidParentMatcher();

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => { 
        this.screenDisp = result.matches; 
        return result.matches;}),
      shareReplay()
    );

  liveData$ = this.monitorService.syncMessage.pipe(
    map((message: any) => {
      this.syncData(message);
    })
  );

  sleep$ = interval(1000).pipe(
    map(() => {
      if ((new Date().getTime() - this.lastTime) > 4000) {
        console.log("reload on location");
        location.reload();
      }
      this.lastTime = new Date().getTime();
    })
  );

  // readonly PUSH_URL = 'wss://1wn0vx0tva.execute-api.us-east-1.amazonaws.com/prod?businessId=12345';
  constructor(
    private breakpointObserver: BreakpointObserver,
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
    private learnmore: MatDialog,
    private matIconRegistry: MatIconRegistry,
    private adminService: AdminService,
    private router: Router,
    private monitorService: MonitorService,
    public mediaMatcher: MediaMatcher
  ) {
    this.matIconRegistry.addSvgIcon('cancel',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/cancel.svg'));
    this.matIconRegistry.addSvgIcon('clock',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/clock.svg'));
    this.matIconRegistry.addSvgIcon('pause',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/pause.svg'));
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
    Hour: ['', [Validators.required]],
    Email: ['', [Validators.maxLength(200), Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]],
    DOB: [''],
    Gender: [''],
    Preference: ['1'],
    Disability: [''],
    Guests: ['1', [Validators.required, (control: AbstractControl) => Validators.max(this.maxGuests)(control), Validators.min(1)]],
    ProviderId: ['']
  })

  schedule =[];
  walkIns =[];
  preCheckIn =[];
  waitlist=[];

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
    if (msg['Tipo'] == 'APPO'){
      if (msg['BusinessId'] == this.businessId && msg['LocationId'] == this.locationId && this.locationStatus == 1){
        let options = {
          timeZone: 'America/Puerto_Rico',
          hour: 'numeric',
          minute: 'numeric',
          hour12: false,
        },
        formatter = new Intl.DateTimeFormat([], options);
        var actualTime = formatter.format(new Date());
        let actTime = +actualTime.replace(':','-').substring(0,2);
        let appoTime = +msg['DateFull'].substring(11).replace(':','-').substring(0,2);
        let hora = msg['DateAppo'];
        let data = {
          AppId: msg['AppId'],
          ClientId: msg['CustomerId'],
          ProviderId: msg['ProviderId'],
          BufferTime: msg['BufferTime'],
          Name: msg['Name'].toLowerCase(),
          Provider: msg['Provider'],
          Service: msg['Service'],
          OnBehalf: msg['OnBehalf'],
          Guests: msg['Guests'],
          Door: msg['Door'],
          Disability: msg['Disability'],
          Phone: msg['Phone'],
          DateFull: msg['DateFull'],
          Type: msg['Type'],
          DateAppo: hora,
          Unread: 0,
          OpenMess: 0,
          OpenCanc: 0,
          OpenItem: 0,
          QrCode: msg['QRCode'],
          DateTrans: msg['DateTrans']
        }
        if (msg['Type'] == 1){
          if (this.walkIns.filter(x => x.AppId ==  msg['AppId']).length == 0){
            if (appoTime >= actTime){
              var verifWalk = this.walkIns.findIndex(x => x.AppId === msg['AppId']);
              if (verifWalk >= 0){return;}
              this.walkIns.push(data);
              this.walkIns.sort(function(a, b) { 
                if (a.DateFull == b.DateFull){
                  if (a.Disability == b.Disability){
                    return b.DateTrans > a.DateTrans ? -1 : 1
                 }
                 return b.Disability - a.Disability;
                }
                return a.DateFull > b.DateFull ? 1 : -1;
              });
            }
          }
        } else {
          if (this.waitlist.filter(x => x.AppId ==  msg['AppId']).length == 0){
            var verifWaitList = this.waitlist.findIndex(x => x.AppId === msg['AppId']);
            if (verifWaitList >= 0){return;}
            this.waitlist.push(data);
            this.waitlist.sort(function(a, b) { 
              if (a.DateFull == b.DateFull){
                if (a.Disability == b.Disability){
                  return b.DateTrans > a.DateTrans ? -1 : 1
                }
                return b.Disability - a.Disability;
              }
              return a.DateFull > b.DateFull ? 1 : -1;
            });
          }
        }
      }  
    }
    if (msg['Tipo'] == 'REVERSE'){
      if (msg['BusinessId'] == this.businessId && msg['LocationId'] == this.locationId && this.locationStatus == 1){
        var verifpreCheck = this.preCheckIn.findIndex(x => x.AppId === msg['AppId']);
        if (verifpreCheck >= 0){this.preCheckIn.splice(verifpreCheck, 1);}

        let hora = msg['DateAppo'];
        let data = {
          AppId: msg['AppId'],
          ClientId: msg['CustomerId'],
          ProviderId: msg['ProviderId'],
          BufferTime: msg['BufferTime'],
          Name: msg['Name'].toLowerCase(),
          Provider: msg['Provider'],
          Service: msg['Service'],
          OnBehalf: msg['OnBehalf'],
          Guests: msg['Guests'],
          Door: msg['Door'],
          Disability: msg['Disability'],
          Phone: msg['Phone'],
          DateFull: msg['DateFull'],
          Type: msg['Type'],
          DateAppo: hora,
          Unread: 0,
          OpenMess: 0,
          OpenCanc: 0,
          OpenItem: 0,
          QrCode: msg['QRCode'],
          DateTrans: msg['DateTrans']
        }
        if (msg['Type'] == 1){
          if (msg['Qeue'] == 'UPC'){
            if (this.walkIns.filter(x => x.AppId ==  msg['AppId']).length == 0){
              var verifWalk = this.walkIns.findIndex(x => x.AppId === msg['AppId']);
              if (verifWalk >= 0){return;}
              this.walkIns.push(data);
              this.walkIns.sort(function(a, b) { 
                if (a.DateFull == b.DateFull){
                  if (a.Disability == b.Disability){
                    return b.DateTrans > a.DateTrans ? -1 : 1
                }
                return b.Disability - a.Disability;
                }
                return a.DateFull > b.DateFull ? 1 : -1;
              });
            }
          } else {
            if (this.schedule.filter(x => x.AppId ==  msg['AppId']).length == 0){
              var verifWalk = this.schedule.findIndex(x => x.AppId === msg['AppId']);
              if (verifWalk >= 0){return;}
              this.schedule.push(data);
              this.schedule.sort(function(a, b) { 
                if (a.DateFull == b.DateFull){
                  if (a.Disability == b.Disability){
                    return b.DateTrans > a.DateTrans ? -1 : 1
                 }
                 return b.Disability - a.Disability;
                }
                return a.DateFull > b.DateFull ? -1 : 1;
              });
            }
          }
        } else {
          if (this.waitlist.filter(x => x.AppId ==  msg['AppId']).length == 0){
            var verifWaitList = this.waitlist.findIndex(x => x.AppId === msg['AppId']);
            if (verifWaitList >= 0){return;}
            this.waitlist.push(data);
            this.waitlist.sort(function(a, b) { 
              if (a.DateFull == b.DateFull){
                if (a.Disability == b.Disability){
                  return b.DateTrans > a.DateTrans ? -1 : 1
                }
                return b.Disability - a.Disability;
              }
              return a.DateFull > b.DateFull ? 1 : -1;
            });
          }
        }
      }  
    }
    if (msg['Tipo'] == 'MESS'){
      if (msg['BusinessId'] == this.businessId && msg['LocationId'] == this.locationId && this.locationStatus == 1 && msg['User'] == 'H'){
        let resScheMess = this.schedule.findIndex(x => x.AppId === msg['AppId']);
        if (resScheMess >= 0){
          if (this.schedule[resScheMess].OpenMess == 1){
            this.getCommentsSche[resScheMess].push(msg['Message']);
          }
          this.schedule[resScheMess].Unread = "H";
        }
        let resWalkInsMess = this.walkIns.findIndex(x => x.AppId === msg['AppId']);
        if (resWalkInsMess >= 0){
          if (this.walkIns[resWalkInsMess].OpenMess == 1){
            this.getCommentsWalk[resWalkInsMess].push(msg['Message']);
          }
          this.walkIns[resWalkInsMess].Unread = "H";
        }
        let resWaitListMess = this.waitlist.findIndex(x => x.AppId === msg['AppId']);
        if (resWaitListMess >= 0){
          if (this.waitlist[resWaitListMess].OpenMess == 1){
            this.getCommentsWaitList[resWaitListMess].push(msg['Message']);
          }
          this.waitlist[resWaitListMess].Unread = "H";
        }
        let resPreCheckInMess = this.preCheckIn.findIndex(x => x.AppId === msg['AppId']);
        if (resPreCheckInMess >= 0){
          if (this.preCheckIn[resPreCheckInMess].OpenMess == 1){
            this.getCommentsCheck[resPreCheckInMess].push(msg['Message']);
          }
          this.preCheckIn[resPreCheckInMess].Unread = "H";
        }
      }
    }
    if (msg['Tipo'] == 'CANCEL'){
      if (msg['BusinessId'] == this.businessId && msg['LocationId'] == this.locationId && this.locationStatus == 1){
        var verifSche = this.schedule.findIndex(x => x.AppId === msg['AppId']);
        if (verifSche >= 0){this.schedule.splice(verifSche, 1);}

        var verifWalkIns = this.walkIns.findIndex(x => x.AppId === msg['AppId']);
        if (verifWalkIns >= 0){this.walkIns.splice(verifWalkIns, 1);}

        var verifpreCheck = this.preCheckIn.findIndex(x => x.AppId === msg['AppId']);
        if (verifpreCheck >= 0){this.preCheckIn.splice(verifpreCheck, 1);}

        var verifwaitList = this.waitlist.findIndex(x => x.AppId === msg['AppId']);
        if (verifwaitList >= 0){this.waitlist.splice(verifwaitList, 1);}
      }
    }
    if (msg['Tipo'] == 'MOVE'){
      if (msg['BusinessId'] == this.businessId && msg['LocationId'] == this.locationId && this.locationStatus == 1){
        if (msg['To'] == 'PRECHECK'){
          var verifSche = this.schedule.findIndex(x => x.AppId === msg['AppId']);
          if (verifSche >= 0){
            var dataSche = this.schedule[verifSche];
            this.schedule.splice(verifSche, 1);
            let data = {
              AppId: dataSche['AppId'],
              ClientId: dataSche['ClientId'],
              ProviderId: dataSche['ProviderId'],
              Name: dataSche['Name'].toLowerCase(),
              OnBehalf: dataSche['OnBehalf'],
              Guests: dataSche['Guests'],
              Door: dataSche['Door'],
              Disability: dataSche['Disability'],
              Phone: dataSche['Phone'],
              DateFull: dataSche['DateFull'],
              DateAppo: dataSche['DateAppo'],
              Type: dataSche['Type'],
              Unread: dataSche['Unread'],
              CheckInTime: msg['Time'],
              BufferTime: msg['BufferTime'],
              ElapsedTime: "0",
              Pause: "0"
            }
            this.preCheckIn.push(data);
          }

          var verifWalkIns = this.walkIns.findIndex(x => x.AppId === msg['AppId']);
          if (verifWalkIns >= 0){
            var dataWalk = this.walkIns[verifWalkIns];
            this.walkIns.splice(verifWalkIns, 1);
            let data = {
              AppId: dataWalk['AppId'],
              ClientId: dataWalk['ClientId'],
              ProviderId: dataWalk['ProviderId'],
              Name: dataWalk['Name'].toLowerCase(),
              OnBehalf: dataWalk['OnBehalf'],
              Guests: dataWalk['Guests'],
              Door: dataWalk['Door'],
              Disability: dataWalk['Disability'],
              Phone: dataWalk['Phone'],
              DateFull: dataWalk['DateFull'],
              DateAppo: dataWalk['DateAppo'],
              Type: dataWalk['Type'],
              Unread: dataWalk['Unread'],
              CheckInTime: msg['Time'],
              BufferTime: msg['BufferTime'],
              ElapsedTime: "0",
              Pause: "0"
            }
            this.preCheckIn.push(data);
          }
          
          var verifwaitList = this.waitlist.findIndex(x => x.AppId === msg['AppId']);
          if (verifwaitList >= 0){
            var dataPrev = this.waitlist[verifwaitList];
            this.waitlist.splice(verifwaitList, 1);
            let data = {
              AppId: dataPrev['AppId'],
              ClientId: dataPrev['ClientId'],
              ProviderId: dataPrev['ProviderId'],
              Name: dataPrev['Name'].toLowerCase(),
              OnBehalf: dataPrev['OnBehalf'],
              Guests: dataPrev['Guests'],
              Door: dataPrev['Door'],
              Disability: dataPrev['Disability'],
              Phone: dataPrev['Phone'],
              DateFull: dataPrev['DateFull'],
              DateAppo: dataPrev['DateAppo'],
              Type: dataPrev['Type'],
              Unread: dataPrev['Unread'],
              CheckInTime: msg['Time'],
              BufferTime: msg['BufferTime'],
              ElapsedTime: "0",
              Pause: "0"
            }
            this.preCheckIn.push(data);
          }
        }
        if (msg['To'] == 'CHECKIN'){
          var verifSche = this.schedule.findIndex(x => x.AppId === msg['AppId']);
          if (verifSche >= 0){
            this.schedule.splice(verifSche, 1);
          }

          var verifpreCheck = this.preCheckIn.findIndex(x => x.AppId === msg['AppId']);
          if (verifpreCheck >= 0){
            this.preCheckIn.splice(verifpreCheck, 1);
          }
          if (this.checkInModule == 0){
            this.qtyPeople = +this.qtyPeople+msg['Guests'];
            this.perLocation = (+this.qtyPeople / +this.totLocation)*100;
          }
          this.checkInModule = 0;
        }
        if (msg['To'] == 'CHECKOUT'){
          if (this.checkOutModule == 0){
            this.qtyPeople = +this.qtyPeople-msg['Guests'];
            this.perLocation = (+this.qtyPeople / +this.totLocation)*100;
          }
          this.checkOutModule = 0;
        }
      }
    }
    if (msg['Tipo'] == 'CLOSED'){
      if (msg['BusinessId'] == this.businessId && msg['LocationId'] == this.locationId && this.locationStatus == 1){
        this.locationStatus = 0;
        this.textOpenLocation = (this.locationStatus == 0 ? $localize`:@@host.locclosed:` : $localize`:@@host.locopen:`);
        this.schedule = [];
        this.walkIns = [];
        this.preCheckIn = [];
        this.waitlist = [];
        this.closedLoc$ = this.appointmentService.getHostLocations(this.businessId, this.userId).pipe(
          map((res: any) => {
            if (res.Locs != null){
              if (res.Locs.length > 0){
                this.locations = res.Locs;
                let indexLoc = this.locations.findIndex(x=>x.LocationId == this.locationId);
                if (indexLoc < 0) { indexLoc = 0; }
                this.locationId = res.Locs[indexLoc].LocationId;
                this.doorId = res.Locs[indexLoc].Door;
                this.manualCheckOut = res.Locs[indexLoc].ManualCheckOut;
                this.totLocation = res.Locs[indexLoc].MaxCustomers;
                this.Providers = res.Locs[indexLoc].Providers;
                this.locName = res.Locs[indexLoc].Name;
                this.locationStatus = res.Locs[indexLoc].Open;
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
        this.getAppointmentsSche();
        this.getAppointmentsWalk();
        this.getAppointmentsWaitList();
        this.getAppointmentsPre();

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
                // this.Providers = res.Locs.Providers;
                // return res;
                if (res.Locs.length > 0){
                  this.locations = res.Locs;
                  let indexLoc = this.locations.findIndex(x=> x.LocationId == this.locationId);
                  if (indexLoc < 0) { indexLoc = 0;}
                  this.locationId = res.Locs[indexLoc].LocationId;
                  this.doorId = res.Locs[indexLoc].Door;
                  this.manualCheckOut = res.Locs[indexLoc].ManualCheckOut;
                  this.totLocation = res.Locs[indexLoc].MaxCustomers;
                  this.Providers = res.Locs[indexLoc].Providers;
                  this.locName = res.Locs[indexLoc].Name;
                  this.locationStatus = res.Locs[indexLoc].Open;
                  this.textOpenLocation = (this.locationStatus == 0 ? $localize`:@@host.locclosed:` : $localize`:@@host.locopen:`);
                  if (this.Providers.length > 0){
                    this.operationText = this.locName + ' / ' + $localize`:@@host.allproviders:`; //this.Providers[0].Name;
                    // this.providerId = this.Providers[0].ProviderId;
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

  screenSize(event){
    console.log("screen Size");
    location.reload();
  }

  ngOnInit(): void {
    this.matcher = this.mediaMatcher.matchMedia(Breakpoints.Handset);
    this.matcher.addListener(this.screenSize);

    if (this.matcher.matches) {return;}

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
            this.locationStatus = res.Locs[0].Open;  //0 CLOSED, 1 OPEN
            this.textOpenLocation = (this.locationStatus == 0 ? $localize`:@@host.locclosed:` : $localize`:@@host.locopen:`);
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
        if (this.locationId != '' && this.locationStatus == 1){
          this.getAppointmentsSche();
          this.getAppointmentsWalk();
          this.getAppointmentsWaitList();
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

    this.newTime$ = interval(60000).pipe(
      map(() => {
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
          if (+diff >= res.BufferTime && res.Pause == '0'){
            //CANCEL APPO
            this.cancelAppo$ = this.adminService.putNoShow(res.AppId).pipe(
              map((res: any) => {
                if (res.Code == 200){
                  let val = this.preCheckIn.findIndex(x=>x.AppId == res.AppId);
                  if (val >= 0){
                    // this.showCancelOptionsCheck[val] = false;
                    this.selectedCheck[val] = undefined;
                  }
                  var data = this.preCheckIn.findIndex(e => e.AppId === res.AppId);
                  if (data >= 0 ){this.preCheckIn.splice(data, 1);}
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
        })
      })
    );

    this.newCurrTime$ = interval(1200000).pipe(
      map(() => {
        for (var i=0; i<=this.buckets.length-1; i++){
          if (this.buckets[i].Time == this.currHour){
            this.currHour = this.buckets[i].Time;
            if (i-1 >= 0){
              this.prevHour = this.buckets[i-1].Time;
            }
          }
        }
      })
    );

    this.runQeues$ = interval(1800000).pipe(
      map(() => {
        this.getAppointmentsSche();
        this.getAppointmentsWalk();
        this.getAppointmentsWaitList();
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
            this.getAppointmentsSche();
            this.getAppointmentsWalk();
            this.getAppointmentsWaitList();
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
            if (res.Locs.length > 0){
              this.locations = res.Locs;
              let indexLoc = this.locations.findIndex(x=> x.LocationId == this.locationId);
              if (indexLoc < 0) { indexLoc = 0;}
              this.locationId = res.Locs[indexLoc].LocationId;
              this.doorId = res.Locs[indexLoc].Door;
              this.manualCheckOut = res.Locs[indexLoc].ManualCheckOut;
              this.totLocation = res.Locs[indexLoc].MaxCustomers;
              this.Providers = res.Locs[indexLoc].Providers;
              this.locName = res.Locs[indexLoc].Name;
              this.locationStatus = res.Locs[indexLoc].Open;
              this.textOpenLocation = (this.locationStatus == 0 ? $localize`:@@host.locclosed:` : $localize`:@@host.locopen:`);
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

  closedLocation(){
    const dialogConfigClosed = new MatDialogConfig();
    dialogConfigClosed.autoFocus = false;
    dialogConfigClosed.data = {
      header: $localize`:@@host.closedlocheader:`, 
      message: $localize`:@@host.closedloc:`, 
      success: false, 
      error: false, 
      warn: false,
      ask: true
    };
    dialogConfigClosed.width ='280px';
    dialogConfigClosed.minWidth = '280px';
    dialogConfigClosed.maxWidth = '280px';

    const dialogRefClosed = this.dialog.open(DialogComponent, dialogConfigClosed);
    let valueSel;
    var spinnerRef: any;
    this.closedLoc$ = dialogRefClosed.afterClosed().pipe(
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
                this.schedule = [];
                this.walkIns = [];
                this.preCheckIn = [];
                this.waitlist = [];
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
                  this.manualCheckOut = res.Locs[indexLoc].ManualCheckOut;
                  this.totLocation = res.Locs[indexLoc].MaxCustomers;
                  this.Providers = res.Locs[indexLoc].Providers;
                  this.locName = res.Locs[indexLoc].Name;
                  this.locationStatus = res.Locs[indexLoc].Open;
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

  validateService(event){
    let res = this.services.filter(x => x.ServiceId == event.value);
    if (res.length > 0) { this.maxGuests = res[0].CustomerPerBooking; }
    this.numGuests =  1;
    this.clientForm.patchValue({'Guests': this.numGuests});

    this.hours$ = this.appointmentService.getAvailability(this.businessId, this.locationId, this.clientForm.value.ProviderId, event.value).pipe(
      map((res: any) => {
        if (res.Code == 200){
          // this.hours = res.Hours;
          return res.Hours;
          // this.openSnackBar($localize`:@@host.checkoutsuccess:`, $localize`:@@host.checkoutpop:`);
        }
      }),
      catchError(err => {
        this.onError = err.Message;
        this.openSnackBar($localize`:@@shared.wrong:`, $localize`:@@host.checkoutpop:`);
        return this.onError;
      })
    );
  }

  addGuests(){
    if (this.numGuests < this.maxGuests) {
      this.numGuests = this.numGuests+1;
    } else {
      this.numGuests = this.numGuests;
    }
    this.clientForm.patchValue({'Guests': this.numGuests});
  }

  remGuests(){
    if (this.numGuests > 1) {
      this.numGuests=this.numGuests-1;
     } else {
      this.numGuests = this.numGuests;
     }
     this.clientForm.patchValue({'Guests': this.numGuests});
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
          if (this.qrCode != ''){
            this.checkOutAppointment(this.qrCode);
          }
          if (qtyGuests > 0 && this.qrCode == ''){
            this.setManualCheckOut(qtyGuests);
          }
        }
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
              this.qtyPeople = +res.Quantity;
              this.perLocation = (+this.qtyPeople / +this.totLocation)*100;
              return res.Quantity.toString();
            }
          })
        )
      ),
      catchError(err => {
        this.checkOutModule = 0;
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
    this.checkOutModule = 1;
    this.manualCheckOut$ = this.appointmentService.updateManualCheckOut(this.businessId, this.locationId, qtyOut).pipe(
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
        this.checkOutModule = 0;
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

          this.quantityPeople$ = this.dialog.afterAllClosed.pipe(
            map((res:any) => {
              //ACTUALIZA NUMERO DE PERSONAS
              this.locationService.getLocationQuantity(this.businessId, this.locationId).pipe(
                map((res: any) => {
                  if (res != null){
                    this.qtyPeople = +res.Quantity;
                    this.perLocation = (+this.qtyPeople / +this.totLocation)*100;
                    return res.Quantity.toString();
                  }
                }),
                catchError(err => {
                  this.onError = err.Message;
                  return '0';
                })
              )
            })
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
    let timeAppo = this.getTimeAppo();
    if (!this.clientForm.valid) {return;}
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
    let typeAppo = ((this.clientForm.value.Hour).toString() == "--" ? 2 : 1);
    let formData = {
      BusinessId: this.businessId,
      LocationId: this.locationId,
      ProviderId: (this.providerId != '0' ? this.providerId : this.clientForm.value.ProviderId),
      ServiceId: this.clientForm.value.ServiceId,
      BusinessName: (this.authService.businessName().length > 27 ? this.authService.businessName().substring(0,27)+'...' : this.authService.businessName()),
      Language: this.authService.businessLanguage(),
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
      AppoHour: ((this.clientForm.value.Hour).toString() == "--" ? timeAppo : (this.clientForm.value.Hour).toString().padStart(2,'0')+':00'),
      Type: typeAppo
    }

    let options = {
      timeZone: 'America/Puerto_Rico',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    },
    formatter = new Intl.DateTimeFormat([], options);
    var actualTime = formatter.format(new Date());
    let actTime = +actualTime.replace(':','-').substring(0,2);

    var spinnerRef = this.spinnerService.start($localize`:@@host.addingappo:`);
    this.newAppointment$ = this.appointmentService.postNewAppointment(formData).pipe(
      map((res: any) => {
        if (res.Code == 200){
          let appoTime = +(res.Appointment.DateFull).substring(11).replace(':','-').substring(0,2);
          if (appoTime >= actTime){
            if (typeAppo == 1){
              let upComingIndex = this.walkIns.findIndex(x=>x.AppId == res.Appointment.AppId);
              if (upComingIndex < 0){
                this.walkIns.push(res.Appointment);
                this.walkIns.sort(function(a, b) { 
                  if (a.DateFull == b.DateFull){
                    if (a.Disability == b.Disability){
                      return b.DateTrans > a.DateTrans ? -1 : 1
                  }
                  return b.Disability - a.Disability;
                  }
                  return a.DateFull > b.DateFull ? 1 : -1;
                });
              }
            } else {
              let upComingIndex = this.waitlist.findIndex(x=>x.AppId == res.Appointment.AppId);
              if (upComingIndex < 0){
                this.waitlist.push(res.Appointment);
                this.waitlist.sort(function(a, b) { 
                  if (a.DateFull == b.DateFull){
                    if (a.Disability == b.Disability){
                      return b.DateTrans > a.DateTrans ? -1 : 1
                  }
                  return b.Disability - a.Disability;
                  }
                  return a.DateFull > b.DateFull ? 1 : -1;
                });
              }
            }
          }
        }
        this.spinnerService.stop(spinnerRef);
        this.clientForm.reset({Phone:'', Name:'', Email:'', DOB:'', Gender:'', Preference:1, Disability:'', ProviderId: '', ServiceId:'', Guests: 1});
        this.showApp = false;
        return res.Code;
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        this.onError = err.Message;
        if (err.Status == 404){
          this.openDialog($localize`:@@shared.error:`, $localize`:@@shared.invalidDateTime:`, false, true, false);
        } else {
          this.openDialog($localize`:@@shared.error:`, $localize`:@@shared.wrong:`, false, true, false);
        }
        return this.onError;
      })
    );
  }

  showAppointment(){
    this.showApp = !this.showApp;
    if (this.showApp){
      this.clientForm.reset({Phone:'', Name:'', Email:'', DOB:'', Gender:'', Preference:1, Disability:'', ProviderId:'', ServiceId:'', Guests: 1});
    }
  }

  onCancelAddAppointment(){
    this.clientForm.reset({Phone:'', Name:'', Email:'', DOB:'', Gender:'', Preference:1, Disability:'', ProviderId:'', ServiceId:'', Guests: 1});
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
    const maxVal = this.maxGuests;

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
    if (component === 'Hour'){
      return this.f.Hour.hasError('required') ? $localize`:@@shared.invalidselectvalue:` :
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
          this.f.Guests.hasError('max') ? $localize`:@@shared.maxvalue: ${maxVal}` :
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
      CustomerId: appo.ClientId,
      BusinessName: this.authService.businessName(),
      Language: this.authService.businessLanguage()
    }
    this.updAppointment$ = this.appointmentService.updateAppointment(appo.AppId, formData).pipe(
      map((res: any) => {
        if (res.Code == 200){
          if (origin == 'checkin'){
            this.selectedCheck[index] = undefined;

            var data = this.preCheckIn.findIndex(e => e.AppId === appo.AppId);
            if (data >= 0 ){this.preCheckIn.splice(data, 1);}
          }
          if (origin == 'walkin'){
            this.selectedWalk[index] = undefined; 

            var data = this.walkIns.findIndex(e => e.AppId === appo.AppId);
            if (data >= 0 ){this.walkIns.splice(data, 1);}
          }
          if (origin == 'schedule'){
            this.selectedSche[index] = undefined; 

            var data = this.schedule.findIndex(e => e.AppId === appo.AppId);
            if (data >= 0 ){this.schedule.splice(data, 1);}
          }
          if (origin == 'waitlist'){
            this.selectedWaitList[index] = undefined;

            var data = this.waitlist.findIndex(e => e.AppId === appo.AppId);
            if (data >= 0) {this.waitlist.splice(data, 1);}
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
    if (appo.QrCode != 'VALID') {
      appo.Pause = '1';
      const dialogRef = new MatDialogConfig();
      dialogRef.width ='450px';
      dialogRef.minWidth = '320px';
      dialogRef.maxWidth = '450px';
      dialogRef.height = '575px';
      dialogRef.data = {guests: appo.Guests, title: $localize`:@@host.checkintitle:`, tipo: 1 };
      const qrDialog = this.dialog.open(VideoDialogComponent, dialogRef);
      let formData;
      this.checkIn$ = qrDialog.afterClosed().pipe(
        map((result: any) => {
          if (result != undefined) {
            this.qrCode = result.qrCode;
            let guestsAppo = result.Guests;
            if (this.qrCode != '' && guestsAppo > 0){
              formData = {
                Status: 3,
                DateAppo: appo.DateFull,
                qrCode: this.qrCode,
                Guests: guestsAppo,
                BusinessId: this.businessId,
                LocationId: this.locationId,
                ProviderId: appo.ProviderId,
                BusinessName: this.authService.businessName(),
                Language: this.authService.businessLanguage()
              }
              this.checkInModule = 1;
            } else {
              appo.Pause = '1';
              throw 'exit process';
            }
          } else {
            appo.Pause = '0';
            throw 'exit process';
          }
          return result;
        }),
        mergeMap(x => 
          this.appointmentService.updateAppointmentCheckIn(appo.AppId, formData).pipe(
            map((res: any) => {
              if (res.Code == 200){
                var data = this.preCheckIn.findIndex(e => e.AppId === appo.AppId);
                if (data >= 0){
                  this.preCheckIn.splice(data, 1);
                }
                
                this.openSnackBar($localize`:@@host.checkinsuccess:`,$localize`:@@host.checkintitle:`);
              }
            }),
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
            ),
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
          )
        ), catchError(err => {
          this.checkInModule = 0;
          return err;
        })
      );
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
      ProviderId: appo.ProviderId,
      BusinessName: this.authService.businessName(),
      Language: this.authService.businessLanguage()
    }
    this.checkInModule = 1;
    this.checkIn$ = this.appointmentService.updateAppointmentCheckIn(appo.AppId, formData).pipe(
      map((res: any) => {
        if (res.Code == 200){
          var data = this.preCheckIn.findIndex(e => e.AppId === appo.AppId);
          if (data >= 0){
            this.preCheckIn.splice(data, 1);
          }
          
          this.openSnackBar($localize`:@@host.checkinsuccess:`,$localize`:@@host.checkintitle:`);
        }
      }),
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
      ),
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

  onMessageApp(appointmentId: string, item: any, i: number, qeue: string){
    let options = {
      timeZone: 'America/Puerto_Rico',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    },
    formatter = new Intl.DateTimeFormat([], options);
    var actual = formatter.format(new Date());
    let value = item.value;
    item.value = '';
    if (qeue == 'schedule'){
      this.getCommentsSche[i].push({'H': value, 'T': actual});
    }
    if (qeue == 'walkin'){
      this.getCommentsWalk[i].push({'H': value, 'T': actual});
    }
    if (qeue == 'checkin'){
      this.getCommentsCheck[i].push({'H': value, 'T': actual});
    }
    if (qeue == 'waitlist'){
      this.getCommentsWaitList[i].push({'H': value, 'T': actual});
    }
    //GET MESSAGES APPOINTMENT
    let formData = {
      Message: value,
      BusinessName: this.authService.businessName()
    }
    this.messages$ = this.appointmentService.putMessage(appointmentId, '1', formData).pipe(
      map((res:any) => {
        if (res != null){
          if (res.Code == 200){
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
    if (type == 'schedule'){
      this.getCommentsSche[i] = "";
    }
    if (type == 'walkin'){
      this.getCommentsWalk[i] = "";
    }
    if (type == 'checkin'){
      this.getCommentsCheck[i] = "";
    }
    if (type == 'waitlist'){
      this.getCommentsWaitList[i] = "";
    }
    console.log(appo.OpenMess);
    appo.OpenMess = (appo.OpenMess == 0 ? 1 : 0);
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
            if (type == 'waitlist'){
              this.getCommentsWaitList[i] = res.Messages;
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

  onShowCancel(appo: any){
    appo.OpenCanc = (appo.OpenCanc == 0 ? 1 : 0);
  }

  onShowDetail(appo: any){
    appo.OpenItem = (appo.OpenItem == 0 ? 1 : 0);
  }

  onReadyCheckIn(appo: any, tipo: number){
    //MOVE TO READY TO CHECK-IN INSTEAD OF DRAG AND DROP
    let formData = {
      Status: 2,
      DateAppo: appo.DateFull,
      CustomerId: appo.ClientId,
      BusinessName: this.authService.businessName(),
      Language: this.authService.businessLanguage()
    }
    this.updAppointment$ = this.appointmentService.updateAppointment(appo.AppId, formData).pipe(
      map((res: any) => {
        if (res.Code == 200){
          let appoObj = res.Appo;
          if (tipo == 1) { 
            var data = this.schedule.findIndex(e => e.AppId === appo.AppId);
            if (data >= 0){
              this.schedule.splice(data, 1);
            }
          }
          if (tipo == 2) {
            var data = this.walkIns.findIndex(e => e.AppId === appo.AppId);
            if (data >= 0){
              this.walkIns.splice(data, 1);
            }
          }
          if (tipo == 3){
            var data = this.waitlist.findIndex(e => e.AppId === appo.AppId);
            if (data >= 0){
              this.waitlist.splice(data, 1);
            }
          }
          appo.CheckInTime = appoObj['TIMECHEK'];
          appo.ElapsedTime = "0";
          appo.Pause = "0";
          var dataPre = this.preCheckIn.findIndex(e => e.AppId === appo.AppId);
          if (dataPre < 0){
            this.preCheckIn.push(appo);
          }
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

  getTimeAppo(): string{
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
    var min: number = 0;
    var actTime: number = 0;
    actTime = hour;
    for (var i=0; i<= this.buckets.length-1; i++){
      if (this.buckets[i].Time == actTime){
        actualTime = this.buckets[i].TimeFormat;
        break;
      }
    }
    return actualTime;
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

  getAppointmentsSche(){
    this.schedule = [];
    var spinnerRef = this.spinnerService.start($localize`:@@host.loadingappos1:`);
    this.appointmentsSche$ = this.appointmentService.getAppointments(this.businessId, this.locationId, this.providerId, 1, 1, 1).pipe(
      map((res: any) => {
        if (res != null) {
          res['Appos'].forEach(item => {
            let hora = item['DateAppo'].substring(11,16).replace('-',':');
            hora = (+hora.substring(0,2) > 12 ? (+hora.substring(0,2)-12).toString().padStart(2,'0') : hora.substring(0,2)) + ':' + hora.substring(3).toString() + (+hora.substring(0,2) >= 12 ? ' PM' : ' AM');
            let data = {
              AppId: item['AppointmentId'],
              ClientId: item['ClientId'],
              ProviderId: item['ProviderId'],
              BufferTime: item['BufferTime'],
              Name: item['Name'].toLowerCase(),
              Provider: item['Provider'],
              Service: item['Service'],
              OnBehalf: item['OnBehalf'],
              Guests: item['Guests'],
              Door: item['Door'],
              Disability: item['Disability'],
              Phone: item['Phone'],
              DateFull: item['DateAppo'],
              Type: item['Type'],
              DateAppo: hora,
              OpenMess: 0,
              OpenCanc: 0,
              OpenItem: 0,
              Unread: item['Unread'],
              DateTrans: item['DateTrans'],
              QrCode: item['QrCode']
            }
            this.schedule.push(data);
            this.schedule.sort(function(a, b) { 
              if (a.DateFull == b.DateFull){
                if (a.Disability == b.Disability){
                  return b.DateTrans > a.DateTrans ? -1 : 1
               }
               return b.Disability - a.Disability;
              }
              return a.DateFull > b.DateFull ? -1 : 1;
            });
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
    this.walkIns = [];
    var spinnerRef = this.spinnerService.start($localize`:@@host.loadingappos1:`);
    this.appointmentsWalk$ = this.appointmentService.getAppointments(this.businessId, this.locationId, this.providerId, 1, 2, 1).pipe(
      map((res: any) => {
        if (res != null) {
          res['Appos'].forEach(item => {
            let hora = item['DateAppo'].substring(11,16).replace('-',':');
            hora = (+hora.substring(0,2) > 12 ? (+hora.substring(0,2)-12).toString().padStart(2,'0') : hora.substring(0,2)) + ':' + hora.substring(3).toString() + (+hora.substring(0,2) >= 12 ? ' PM' : ' AM');
            let data = {
              AppId: item['AppointmentId'],
              ClientId: item['ClientId'],
              ProviderId: item['ProviderId'],
              BufferTime: item['BufferTime'],
              Name: item['Name'].toLowerCase(),
              Provider: item['Provider'],
              Service: item['Service'],
              OnBehalf: item['OnBehalf'],
              Guests: item['Guests'],
              Door: item['Door'],
              Disability: item['Disability'],
              Phone: item['Phone'],
              DateFull: item['DateAppo'],
              DateAppo: hora,
              Type: item['Type'],
              OpenMess: 0,
              OpenCanc: 0,
              OpenItem: 0,
              Unread: item['Unread'],
              DateTrans: item['DateTrans'],
              QrCode: item['QrCode']
            }
            this.walkIns.push(data);
            this.walkIns.sort(function(a, b) { 
              if (a.DateFull == b.DateFull){
                if (a.Disability == b.Disability){
                  return b.DateTrans > a.DateTrans ? -1 : 1
               }
               return b.Disability - a.Disability;
              }
              return a.DateFull > b.DateFull ? 1 : -1;
            });
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

  getAppointmentsWaitList(){
    this.waitlist = [];
    var spinnerRef = this.spinnerService.start($localize`:@@host.loadingappos1:`);
    this.appointmentsWaitList$ = this.appointmentService.getAppointments(this.businessId, this.locationId, this.providerId, 1, 1, 2).pipe(
      map((res: any) => {
        if (res != null) {
          res['Appos'].forEach(item => {
            let hora = item['DateAppo'].substring(11,16).replace('-',':');
            hora = (+hora.substring(0,2) > 12 ? (+hora.substring(0,2)-12).toString().padStart(2,'0') : hora.substring(0,2)) + ':' + hora.substring(3).toString() + (+hora.substring(0,2) >= 12 ? ' PM' : ' AM');
            let data = {
              AppId: item['AppointmentId'],
              ClientId: item['ClientId'],
              ProviderId: item['ProviderId'],
              BufferTime: item['BufferTime'],
              Name: item['Name'].toLowerCase(),
              Provider: item['Provider'],
              Service: item['Service'],
              OnBehalf: item['OnBehalf'],
              Guests: item['Guests'],
              Door: item['Door'],
              Disability: item['Disability'],
              Phone: item['Phone'],
              DateFull: item['DateAppo'],
              DateAppo: hora,
              Type: item['Type'],
              OpenMess: 0,
              OpenCanc: 0,
              OpenItem: 0,
              Unread: item['Unread'],
              DateTrans: item['DateTrans'],
              QrCode: item['QrCode']
            }
            this.waitlist.push(data);
            this.waitlist.sort(function(a, b) { 
              if (a.DateFull == b.DateFull){
                if (a.Disability == b.Disability){
                  return b.DateTrans > a.DateTrans ? -1 : 1
               }
               return b.Disability - a.Disability;
              }
              return a.DateFull > b.DateFull ? 1 : -1;
            });
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
    this.preCheckIn = [];
    var spinnerRef = this.spinnerService.start($localize`:@@host.loadingappos1:`);
    this.appointmentsPre$ = this.appointmentService.getAppointments(this.businessId, this.locationId, this.providerId, 2, '_', 1).pipe(
      map((res: any) => {
        if (res != null) {
          res['Appos'].forEach(item => {
            let hora = item['DateAppo'].substring(11,16).replace('-',':');
            hora = (+hora.substring(0,2) > 12 ? (+hora.substring(0,2)-12).toString().padStart(2,'0') : hora.substring(0,2)) + ':' + hora.substring(3).toString() + (+hora.substring(0,2) >= 12 ? ' PM' : ' AM');
            let data = {
              AppId: item['AppointmentId'],
              ClientId: item['ClientId'],
              ProviderId: item['ProviderId'],
              BufferTime: item['BufferTime'],
              Name: item['Name'].toLowerCase(),
              Provider: item['Provider'],
              Service: item['Service'],
              OnBehalf: item['OnBehalf'],
              Guests: item['Guests'],
              Door: item['Door'],
              Disability: item['Disability'],
              Phone: item['Phone'],
              DateFull: item['DateAppo'],
              DateAppo: hora,
              Type: item['Type'],
              OpenMess: 0,
              OpenCanc: 0,
              OpenItem: 0,
              QrCode: item['QrCode'],
              Unread: item['Unread'],
              CheckInTime: item['CheckInTime'],
              ElapsedTime: this.calculateTime(item['CheckInTime']),
              Pause: '0'
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

  locationStatusChange(event){
    if (event.checked == false){
      this.closedLocation();
    } else {
      this.openLocation();
    }
  }

  onLocationChange(event){
    let data = this.locations.filter(val => val.LocationId == event);
    this.schedule = [];
    this.walkIns = [];
    this.preCheckIn = [];
    this.waitlist = [];

    if (data.length > 0){
      this.locName = data[0].Name;
      this.doorId = data[0].Door;
      this.manualCheckOut = data[0].ManualCheckOut;
      this.totLocation = data[0].MaxCustomers;
      this.Providers = data[0].Providers;
      this.locName = data[0].Name;
      this.locationStatus = data[0].Open;
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
            this.qtyPeople = +res.Quantity;
            this.perLocation = (+this.qtyPeople / +this.totLocation)*100;
          }),
          map(_ => {
            if (this.locationId != '' && this.locationStatus == 1){
              this.getAppointmentsSche();
              this.getAppointmentsWalk();
              this.getAppointmentsWaitList();
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
      this.providerId = res[0].ProviderId;
      this.operationText = this.locName + ' / ' + res[0].Name;
    } else {
      this.providerId = "0";
      this.operationText = this.locName + ' / ' + $localize`:@@host.allproviders:`;
    }
    this.schedule = [];
    this.walkIns = [];
    this.preCheckIn = [];
    this.waitlist = [];
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
        this.qtyPeople = +res.Quantity;
        this.perLocation = (+this.qtyPeople / +this.totLocation)*100;
      }),
      map(_ => {
        if (this.locationId != '' && this.locationStatus == 1){
          this.getAppointmentsSche();
          this.getAppointmentsWalk();
          this.getAppointmentsWaitList();
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
    this.hours = [];
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
      let appo = JSON.parse(JSON.stringify(event.previousContainer.data[event.previousIndex]));
      let container = event.previousContainer.id;
      let formData = {
        Status: 2,
        DateAppo: appo.DateFull,
        CustomerId: appo.ClientId,
        BusinessName: this.authService.businessName(),
        Language: this.authService.businessLanguage()
      }
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, this.preCheckIn.length);
      this.updAppointment$ = this.appointmentService.updateAppointment(appo.AppId, formData).pipe(
        map((res: any) => {
          if (res.Code == 200){
            let appoObj = res.Appo;
            var dataPre = this.preCheckIn.findIndex(e => e.AppId === appo.AppId);
            if (dataPre >= 0){
              let newData = this.preCheckIn[dataPre];
              newData.CheckInTime = appoObj['TIMECHEK'];
              newData.ElapsedTime = "0";
              newData.Pause = "0";
            }

            this.openSnackBar($localize`:@@host.readytocheckin:`,$localize`:@@host.textreadytocheckin:`);
          }
        }),
        catchError(err => {
          var data = this.preCheckIn.findIndex(e => e.AppId === appo.AppId);
          if (data >= 0){ this.preCheckIn.splice(data, 1); }

          if (container == "cdk-drop-list-0"){ 
            this.schedule.push(JSON.parse(appo));
          } 
          if (container == "cdk-drop-list-1"){ 
            this.walkIns.push(JSON.parse(appo));
          }
          if (container == "cdk-drop-list-2"){ 
            this.waitlist.push(JSON.parse(appo));
          }

          this.onError = err.Message;
          this.openSnackBar($localize`:@@shared.wrong:`,$localize`:@@host.texttransfer:`);
          return this.onError;
        })
      );
    }
  }

  onPause(appo: any, pause: string){
    appo.Pause = pause;
  }

  learnMore(textNumber: number){
    let message = '';
    switch(textNumber) { 
      case 26: { 
        message = $localize`:@@learnMore.LMCON26:`;
        break; 
      }
      case 27: { 
        message = $localize`:@@learnMore.LMCON27:`;
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