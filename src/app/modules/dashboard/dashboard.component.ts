import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '@app/core/services';
import { LocationService } from '@app/services';
import { map, catchError } from 'rxjs/operators';
import { SpinnerService } from '@app/shared/spinner.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  quantityPeople$: Observable<any>;
  businessId: string = '';
  onError: string = '';
  qtyPeople = [];
  perLocation = [];
  LocationName = [];

  constructor(
    private authService: AuthService,
    private locationService: LocationService,
    private spinnerService: SpinnerService
  ) { }

  ngOnInit(): void {
    var spinnerRef = this.spinnerService.start("Loading Dashboard...");
    this.businessId = this.authService.businessId();
    this.quantityPeople$ = this.locationService.getLocationQuantityAll(this.businessId).pipe(
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

    setInterval(() => { 
        this.quantityPeople$ = this.locationService.getLocationQuantityAll(this.businessId).pipe(
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
    }, 30000);
  }

}
