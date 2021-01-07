import { Component, OnInit } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { AdminService, BusinessService } from '@app/services';
import { catchError, map, startWith } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { SpinnerService } from '@app/shared/spinner.service';

@Component({
  selector: 'app-cancel',
  templateUrl: './cancel.component.html',
  styleUrls: ['./cancel.component.scss']
})
export class CancelComponent implements OnInit {
  business$: Observable<any>;
  soft$: Observable<any>;
  hard$: Observable<any>;
  filteredBusiness$: Observable<any[]>;
  allBusiness: []=[];
  frmBusiness = new FormControl();
  busId: string = '';
  statBusiness: string = '';

  constructor(
    private businessService: BusinessService,
    private adminService: AdminService,
    private spinnerService: SpinnerService,
  ) { }

  ngOnInit(): void {
    this.filteredBusiness$ = this.frmBusiness.valueChanges
      .pipe(
        startWith(null),
        map((business: any | null) => business ? this._filterBusiness(business) : this.allBusiness.slice())
      );

    this.business$ = this.businessService.getBusinessAdmin().pipe(
      map((res: any) => {
        this.allBusiness = res.Business;
        }
      ),
      catchError(err => {
        return throwError(err || err.message);
      })
    );
  }

  private _filterBusiness(value: any): any[] {
    const filterValue = value.toString().toLowerCase();
    return (filterValue != undefined ? this.allBusiness.filter((business: any) => business.Name.toLowerCase().indexOf(filterValue) === 0) : this.allBusiness);
  }

  suspend(type: string){
    if (this.busId == '') {return;}
    var spinnerRef = this.spinnerService.start($localize`:@@dashboard.processing:`);
    this.soft$ = this.adminService.putSuspend(this.busId, '0', type).pipe(
      map((res: any) => {
        if (res.Code == 200){
          this.spinnerService.stop(spinnerRef);
        }
        return res;
      })
    );
  }

  selectedBusiness(event: MatAutocompleteSelectedEvent): void{
    this.busId = event.option.value.BusinessId;
    this.statBusiness = (event.option.value.Status == 1 ? 'ACTIVE' : (event.option.value.Status == 0 ? 'SOFT SUSPEND' : 'HARD SUSPEND'));
  }

  displayFn(business?: any): string | undefined {
    return business ? business.Name : undefined;
  }

}
