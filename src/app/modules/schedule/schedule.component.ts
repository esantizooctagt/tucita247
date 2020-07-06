import { Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { throwMatDuplicatedDrawerError } from '@angular/material/sidenav';

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
  constructor(
    private domSanitizer: DomSanitizer,
    private matIconRegistry: MatIconRegistry
  ) {
    this.matIconRegistry.addSvgIcon('new',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/newAppo.svg'));
    this.matIconRegistry.addSvgIcon('cancel',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/cancelAppos.svg'));
    this.matIconRegistry.addSvgIcon('view',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/view.svg'));
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

    console.log(this.currTime);
    this.monday = this.weekStart;
    this.tuesday = this.addDays(this.weekStart, 1);
    this.wednesday = this.addDays(this.weekStart, 2);
    this.thursday = this.addDays(this.weekStart, 3);
    this.friday = this.addDays(this.weekStart, 4);
    this.saturday = this.addDays(this.weekStart, 5);
    this.sunday = this.addDays(this.weekStart, 6);

    this.hours.push({'Time': '08:00 AM', 'Time24H': '08:00'},{'Time': '09:00 AM', 'Time24H': '09:00'},{'Time':'10:00 AM', 'Time24H': '10:00'}, {'Time': '02:00 PM', 'Time24H': '14:00'}, {'Time': '03:00 PM', 'Time24H': '15:00'}, {'Time': '04:00 PM', 'Time24H': '16:00'});
    this.MonHours.push({'Time': '09:00 AM', 'Bucket': 20, 'Available': 10, 'Used': 10}, {'Time': '10:00 AM', 'Bucket': 20, 'Available': 15, 'Used': 5});
    this.ThuHours.push({'Time': '10:00 AM', 'Bucket': 20, 'Available': 10, 'Used': 10}, {'Time': '03:00 PM', 'Bucket': 20, 'Available': 15, 'Used': 5});
    this.WedHours.push({'Time': '08:00 AM', 'Bucket': 20, 'Available': 20, 'Used': 0}, {'Time': '09:00 AM', 'Bucket': 20, 'Available': 20, 'Used': 0}, {'Time': '10:00 AM', 'Bucket': 20, 'Available': 20, 'Used': 0 }, {'Time': '03:00 PM', 'Bucket': 20, 'Available': 15, 'Used': 0});
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
  }

  newAppo(timeGrl: string, dayNum: number){
    console.log("new appo");
    let result = this.getAvailability(timeGrl, dayNum);
    console.log(result);
  }

  cancelTime(timeGrl: string, dayNum: number){

  }

  expandTime(timeGrl: string, dayNum: number){

  }

  validateDate(dt: Date, time: string): number{
    if (dt > this.today) {return 1;}
    console.log(dt);
    if (dt == this.today){
      let timeSch = '';
      timeSch = (time.substring(6,8) == 'PM' ? (+time.substring(0,2)+12).toString() + ':' + time.substring(3,5) : time.substring(0,5));
      console.log(timeSch);
      if (timeSch < this.currTime){ 
        return 0;
      } else {
        return 1;
      } 
    }
    if (dt < this.today) {return 0;}
  }

  validateDisDate(dt: Date, time: string): boolean{
    if (dt > this.today) {return false;}
    if (dt < this.today) {return true;}

    let timeSch = '';
    timeSch = (time.substring(6,8) == 'PM' ? (+time.substring(0,2)+12).toString() + ':' + time.substring(3,5) : time.substring(0,5));
    if (dt == this.today){
      if (timeSch < this.currTime){ 
        return true;
      } else {
        return false;
      } 
    }
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
    var hour: number = +actual.substring(0,2);
    var min: number = +actual.substring(3,5);

    return (hour.toString().padStart(2,'0')+':'+min.toString().padStart(2,'0')).trim();
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
