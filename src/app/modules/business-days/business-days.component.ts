import { Component, OnInit, ViewChild } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { MatCalendar } from '@angular/material/datepicker/calendar';
import { BusinessService } from '@app/services';
import { AuthService } from '@app/core/services';
import { catchError, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { SpinnerService } from '@app/shared/spinner.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-business-days',
  templateUrl: './business-days.component.html',
  styleUrls: ['./business-days.component.scss']
})
export class BusinessDaysComponent implements OnInit {
  @ViewChild('calendarjan', {static: false}) caljan: MatCalendar<Date>;
  @ViewChild('calendarfeb', {static: false}) calfeb: MatCalendar<Date>;
  @ViewChild('calendarmar', {static: false}) calmar: MatCalendar<Date>;
  @ViewChild('calendarapr', {static: false}) calapr: MatCalendar<Date>;
  @ViewChild('calendarmay', {static: false}) calmay: MatCalendar<Date>;
  @ViewChild('calendarjun', {static: false}) caljun: MatCalendar<Date>;
  @ViewChild('calendarjul', {static: false}) caljul: MatCalendar<Date>;
  @ViewChild('calendaraug', {static: false}) calaug: MatCalendar<Date>;
  @ViewChild('calendarsep', {static: false}) calsep: MatCalendar<Date>;
  @ViewChild('calendaroct', {static: false}) caloct: MatCalendar<Date>;
  @ViewChild('calendarnov', {static: false}) calnov: MatCalendar<Date>;
  @ViewChild('calendardec', {static: false}) caldec: MatCalendar<Date>;

  currYear: number = 0;
  navYear: number = 0;
  currYearAct: number = 0;
  businessId: string = '';
  daysOff$: Observable<any>;
  businessData: any;

  dateSelected: any[] = [];

  links = [{label:'Opening hours',link:'/businessope',active:0}, {label:'Special days',link:'/businessdays',active:1}];
  activeLink = this.links[0];
  background: ThemePalette = undefined;
  
  constructor(
    private authService: AuthService,
    private _snackBar: MatSnackBar,
    private businessService: BusinessService,
    private spinnerService: SpinnerService
    
  ) { }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
    });
  }

  ngOnInit(): void {
    let dateYear = new Date();
    this.currYear = dateYear.getFullYear();
    this.currYearAct = 1;
    this.businessId = this.authService.businessId();

    var spinnerRef = this.spinnerService.start("Loading Special Days...");
    this.daysOff$ = this.businessService.getDaysOff(this.businessId, this.currYear).pipe(
      map((res: any) => {
        if (res.Code == 200){
          this.businessData = JSON.parse(res.Business);
          this.dateSelected = this.businessData.DaysOff;
          setTimeout(() => {
            this.setMoths(this.currYear);
          }, 1);
        }
        this.spinnerService.stop(spinnerRef);
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        return err;
      })
    );
  }

  setMoths(selYear: number){
    if (this.caljan != undefined) { 
      this.caljan._goToDateInView(new Date(selYear, 0, 1), "month");
    }
    if (this.calfeb != undefined) { 
      this.calfeb._goToDateInView(new Date(selYear, 1, 1), "month");
    }
    if (this.calmar != undefined) { 
      this.calmar._goToDateInView(new Date(selYear, 2, 1), "month");
    }
    if (this.calapr != undefined) { 
      this.calapr._goToDateInView(new Date(selYear, 3, 1), "month");
    }
    if (this.calmay != undefined) { 
      this.calmay._goToDateInView(new Date(selYear, 4, 1), "month");
    }
    if (this.caljun != undefined) { 
      this.caljun._goToDateInView(new Date(selYear, 5, 1), "month");
    }
    if (this.caljul != undefined) { 
      this.caljul._goToDateInView(new Date(selYear, 6, 1), "month");
    }
    if (this.calaug != undefined) { 
      this.calaug._goToDateInView(new Date(selYear, 7, 1), "month");
    }
    if (this.calsep != undefined) { 
      this.calsep._goToDateInView(new Date(selYear, 8, 1), "month");
    }
    if (this.caloct != undefined) { 
      this.caloct._goToDateInView(new Date(selYear, 9, 1), "month");
    }
    if (this.calnov != undefined) { 
      this.calnov._goToDateInView(new Date(selYear, 10, 1), "month");
    }
    if (this.caldec != undefined) { 
      this.caldec._goToDateInView(new Date(selYear, 11, 1), "month");
    }
  }

  isSelected = (event: any) => {
    const date = event.getFullYear() + "-" + ("00" + (event.getMonth() + 1)).slice(-2) + "-" + ("00" + event.getDate()).slice(-2);
    return this.dateSelected.find(x => x == date) ? "selected" : null;
  };

  onSelect(event: any, calendar: any) {
    const date = event.getFullYear() + "-" + ("00" + (event.getMonth() + 1)).slice(-2) + "-" + ("00" + event.getDate()).slice(-2);
    const index = this.dateSelected.findIndex(x => x == date);
    
    if (index < 0) {
      this.dateSelected.push(date);
      // add special days
      this.daysOff$ = this.businessService.updateDaysOff(this.businessId, '_', '_', date, 'add').pipe(
        map((res: any) => {
          if (res.Code == 200){
            this.businessData = JSON.parse(res.Business);
            this.dateSelected = this.businessData.DaysOff;
            setTimeout(() => {
              this.setMoths(this.currYear);
            }, 1);
          }
          this.openSnackBar("Day added successfully","Special Days");
        }),
        catchError(err => {
          this.openSnackBar("Something goes wrong, try again","Check-in");
          return err;
        })
      );
    } 
    else { 
      this.dateSelected.splice(index, 1);
      // remove special days
    }  
    calendar.updateTodaysDate();
  }

  nextYear(){
    this.navYear = (this.navYear == 0 ? this.currYear + 1 : this.navYear + 1);
    if (this.navYear == this.currYear) { this.currYearAct = 1; } else { this.currYearAct = 0;}

    var spinnerRef = this.spinnerService.start("Loading Special Days...");
    this.daysOff$ = this.businessService.getDaysOff(this.businessId, this.navYear).pipe(
      map((res: any) => {
        this.dateSelected = [];
        if (res.Code == 200){
          this.businessData = JSON.parse(res.Business);
          this.dateSelected = this.businessData.DaysOff;
        }
        setTimeout(() => {
          this.setMoths(this.navYear);
        }, 1);
        this.spinnerService.stop(spinnerRef);
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        return err;
      })
    );
  }

  prevYear(){
    if (this.navYear == 0){return;}
    if (this.navYear == this.currYear) {return;}
    this.navYear = this.navYear - 1;
    if (this.navYear == this.currYear) { this.currYearAct = 1; } else { this.currYearAct = 0;}

    var spinnerRef = this.spinnerService.start("Loading Special Days...");
    this.daysOff$ = this.businessService.getDaysOff(this.businessId, this.navYear).pipe(
      map((res: any) => {
        this.dateSelected = [];
        if (res.Code == 200){
          this.businessData = JSON.parse(res.Business);
          this.dateSelected = this.businessData.DaysOff;
        }
        setTimeout(() => {
          this.setMoths(this.navYear);
        }, 1);
        this.spinnerService.stop(spinnerRef);
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        return err;
      })
    );
  }

}
