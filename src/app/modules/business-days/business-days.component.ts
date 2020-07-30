import { Component, OnInit, ViewChild } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { MatCalendar } from '@angular/material/datepicker/calendar';
import { BusinessService } from '@app/services';
import { AuthService } from '@app/core/services';
import { catchError, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { SpinnerService } from '@app/shared/spinner.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';

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
  locationId: string = '_';
  serviceId: string = '_';
  daysOff$: Observable<any>;
  savedaysOff$: Observable<any>;
  businessData: any;
  locationData: any;
  serviceData: any;

  dateSelected: any[] = [];

  links = [{label:'Opening hours',link:'/businessope',active:0}, {label:'Special days',link:'/businessdays',active:1}];
  activeLink = this.links[0];
  background: ThemePalette = undefined;
  
  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
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
    this.locationId = this.route.snapshot.paramMap.get('locations') == null ? "_" : "1";
    if (this.route.snapshot.paramMap.get('provider') == null){
      this.serviceId = "_";
    } else {
      this.locationId = "1";
      this.serviceId = "1";
    }
    var spinnerRef = this.spinnerService.start("Loading Special Days...");
    this.daysOff$ = this.businessService.getDaysOff(this.businessId, this.locationId, this.serviceId, this.currYear).pipe(
      map((res: any) => {
        if (res.Code == 200){
          if (this.locationId == "_") {
            this.businessData = res.Data[0];
            this.dateSelected = this.businessData.DaysOff;
          }
          if (this.locationId != "_" && this.serviceId == "_"){
            this.locationData = res.Data;
            this.locationId = this.locationData[0].LocationId;
            this.dateSelected = this.locationData[0].DaysOff;
          }
          if (this.serviceId != "_"){
            this.serviceData = res.Data;
            this.serviceId = this.serviceData[0].LocationId + '#' + this.serviceData[0].Services[0].ServiceId;
            this.dateSelected = this.serviceData[0].Services[0].DaysOff;
          }
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
      this.caljan.updateTodaysDate();
    }
    if (this.calfeb != undefined) { 
      this.calfeb._goToDateInView(new Date(selYear, 1, 1), "month");
      this.calfeb.updateTodaysDate();
    }
    if (this.calmar != undefined) { 
      this.calmar._goToDateInView(new Date(selYear, 2, 1), "month");
      this.calmar.updateTodaysDate();
    }
    if (this.calapr != undefined) { 
      this.calapr._goToDateInView(new Date(selYear, 3, 1), "month");
      this.calapr.updateTodaysDate();
    }
    if (this.calmay != undefined) { 
      this.calmay._goToDateInView(new Date(selYear, 4, 1), "month");
      this.calmay.updateTodaysDate();
    }
    if (this.caljun != undefined) { 
      this.caljun._goToDateInView(new Date(selYear, 5, 1), "month");
      this.caljun.updateTodaysDate();
    }
    if (this.caljul != undefined) { 
      this.caljul._goToDateInView(new Date(selYear, 6, 1), "month");
      this.caljul.updateTodaysDate();
    }
    if (this.calaug != undefined) { 
      this.calaug._goToDateInView(new Date(selYear, 7, 1), "month");
      this.calaug.updateTodaysDate();
    }
    if (this.calsep != undefined) { 
      this.calsep._goToDateInView(new Date(selYear, 8, 1), "month");
      this.calsep.updateTodaysDate();
    }
    if (this.caloct != undefined) { 
      this.caloct._goToDateInView(new Date(selYear, 9, 1), "month");
      this.caloct.updateTodaysDate();
    }
    if (this.calnov != undefined) { 
      this.calnov._goToDateInView(new Date(selYear, 10, 1), "month");
      this.calnov.updateTodaysDate();
    }
    if (this.caldec != undefined) { 
      this.caldec._goToDateInView(new Date(selYear, 11, 1), "month");
      this.caldec.updateTodaysDate();
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
      this.savedaysOff$ = this.businessService.updateDaysOff(this.businessId, (this.serviceId != '_' ? this.serviceId.split('#')[0] : this.locationId), (this.serviceId == '_' ? '_' : this.serviceId.split('#')[1]), date, 'add').pipe(
        map((res: any) => {
          if (res.Code == 200){
            this.openSnackBar("Day add successfully","Special Days"); 
          } else {
            this.openSnackBar("Something goes wrong, try again","Special Days");
          }
        }),
        catchError(err => {
          this.openSnackBar("Something goes wrong, try again","Special Days");
          return err;
        })
      );
    } 
    else { 
      this.dateSelected.splice(index, 1);
      // remove special days
      this.savedaysOff$ = this.businessService.updateDaysOff(this.businessId, (this.serviceId != '_' ? this.serviceId.split('#')[0] : this.locationId), (this.serviceId == '_' ? '_' : this.serviceId.split('#')[1]), date, 'rem').pipe(
        map((res: any) => {
          if (res.Code == 200){
            this.openSnackBar("Day remove successfully","Special Days"); 
          } else {
            this.openSnackBar("Something goes wrong, try again","Special Days");
          }
        }),
        catchError(err => {
          this.openSnackBar("Something goes wrong, try again","Special Days");
          return err;
        })
      );
    }  
    calendar.updateTodaysDate();
  }

  nextYear(){
    this.navYear = (this.navYear == 0 ? this.currYear + 1 : this.navYear + 1);
    if (this.navYear == this.currYear) { this.currYearAct = 1; } else { this.currYearAct = 0;}

    var spinnerRef = this.spinnerService.start("Loading Special Days...");
    this.daysOff$ = this.businessService.getDaysOff(this.businessId, this.locationId, (this.serviceId == '_' ? '_' : this.serviceId.split('#')[1]), this.navYear).pipe(
      map((res: any) => {
        this.dateSelected = [];
        if (res.Code == 200){
          if (this.locationId == "_") {
            this.businessData = res.Data[0];
            this.dateSelected = this.businessData.DaysOff;
          }
          if (this.locationId != "_" && this.serviceId == "_"){
            this.locationData = res.Data;
            this.locationId = this.locationId;
            let loc = this.locationData.filter(x => x.LocationId == this.locationId);
            this.dateSelected = loc[0].DaysOff;
          }
          if (this.serviceId != "_"){
            this.serviceData = res.Data;
            this.serviceId = this.serviceId;
            let loc = this.serviceData.filter(y => y.LocationId == this.serviceId.split('#')[0]);
            let serv = loc[0].Services.filter(z => z.ServiceId == this.serviceId.split('#')[1]);
            this.dateSelected = serv[0].DaysOff;
          }
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
    this.daysOff$ = this.businessService.getDaysOff(this.businessId, this.locationId, (this.serviceId == '_' ? '_' : this.serviceId.split('#')[1]), this.navYear).pipe(
      map((res: any) => {
        this.dateSelected = [];
        if (res.Code == 200){
          if (this.locationId == "_") {
            this.businessData = res.Data[0];
            this.dateSelected = this.businessData.DaysOff;
          }
          if (this.locationId != "_" && this.serviceId == "_"){
            this.locationData = res.Data;
            this.locationId = this.locationId;
            let loc = this.locationData.filter(x => x.LocationId == this.locationId);
            this.dateSelected = loc[0].DaysOff;
          }
          if (this.serviceId != "_"){
            this.serviceData = res.Data;
            this.serviceId = this.serviceId;
            let loc = this.serviceData.filter(y => y.LocationId == this.serviceId.split('#')[0]);
            let serv = loc[0].Services.filter(z => z.ServiceId == this.serviceId.split('#')[1]);
            this.dateSelected = serv[0].DaysOff;
          }
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

  onLocationChange(event){
    if (event.value == '') {return;}
    let loc = this.locationData.filter(x => x.LocationId == event.value);

    this.dateSelected = [];
    this.locationId = event.value;
    this.dateSelected = loc[0].DaysOff;
    setTimeout(() => {
      this.setMoths((this.navYear == 0 ? this.currYear : this.navYear));
    }, 1);
  }

  onServiceChange(event){
    if (event.value == '') {return;}
    let loc = this.serviceData.filter(x => x.LocationId == event.value.split('#')[0]);
    let serv = loc[0].Services.filter(y => y.ServiceId == event.value.split('#')[1]);

    this.dateSelected = [];
    this.serviceId = event.value;
    this.dateSelected = serv[0].DaysOff;
    setTimeout(() => {
      this.setMoths((this.navYear == 0 ? this.currYear : this.navYear));
    }, 1);
  }

}
