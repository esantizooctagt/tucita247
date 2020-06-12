import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '@app/core/services';
import { LocationService } from '@app/services';
import { map, catchError, mergeMap } from 'rxjs/operators';
import { SpinnerService } from '@app/shared/spinner.service';
import { AppointmentService } from '@app/services/appointment.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  quantityPeople$: Observable<any>;
  businessId: string = '';
  onError: string = '';
  locationId: string = '';
  doorId: string = '';
  userId: string = '';
  isAdmin: number = 0;
  qtyPeople = [];
  perLocation = [];
  LocationName = [];

  constructor(
    private authService: AuthService,
    private locationService: LocationService,
    private appointmentService: AppointmentService,
    private spinnerService: SpinnerService
  ) { }

  ngOnInit(): void {
    var spinnerRef = this.spinnerService.start("Loading Dashboard...");
    this.businessId = this.authService.businessId();
    this.isAdmin = this.authService.isAdmin();
    this.userId = this.authService.userId();

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
