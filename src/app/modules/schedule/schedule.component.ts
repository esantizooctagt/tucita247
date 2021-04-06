import { Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable, Subscription } from 'rxjs';
import { LocationService, ServService, BusinessService, AppointmentService } from '@app/services';
import { map, catchError } from 'rxjs/operators';
import { SpinnerService } from '@app/shared/spinner.service';
import { AuthService } from '@app/core/services';
import { AppoDialogComponent } from '@app/shared/appo-dialog/appo-dialog.component';
import { ShowappoDialogComponent } from '@app/shared/showappo-dialog/showappo-dialog.component';
import { DialogComponent } from '@app/shared/dialog/dialog.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LearnDialogComponent } from '@app/shared/learn-dialog/learn-dialog.component';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit {
  // @HostListener('window:scroll', ['$event'])
  
  currWeek: number = 1;
  currTime: string = '';
  isSticky: boolean = false;
  today: Date;
  weekStart: Date;
  weekEnd: Date;
  monday: Date;
  tuesday: Date;
  wednesday: Date;
  thursday: Date;
  friday: Date;
  saturday: Date;
  sunday: Date;
  hours = [];
  MonHours = [];
  TueHours = [];
  WedHours = [];
  ThuHours = [];
  FriHours = [];
  SatHours = [];
  SunHours = [];

  minHr: number = 0;
  maxHr: number = 0;

  businessId: string = '';
  doors: string = '';
  TimeZone: string = '';

  locationData$: Observable<any[]>;
  cancelAppos$: Observable<any>;
  services$: Observable<any[]>;
  putAppo$: Observable<any>;
  validBusiness$: Observable<any>;
  locations: any[]=[];
  operationHours$: Observable<any>;
  locationData: string = '';
  locationId: string = '';
  providerId: string = '';
  resServices: any[]=[];

  subsMessages: Subscription;

  displayYesNo: boolean = false;

  constructor(
    private authService: AuthService,
    private domSanitizer: DomSanitizer,
    private matIconRegistry: MatIconRegistry,
    private locationService: LocationService,
    private spinnerService: SpinnerService,
    private businessService: BusinessService,
    private serviceService: ServService,
    private appointmentService: AppointmentService,
    public dialog: MatDialog,
    private learnmore: MatDialog,
    private _snackBar: MatSnackBar,
    public datepipe: DatePipe
  ) {
    this.matIconRegistry.addSvgIcon('new',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/newAppo.svg'));
    this.matIconRegistry.addSvgIcon('cancel02',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/cancelAppos.svg'));
    this.matIconRegistry.addSvgIcon('view',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/expand02.svg'));
    this.matIconRegistry.addSvgIcon('check',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/check01.svg'));
    this.matIconRegistry.addSvgIcon('refresh',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/refresh.svg'));
   }

  // checkScroll() {
  //   this.isSticky = window.pageYOffset >= 350;
  // }

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

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
    });
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
    // let yearCurr = this.getYear();
    // let monthCurr = this.getMonth();
    // let dayCurr = this.getDay();

    // this.today = new Date(+yearCurr, +monthCurr-1, +dayCurr);
    // var startDay = 1;
    // var d = this.today.getDay();
    // this.weekStart = new Date(this.today.valueOf() - (d<=0 ? 7-startDay:d-startDay)*86400000);
    // this.weekEnd = new Date(this.weekStart.valueOf() + 6*86400000);
    // this.currTime = this.getActTime();

    // this.monday = this.weekStart;
    // this.tuesday = this.addDays(this.weekStart, 1);
    // this.wednesday = this.addDays(this.weekStart, 2);
    // this.thursday = this.addDays(this.weekStart, 3);
    // this.friday = this.addDays(this.weekStart, 4);
    // this.saturday = this.addDays(this.weekStart, 5);
    // this.sunday = this.addDays(this.weekStart, 6);

    this.businessId = this.authService.businessId();
    var spinnerRef = this.spinnerService.start($localize`:@@sche.loadingsche:`);

    this.services$ = this.serviceService.getServicesColor(this.businessId).pipe(
      map((res: any) => {
        this.resServices = res;
        return res;
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        return err;
      })
    );
    this.locationData$ = this.locationService.getLocationsHost(this.businessId).pipe(
      map((res: any) => {
        if (res.Code == 200){
          if (res.Locs.length > 0){
            this.locations = res.Locs.sort((a, b) => (a.Name < b.Name ? -1 : 1));
            this.locationId = this.locations[0].LocationId;
            this.doors = this.locations[0].Doors;
            this.TimeZone = this.locations[0].TimeZone;
            this.locations.forEach(x => x.Providers.sort((a, b) => (a.Name < b.Name ? -1 : 1)));

            if (this.locations[0].Providers.length > 0){
              this.locationData = this.locations[0].Providers[0].ProviderId;
              this.providerId = this.locations[0].Providers[0].ProviderId.split('#')[1];
            }

            let yearCurr = this.getYear();
            let monthCurr = this.getMonth();
            let dayCurr = this.getDay();

            this.today = new Date(+yearCurr, +monthCurr-1, +dayCurr);
            var startDay = 1;
            var d = this.today.getDay();

            this.weekStart = new Date(this.today.valueOf() - (d<=0 ? 7-startDay:d-startDay)*86400000);
            this.weekEnd = new Date(this.weekStart.valueOf() + 6*86400000);
            this.currTime = this.getActTime().replace(':','');

            this.monday = this.weekStart;
            this.tuesday = this.addDays(this.weekStart, 1);
            this.wednesday = this.addDays(this.weekStart, 2);
            this.thursday = this.addDays(this.weekStart, 3);
            this.friday = this.addDays(this.weekStart, 4);
            this.saturday = this.addDays(this.weekStart, 5);
            this.sunday = this.addDays(this.weekStart, 6);
            this.loadHours();
          }
          this.spinnerService.stop(spinnerRef);
          return res.Locs;
        }
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        return err;
      })
    )
  }

  loadHours(){
    this.hours = [];
    this.MonHours = [];
    this.TueHours = [];
    this.WedHours = [];
    this.ThuHours = [];
    this.FriHours = [];
    this.SatHours = [];
    this.SunHours = [];
    var spinnerRef = this.spinnerService.start($localize`:@@sche.loadingsche:`);
    this.operationHours$ = this.appointmentService.getOperationHours(this.businessId, this.locationId, this.providerId, this.datepipe.transform(this.monday, 'yyyy-MM-dd')).pipe(
      map((res: any) => {
        if (res.Code == 200){
          this.hours = res.Hours;
          this.MonHours = res.Monday;
          this.TueHours = res.Tuesday;
          this.WedHours = res.Wednesday;
          this.ThuHours = res.Thursday;
          this.FriHours = res.Friday;
          this.SatHours = res.Saturday;
          this.SunHours = res.Sunday;

          this.MonHours.sort((a, b) => (a.Time24 < b.Time24 ? -1 : 1))
          this.minHr = this.MonHours[0].Time24;
          this.maxHr = this.MonHours[this.MonHours.length-1].Time24;

          this.TueHours.sort((a, b) => (a.Time24 < b.Time24 ? -1 : 1))
          this.minHr = (this.TueHours[0].Time24 < this.minHr ? this.TueHours[0].Time24 : this.minHr);
          this.maxHr = (this.TueHours[this.TueHours.length-1].Time24 > this.maxHr ? this.TueHours[this.TueHours.length-1].Time24 : this.maxHr);

          this.WedHours.sort((a, b) => (a.Time24 < b.Time24 ? -1 : 1))
          this.minHr = (this.WedHours[0].Time24 < this.minHr ? this.WedHours[0].Time24 : this.minHr);
          this.maxHr = (this.WedHours[this.WedHours.length-1].Time24 > this.maxHr ? this.WedHours[this.WedHours.length-1].Time24 : this.maxHr);

          this.ThuHours.sort((a, b) => (a.Time24 < b.Time24 ? -1 : 1))
          this.minHr = (this.ThuHours[0].Time24 < this.minHr ? this.ThuHours[0].Time24 : this.minHr);
          this.maxHr = (this.ThuHours[this.ThuHours.length-1].Time24 > this.maxHr ? this.ThuHours[this.ThuHours.length-1].Time24 : this.maxHr);

          this.FriHours.sort((a, b) => (a.Time24 < b.Time24 ? -1 : 1))
          this.minHr = (this.FriHours[0].Time24 < this.minHr ? this.FriHours[0].Time24 : this.minHr);
          this.maxHr = (this.FriHours[this.FriHours.length-1].Time24 > this.maxHr ? this.FriHours[this.FriHours.length-1].Time24 : this.maxHr);

          this.SatHours.sort((a, b) => (a.Time24 < b.Time24 ? -1 : 1))
          this.minHr = (this.SatHours[0].Time24 < this.minHr ? this.SatHours[0].Time24 : this.minHr);
          this.maxHr = (this.SatHours[this.SatHours.length-1].Time24 > this.maxHr ? this.SatHours[this.SatHours.length-1].Time24 : this.maxHr);

          this.SunHours.sort((a, b) => (a.Time24 < b.Time24 ? -1 : 1))
          this.minHr = (this.SunHours[0].Time24 < this.minHr ? this.SunHours[0].Time24 : this.minHr);
          this.maxHr = (this.SunHours[this.SunHours.length-1].Time24 > this.maxHr ? this.SunHours[this.SunHours.length-1].Time24 : this.maxHr);

          console.log(this.minHr);
          console.log(this.maxHr);
          this.spinnerService.stop(spinnerRef);
          return res;
        }
      }), 
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        return err;
      })
    )
  }

  addDays(date, days) {
    const copy = new Date(Number(date))
    copy.setDate(date.getDate() + days)
    return copy
  }

  getDayData(timeGrl: string, dayNum: number): any{
    let result;
    let value = {};
    switch (dayNum){
      case 1: 
        result = this.MonHours.filter(val => val.Time == timeGrl);
        break;
      case 2: 
        result = this.TueHours.filter(val => val.Time == timeGrl);
        break;
      case 3: 
        result = this.WedHours.filter(val => val.Time == timeGrl);
        break;
      case 4: 
        result = this.ThuHours.filter(val => val.Time == timeGrl);
        break;
      case 5: 
        result = this.FriHours.filter(val => val.Time == timeGrl);
        break;
      case 6: 
        result = this.SatHours.filter(val => val.Time == timeGrl);
        break;
      case 7: 
        result = this.SunHours.filter(val => val.Time == timeGrl);
        break;
      default: 
        break;
    }
    if (result.length > 0 && result != undefined){
      value = result[0];
    }
    return value;
  }

  getDayInfo(dayNum: number): any{
    let result;
    switch (dayNum){
      case 1: 
        result = this.MonHours;
        break;
      case 2: 
        result = this.TueHours;
        break;
      case 3: 
        result = this.WedHours;
        break;
      case 4: 
        result = this.ThuHours;
        break;
      case 5: 
        result = this.FriHours;
        break;
      case 6: 
        result = this.SatHours;
        break;
      case 7: 
        result = this.SunHours;
        break;
      default: 
        break;
    }
    return result;
  }

  nextWeek(){
    let todNext = new Date();
    todNext = this.addDays(this.monday, 7);

    var startDay = 1;
    var d = todNext.getDay();
    this.weekStart = new Date(todNext.valueOf() - (d<=0 ? 7-startDay:d-startDay)*86400000);
    this.weekEnd = new Date(this.weekStart.valueOf() + 6*86400000);

    this.monday = this.weekStart;
    this.tuesday = this.addDays(this.weekStart, 1);
    this.wednesday = this.addDays(this.weekStart, 2);
    this.thursday = this.addDays(this.weekStart, 3);
    this.friday = this.addDays(this.weekStart, 4);
    this.saturday = this.addDays(this.weekStart, 5);
    this.sunday = this.addDays(this.weekStart, 6);

    this.currWeek = 0;
    this.loadHours();
  }

  prevWeek(){
    if (this.currWeek == 1) {return;}
    let todNext = new Date();
    todNext = this.addDays(this.monday, -7);

    var startDay = 1;
    var d = todNext.getDay();
    this.weekStart = new Date(todNext.valueOf() - (d<=0 ? 7-startDay:d-startDay)*86400000);
    this.weekEnd = new Date(this.weekStart.valueOf() + 6*86400000);

    this.monday = this.weekStart;
    this.tuesday = this.addDays(this.weekStart, 1);
    this.wednesday = this.addDays(this.weekStart, 2);
    this.thursday = this.addDays(this.weekStart, 3);
    this.friday = this.addDays(this.weekStart, 4);
    this.saturday = this.addDays(this.weekStart, 5);
    this.sunday = this.addDays(this.weekStart, 6);

    if (this.today >= this.monday && this.today <= this.sunday){
      this.currWeek = 1;
    } else {
      this.currWeek = 0;
    }
    this.loadHours();
  }

  newAppo(timeGrl: string, day: Date, dayNum: number){
    let result = this.getDayData(timeGrl, dayNum);
    let dayInfo = this.getDayInfo(dayNum);
    if (result == {}) { return; }
    if (result.Available == 0) { return; }

    let timeAppo = (result.Time.substring(6,8) == 'PM' ? (+result.Time.substring(0,2) == 12 ? result.Time.substring(0,5).replace(':','-') : (+result.Time.substring(0,2)+12).toString()+'-'+result.Time.substring(3,5)) : result.Time.substring(0,5).replace(':','-'));
    var spinnerRef = this.spinnerService.start($localize`:@@sche.loadingsche:`);
    this.validBusiness$ = this.businessService.getValidBusiness(this.businessId, this.locationId, this.providerId, (result.ServiceId == "" ? "_" : result.ServiceId), this.datepipe.transform(day, 'yyyy-MM-dd'), timeAppo).pipe(    
      map((res: any) => {
        if (res.Code == 200){
          this.spinnerService.stop(spinnerRef);
          const dialogRef = this.dialog.open(AppoDialogComponent, {
            width: '450px',
            height: '700px',
            data: {businessId: this.businessId, locationId: this.locationId, providerId: this.providerId, serviceId: result.ServiceId, appoTime: timeGrl, appoDate: this.datepipe.transform(day, 'yyyy-MM-dd'), doors: this.doors.split(','), dayData: dayInfo}
          });
          dialogRef.afterClosed().subscribe(result => {
            if (result != undefined){
              this.loadHours();
            }
          });
        }
        if (res.Code == 404){
          this.spinnerService.stop(spinnerRef);
          this.openSnackBar($localize`:@@host.companydisabled:`,$localize`:@@shared.error:`);
        }
        if (res.Code == 400){
          this.spinnerService.stop(spinnerRef);
          this.openSnackBar($localize`:@@host.noappos:`,$localize`:@@shared.error:`);
          this.loadHours();
        }
        if (res.Code == 500){
          this.spinnerService.stop(spinnerRef);
          this.openSnackBar($localize`:@@host.invalidTime:`,$localize`:@@shared.error:`);
          this.loadHours();
        }
        return res;
      }), 
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        return err;
      })
    );
  }

  onSelectLocation(event){
    this.locationData = event.value;
    this.locationId = event.value.split('#')[0];
    this.providerId = event.value.split('#')[1];

    let search = this.locations.filter(x => x.LocationId == this.locationId);
    this.doors = search[0].Doors;
    this.TimeZone = search[0].TimeZone;

    // let yearCurr = this.getYear();
    // let monthCurr = this.getMonth();
    // let dayCurr = this.getDay();

    // this.today = new Date(+yearCurr, +monthCurr-1, +dayCurr);
    // var startDay = 1;
    // var d = this.today.getDay();

    // this.weekStart = new Date(this.today.valueOf() - (d<=0 ? 7-startDay:d-startDay)*86400000);
    // this.weekEnd = new Date(this.weekStart.valueOf() + 6*86400000);
    this.currTime = this.getActTime().replace(':','');

    this.monday = this.weekStart;
    this.tuesday = this.addDays(this.weekStart, 1);
    this.wednesday = this.addDays(this.weekStart, 2);
    this.thursday = this.addDays(this.weekStart, 3);
    this.friday = this.addDays(this.weekStart, 4);
    this.saturday = this.addDays(this.weekStart, 5);
    this.sunday = this.addDays(this.weekStart, 6);
    this.loadHours();
  }

  refresh(){
    this.loadHours();
  }
  
  cancelTime(timeGrl: string, day: any){
    this.displayYesNo = true;
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      header: $localize`:@@sche.citastext:`, 
      message: $localize`:@@sche.deletetext:`, 
      success: false, 
      error: false, 
      warn: false,
      ask: this.displayYesNo
    };
    dialogConfig.width ='280px';
    dialogConfig.minWidth = '280px';
    dialogConfig.maxWidth = '280px';

    const dialogRef = this.dialog.open(DialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if(result != undefined){
        var spinnerRef = this.spinnerService.start($localize`:@@sche.deletingcitas:`);
        this.cancelAppos$ = this.appointmentService.putCancelAppos(this.businessId, this.locationId, this.providerId, this.datepipe.transform(day, 'yyyy-MM-dd') + '-' + timeGrl.toString().padStart(4,'0').substring(0,2) + '-' + timeGrl.toString().padStart(4,'0').substring(2,4), this.authService.businessLanguage()).pipe(
          map((res: any) => {
            if (res != null) {
              if (res.Code == 200){
                this.openSnackBar($localize`:@@sche.deletedssuccess:`, $localize`:@@sche.citastext:`);
                this.spinnerService.stop(spinnerRef);
                this.loadHours();
              }
            }
          })
          // switchMap(x => this.appointmentService.getOperationHours(this.businessId, this.locationId, this.providerId, this.datepipe.transform(this.monday, 'yyyy-MM-dd')).pipe(
          //   map((res: any) => {
          //     console.log("recarga con otro metodo");
          //     this.hours = [];
          //     this.MonHours = [];
          //     this.TueHours = [];
          //     this.WedHours = [];
          //     this.ThuHours = [];
          //     this.FriHours = [];
          //     this.SatHours = [];
          //     this.SunHours = [];
          //     if (res.Code == 200){
          //       this.hours = res.Hours;
          //       this.MonHours = res.Monday;
          //       this.TueHours = res.Tuesday;
          //       this.WedHours = res.Wednesday;
          //       this.ThuHours = res.Thursday;
          //       this.FriHours = res.Friday;
          //       this.SatHours = res.Saturday;
          //       this.SunHours = res.Sunday;
          //       this.spinnerService.stop(spinnerRef);
          //       return res;
          //     }
          //   })
          // )
        )
      }
    });
  }

  expandTime(timeGrl: string, day: any, timeNom: string, dayNum: number){
    let result = this.getDayData(timeNom, dayNum);
    if (result == {}) { return; }
    let res = this.resServices.filter(x => x.ServiceId == result.ServiceId);
    let nameService = '';
    if (res.length > 0){
      nameService = res[0].Name;
    }
    const dialogRef = this.dialog.open(ShowappoDialogComponent, {
      width: '450px',
      height: '700px',
      data: {businessId: this.businessId, locationId: this.locationId, providerId: this.providerId, service: nameService, appoTime: timeGrl, appoDate: this.datepipe.transform(day, 'yyyy-MM-dd')}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result != undefined) {
        if (result.cancelAppo ==1){
          this.loadHours();
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.subsMessages){
      this.subsMessages.unsubscribe();
    }
  }

  enableHour(timeGrl: string, day: any, timeNom: string, dayNum: number){
    var spinnerRef = this.spinnerService.start($localize`:@@sche.openhour:`);
    this.putAppo$ = this.appointmentService.putTimeAvailable(this.businessId, this.locationId, this.providerId, this.datepipe.transform(day, 'yyyy-MM-dd') + '-' + timeGrl.replace(':','-')).pipe(
      map((res: any) => {
        if (res != null) {
          if (res.Code == 200){
            // this.openDialog($localize`:@@sche.citastext:`, $localize`:@@sche.openhoursuccess:`, true, false, false);
            this.openSnackBar($localize`:@@sche.openhoursuccess:`, $localize`:@@sche.citastext:`);
            this.spinnerService.stop(spinnerRef);
            this.loadHours();
          }
        }
      })
    );
  }

  getActTime(): string{
    let options = {
      timeZone: this.TimeZone,
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    },
    formatter = new Intl.DateTimeFormat([], options);
    // var actual = formatter.format(new Date());
    var v = new Date();
    var actual = formatter.format(v.setMinutes(v.getMinutes()-14));
    var hour: string = (+actual.substring(0,2) == 24 ? '00' : (+actual.substring(0,2)).toString().padStart(2, '0'));
    var min: string = actual.substring(3,5).padStart(2,'0');
    return hour+':'+min;
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
      case 35: { 
        message = $localize`:@@learnMore.LMCON35:`;
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
