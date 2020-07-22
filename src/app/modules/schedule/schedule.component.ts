import { Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { LocationService } from '@app/services';
import { map, catchError } from 'rxjs/operators';
import { SpinnerService } from '@app/shared/spinner.service';
import { AuthService } from '@app/core/services';
import { AppoDialogComponent } from '@app/shared/appo-dialog/appo-dialog.component';
import { ShowappoDialogComponent } from '@app/shared/showappo-dialog/showappo-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { AppointmentService } from '@app/services/appointment.service';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit {
  currWeek: number = 1;
  currTime: string = '';
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

  businessId: string = '';
  doors: string = '';

  locationData$: Observable<any[]>;
  operationHours$: Observable<any>;
  locationData: string = '';
  locationId: string = '';
  serviceId: string = '';
  
  constructor(
    private authService: AuthService,
    private domSanitizer: DomSanitizer,
    private matIconRegistry: MatIconRegistry,
    private locationService: LocationService,
    private spinnerService: SpinnerService,
    private appointmentService: AppointmentService,
    public dialog: MatDialog,
    public datepipe: DatePipe
  ) {
    this.matIconRegistry.addSvgIcon('new',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/newAppo.svg'));
    this.matIconRegistry.addSvgIcon('cancel02',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/cancelAppos.svg'));
    this.matIconRegistry.addSvgIcon('view',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/expand02.svg'));
   }

  ngOnInit(): void {
    let yearCurr = this.getYear();
    let monthCurr = this.getMonth();
    let dayCurr = this.getDay();

    this.today = new Date(+yearCurr, +monthCurr-1, +dayCurr);
    var startDay = 1;
    var d = this.today.getDay();
    this.weekStart = new Date(this.today.valueOf() - (d<=0 ? 7-startDay:d-startDay)*86400000);
    this.weekEnd = new Date(this.weekStart.valueOf() + 6*86400000);
    this.currTime = this.getActTime();

    this.monday = this.weekStart;
    this.tuesday = this.addDays(this.weekStart, 1);
    this.wednesday = this.addDays(this.weekStart, 2);
    this.thursday = this.addDays(this.weekStart, 3);
    this.friday = this.addDays(this.weekStart, 4);
    this.saturday = this.addDays(this.weekStart, 5);
    this.sunday = this.addDays(this.weekStart, 6);

    this.businessId = this.authService.businessId();
    var spinnerRef = this.spinnerService.start("Loading Schedule...");
    this.locationData$ = this.locationService.getLocationsHost(this.businessId).pipe(
      map((res: any) => {
        if (res.Code == 200){
          if (res.Locs.length > 0){
            this.locationData = res.Locs[0];
            this.locationId = res.Locs[0].LocationId;
            this.doors = res.Locs[0].Doors;
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
    this.operationHours$ = this.appointmentService.getOperationHours(this.businessId, this.locationId, this.datepipe.transform(this.monday, 'yyyy-MM-dd')).pipe(
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
          return res;
        }
      }), 
      catchError(err => {
        return err;
      })
    )
    // this.hours.push({'Time': '08:00 AM', 'Time24H': '08:00'},{'Time': '09:00 AM', 'Time24H': '09:00'},{'Time':'10:00 AM', 'Time24H': '10:00'},{'Time':'11:00 AM', 'Time24H': '11:00'}, {'Time': '02:00 PM', 'Time24H': '14:00'}, {'Time': '03:00 PM', 'Time24H': '15:00'}, {'Time': '04:00 PM', 'Time24H': '16:00'});
    // this.MonHours.push({'Time': '09:00 AM', 'Bucket': 20, 'Available': 10, 'Used': 10}, {'Time': '10:00 AM', 'Bucket': 20, 'Available': 15, 'Used': 5}, {'Time': '11:00 AM', 'Bucket': 20, 'Available': 10, 'Used': 10});
    // this.ThuHours.push({'Time': '10:00 AM', 'Bucket': 20, 'Available': 10, 'Used': 10}, {'Time': '03:00 PM', 'Bucket': 20, 'Available': 15, 'Used': 5});
    // this.WedHours.push({'Time': '08:00 AM', 'Bucket': 20, 'Available': 20, 'Used': 0}, {'Time': '09:00 AM', 'Bucket': 20, 'Available': 20, 'Used': 0}, {'Time': '10:00 AM', 'Bucket': 20, 'Available': 20, 'Used': 0 }, {'Time': '03:00 PM', 'Bucket': 20, 'Available': 15, 'Used': 0});
  }

  addDays(date, days) {
    const copy = new Date(Number(date))
    copy.setDate(date.getDate() + days)
    return copy
  }

  getBucket(timeGrl: string, dayNum: number): number{
    let result;
    let value = 0;
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
      value = result[0].Bucket;
    }
    return value;
  }

  getAvailability(timeGrl: string, dayNum: number): string{
    let result;
    let value = '0';
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
      value = result[0].Available.toString();
    }
    return value;
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
    let result = this.getAvailability(timeGrl, dayNum);
    let timeSel = (timeGrl.substring(6) == 'PM' ? (+timeGrl.substring(0,2)+12).toString() + '-' + timeGrl.substring(3,5) : timeGrl.replace(':','-').substring(0,5));
    if (result == '0') { return; }
    const dialogRef = this.dialog.open(AppoDialogComponent, {
      width: '450px',
      height: '700px',
      data: {businessId: this.businessId, locationId: this.locationId, appoTime: timeSel, appoDate: this.datepipe.transform(day, 'yyyy-MM-dd'), doors: this.doors.split(',')}
    });    
  }

  onSelectLocation(event){
    this.locationData = event.value;
    this.locationId = event.value.LocationId;
    this.doors = event.value.Doors;
    this.loadHours();
  }

  cancelTime(timeGrl: string, dayNum: number){

  }

  expandTime(timeGrl: Date, day: any){
    const dialogRef = this.dialog.open(ShowappoDialogComponent, {
      width: '450px',
      height: '700px',
      data: {businessId: this.businessId, locationId: this.locationId, serviceId: this.serviceId, appoTime: timeGrl, appoDate: this.datepipe.transform(day, 'yyyy-MM-dd')}
    });
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
    var hour: string = (+actual.substring(0,2) == 24 ? '00' : actual.substring(0,2).padStart(2, '0'));
    var min: string = actual.substring(3,5).padStart(2,'0');

    return hour+':'+min;
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
