import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '@app/core/services';
import { LocationService, BusinessService } from '@app/services';
import { map, catchError, mergeMap } from 'rxjs/operators';
import { SpinnerService } from '@app/shared/spinner.service';
import { AppointmentService } from '@app/services/appointment.service';
import { runInThisContext } from 'vm';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  quantityPeople$: Observable<any>;
  appos$: Observable<any>;
  avgData$: Observable<any>;
  businessId: string = '';
  onError: string = '';
  locationId: string = '';
  doorId: string = '';
  userId: string = '';
  isAdmin: number = 0;
  qtyPeople = [];
  perLocation = [];
  LocationName = [];

  avgAppos: any;

  constructor(
    private authService: AuthService,
    private locationService: LocationService,
    private businessService: BusinessService,
    private appointmentService: AppointmentService,
    private spinnerService: SpinnerService
  ) { }

  ngOnInit(): void {
    let dataAxis = [];
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
              let i =0;
              res.Data.forEach(item => {
                this.qtyPeople[i] = item.Quantity;
                this.perLocation[i] = (+this.qtyPeople[i] / +item.TotLocation)*100;  
                this.LocationName[i] = item.Name;
                i = i +1;
              });
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
            let i =0;
            res.Data.forEach(item => {
              this.qtyPeople[i] = item.Quantity;
              this.perLocation[i] = (+this.qtyPeople[i] / +item.TotLocation)*100;  
              this.LocationName[i] = item.Name;
              i = i +1;
            });
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
    
    let averageData = [];
    let dataShadow = [];
    let initDate = '2020-06-16'
    this.avgData$ = this.appointmentService.getApposAverage(this.businessId, initDate).pipe(
      map((res: any) => {
        if (res != null){
          let maxVal = 0;
          let maxInvoice = 0;
          let series = [];
          let content = [];
          let dataAxis = [];
          console.log(res);
          res.forEach(loc =>{
            let i: number = 0;
            res.Data.forEach(item => {
              let line = {
                Qty: item.Qty
              }
              content[i].push(line);
              dataAxis[i].push(item.DateAppo);
            });
            let data = {
              name: loc.Name,
              type: 'bar',
              itemStyle: {
                normal: {
                  color: '#092e66',
                },
                emphasis: {
                  color: '#abc6ff',
                }
              },
              data: content[i]
            }
            series.push(loc.Name);
          });
          console.log(series);
          // res.forEach(element => {
          //   if (element.StoreId == ''){
          //     dataAxis.push(element.dateAppo);
          //     averageData.push(element.Sale);
          //     if (maxVal < element.avg){
          //       maxVal = element.avg;
          //     }
          //   }
          // });

          // // yMax = maxVal;
          // // yMaxDoctos = maxInvoice;

          this.avgAppos = {
            title: {
              text: 'Average time'
            },
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'shadow'
              }
            },
            grid: {
              left: '3%',
              right: '4%',
              bottom: '3%',
              containLabel: true
            },
            xAxis: {
              data: dataAxis,
              axisLabel: {
                inside: false,
                textStyle: {
                  color: '#000'
                }
              },
              axisTick: {
                show: false
              },
              axisLine: {
                show: false
              },
              z: 10
            },
            yAxis: {
              axisLine: {
                show: false
              },
              axisTick: {
                show: false
              },
              axisLabel: {
                textStyle: {
                  color: '#999'
                }
              }
            },
            dataZoom: [
              {
                type: 'inside'
              }
            ],
            series: series
          };

          console.log(this.avgAppos);
        }
      })
    );

    setInterval(() => { 
      if (this.locationId != ''){
        this.quantityPeople$ = this.locationService.getLocationQuantityAll(this.businessId, this.locationId).pipe(
          map((res: any) => {
            if (res != null){
              let i =0;
              res.Data.forEach(item => {
                this.qtyPeople[i] = item.Quantity;
                this.perLocation[i] = (+this.qtyPeople[i] / +item.TotLocation)*100;  
                i = i +1;
              });
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

}
