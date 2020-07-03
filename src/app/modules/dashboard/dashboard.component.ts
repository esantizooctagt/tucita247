import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '@app/core/services';
import { LocationService, BusinessService } from '@app/services';
import { map, catchError, mergeMap } from 'rxjs/operators';
import { SpinnerService } from '@app/shared/spinner.service';
import { AppointmentService } from '@app/services/appointment.service';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  quantityPeople$: Observable<any>;
  appos$: Observable<any>;
  avgData$: Observable<any[]>;
  businessId: string = '';
  onError: string = '';
  locationId: string = '';
  doorId: string = '';
  userId: string = '';
  isAdmin: number = 0;

  // locationValue: string = '';
  // qtyPeople: number = 0;
  // perLocation: number = 0;
  // LocationName = [];

  selectedLoc: string = '';
  resultLoc: any[] =[];
  perLocation: number = 0;
  quantity: number = 0;
  // locationSelected: any[] =[];

  series: any[] = [];
  view: any[] = [700, 400];
  // options
  showXAxis: boolean = true;
  showYAxis: boolean = true;
  gradient: boolean = true;
  showLegend: boolean = true;
  showXAxisLabel: boolean = true;
  xAxisLabel: string = 'Current Month';
  showYAxisLabel: boolean = true;
  yAxisLabel: string = 'Average cita';
  legendTitle: string = 'Locations';

  colorScheme = {
    domain: ['#FF4F00', '#C9C9C9', '#AAAAAA']
  };

  constructor(
    private authService: AuthService,
    private locationService: LocationService,
    private businessService: BusinessService,
    private appointmentService: AppointmentService,
    private spinnerService: SpinnerService
  ) { }

  ngOnInit(): void {
    var spinnerRef = this.spinnerService.start("Loading Dashboard...");
    this.businessId = this.authService.businessId();
    this.isAdmin = this.authService.isAdmin();
    this.userId = this.authService.userId();

    this.appos$ = this.businessService.getBusinessAppos(this.businessId).pipe(
      map((res: any) => {
        if (res != null){
          return res;
        }
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        this.onError = err.Message;
        return err;
      })
    );

    if (this.isAdmin == 0){
      this.quantityPeople$ = this.appointmentService.getHostLocations(this.businessId, this.userId).pipe(
        map((res: any) => {
          if (res.Locs != null){
            this.locationId = res.Locs.LocationId;
            this.doorId = res.Locs.Door;
            return 0;
          }
        }),
        mergeMap(x => this.locationService.getLocationQuantityAll(this.businessId, this.locationId).pipe(
          map((res: any) => {
            if (res != null){
              this.resultLoc = res.Data;
              if (this.resultLoc.length > 0){
                this.selectedLoc = this.resultLoc[0].LocationId;
              }
              this.spinnerService.stop(spinnerRef);
              return res;
            }
          })
        )),
        catchError(err => {
          this.spinnerService.stop(spinnerRef);
          this.onError = err.Message;
          return '0';
        })
      );
    } else {
      this.locationId = '_';
      this.quantityPeople$ = this.locationService.getLocationQuantityAll(this.businessId, this.locationId).pipe(
        map((res: any) => {
          if (res != null){
            this.resultLoc = res.Data;
            if (this.resultLoc.length > 0){
              this.selectedLoc = this.resultLoc[0].LocationId;
            }
            this.spinnerService.stop(spinnerRef);
            return res;
          }
        }),
        catchError(err => {
          this.spinnerService.stop(spinnerRef);
          this.onError = err.Message;
          return '0';
        })
      );
    }

    let initDate = '';
    let yearCurr = this.getYear();
    let monthCurr = this.getMonth();
    let dayCurr = this.getDay();
    initDate = yearCurr+'-'+monthCurr+'-'+dayCurr;
    let result = [];
    for (let i=1; i<=+dayCurr; i++){
      let data = {
        name: i,
        series: []
      }
      result.push(data);
    }
    console.log(result);
    
    this.avgData$ = this.appointmentService.getApposAverage(this.businessId, initDate).pipe(
      map((res: any) => {
        if (res != null){
          let content = [];
          let i: number = 0;
          res.forEach(loc =>{
            content[i] = [];
            loc.Data.forEach(item => {
              let line = {
                name: item.DateAppo,
                value: item.Average
              }
              content[i].push(line);
            });
            let data = {
              name: loc.Name,
              series: content[i]
            }
            this.series.push(data);
            i = i + 1;
          });
          this.series = [...this.series];
          Object.assign(this, this.series);
          this.spinnerService.stop(spinnerRef);
          return res;
        }
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        this.onError = err.Message;
        return '0';
      })
    );

    setInterval(() => { 
      if (this.locationId != ''){
        this.quantityPeople$ = this.locationService.getLocationQuantityAll(this.businessId, this.locationId).pipe(
          map((res: any) => {
            if (res != null){
              this.resultLoc = res.Data;
              console.log(this.resultLoc);
              return res;
            }
          }),
          catchError(err => {
            this.onError = err.Message;
            return '0';
          })
        );
      }
    }, 30000);
  }

  onSelectLocation(locationId: string){
    let locSelected;
    locSelected =  this.resultLoc.filter(x => x.LocationId == locationId);
    this.perLocation = locSelected.PerLocation;
    this.quantity = locSelected.Quantity;
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