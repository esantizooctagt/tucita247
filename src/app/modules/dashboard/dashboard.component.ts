import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '@app/core/services';
import { LocationService, BusinessService } from '@app/services';
import { map, catchError, mergeMap, switchMap } from 'rxjs/operators';
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

  selectedLoc: string = '';
  resultLoc: any[] =[];
  perLocation: number = 0;
  quantity: number = 0;

  series: any[];
  // options
  showXAxis: boolean = true;
  showYAxis: boolean = true;
  gradient: boolean = true;
  showLegend: boolean = false;
  showXAxisLabel: boolean = false;
  xAxisLabel: string = ''; //Current Month
  showYAxisLabel: boolean = false;
  yAxisLabel: string = ''; //Average cita
  legendTitle: string = ''; //Locations

  tabSelected = 0;

  colorScheme = {
    domain: ['#FF4F00']
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
                this.perLocation = this.resultLoc[0].PerLocation;
                this.quantity = this.resultLoc[0].Quantity;
              }
              this.spinnerService.stop(spinnerRef);
              return res;
            }
          })
        )),
        switchMap(_ => 
          this.appointmentService.getApposAverage(this.selectedLoc.replace('LOC#',''), initDate).pipe(
            map((res: any) => {
              if (res != null){
                let content = [];
                res.Data.forEach(item => {
                  let line = {
                    name: item.DateAppo.substring(8,10),
                    value: item.Average
                  }
                  content.push(line);
                });
                this.series = content;

                Object.assign(this, this.series);
                return res;
              }
            })
          )
        ),
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
              this.perLocation = this.resultLoc[0].PerLocation;
              this.quantity = this.resultLoc[0].Quantity;
            }
            this.spinnerService.stop(spinnerRef);
            return res;
          }
        }),
        switchMap(_ => 
          this.appointmentService.getApposAverage(this.selectedLoc.replace('LOC#',''), initDate).pipe(
            map((res: any) => {
              if (res != null){
                let content = [];
                res.Data.forEach(item => {
                  let line = {
                    name: item.DateAppo.substring(8,10),
                    value: item.Average
                  }
                  content.push(line);
                });
                this.series = content;

                Object.assign(this, this.series);
                return res;
              }
            })
          )
        ),
        catchError(err => {
          this.spinnerService.stop(spinnerRef);
          this.onError = err.Message;
          return '0';
        })
      );
    }

    setInterval(() => { 
      if (this.locationId != ''){
        this.quantityPeople$ = this.locationService.getLocationQuantityAll(this.businessId, this.locationId).pipe(
          map((res: any) => {
            if (res != null){
              this.resultLoc = res.Data;
              if (this.resultLoc.length > 0){
                this.selectedLoc = this.resultLoc[0].LocationId;
                this.perLocation = this.resultLoc[0].PerLocation;
                this.quantity = this.resultLoc[0].Quantity;
              }
              return res;
            }
          }),
          catchError(err => {
            this.onError = err.Message;
            return '0';
          })
        );
      }
    }, 120000);
  }

  onSelectLocation(event){
    let locationId = event.source.value;
    let locSelected;

    let initDate = '';
    let yearCurr = this.getYear();
    let monthCurr = this.getMonth();
    let dayCurr = this.getDay();
    initDate = yearCurr+'-'+monthCurr+'-'+dayCurr;

    locSelected =  this.resultLoc.filter(x => x.LocationId == locationId);
    if (locSelected.length > 0){
      this.perLocation = locSelected[0].PerLocation;
      this.quantity = locSelected[0].Quantity;

      this.avgData$ = this.appointmentService.getApposAverage(this.selectedLoc.replace('LOC#',''), initDate).pipe(
        map((res: any) => {
          if (res != null){
            let content = [];
            res.Data.forEach(item => {
              let line = {
                name: item.DateAppo.substring(8,10),
                value: (this.tabSelected == 0 ? item.Average : item.Qty)
              }
              content.push(line);
            });
            this.series = content;
            Object.assign(this, this.series);
            return res;
          }
        }),
        catchError(err => {
          this.onError = err.Message;
          return '0';
        })
      );
    } else {
      this.perLocation = 0;
      this.quantity = 0;
    }
  }

  changeGraph(event){
    let initDate = '';
    let yearCurr = this.getYear();
    let monthCurr = this.getMonth();
    let dayCurr = this.getDay();
    initDate = yearCurr+'-'+monthCurr+'-'+dayCurr;

    let type = event.index;
    this.tabSelected = type;
    this.avgData$ = this.appointmentService.getApposAverage(this.selectedLoc.replace('LOC#',''), initDate).pipe(
      map((res: any) => {
        if (res != null){
          let content = [];
          res.Data.forEach(item => {
            let line = {
              name: item.DateAppo.substring(8,10),
              value: (type == 0 ? item.Average : item.Qty)
            }
            content.push(line);
          });
          this.series = content;
          Object.assign(this, this.series);
          return res;
        }
      }),
      catchError(err => {
        this.onError = err.Message;
        return '0';
      })
    );
  }

  sumAdditional(packs: any) : number{
    return packs.reduce((sum, current) => sum + current.Appointments, 0);
  }

  sumUsed(packs: any, used: number): number{
    return packs.reduce((sum, current) => sum + current.Used, 0)+used;
  }

  sumAvailable(packs: any, available: number): number{
    return packs.reduce((sum, current) => sum + current.Available, 0)+available;
  }
  
  getExpire(packs: any): string{
    let sortPack;
    sortPack = packs.sort((a,b) => (+a.DueDate.replace('-','') > +b.DueDate.replace('-','')) ? 1 : ((+b.DueDate.replace('-','') > +a.DueDate.replace('-','')) ? -1 : 0));
    return sortPack[0].DueDate;
  }

  getExpireCitas(packs: any): number{
    let sortPack;
    sortPack = packs.sort((a,b) => (+a.DueDate.replace('-','') > +b.DueDate.replace('-','')) ? 1 : ((+b.DueDate.replace('-','') > +a.DueDate.replace('-','')) ? -1 : 0));
    return sortPack[0].Available;
  }

  addCitas(){

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