import { Component, OnInit } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { AdminService, BusinessService } from '@app/services';
import { catchError, map, startWith } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { SpinnerService } from '@app/shared/spinner.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from '@app/shared/dialog/dialog.component';

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
    private dialog: MatDialog,
    private businessService: BusinessService,
    private adminService: AdminService,
    private spinnerService: SpinnerService,
  ) { }

  openDialog(header: string, message: string, success: boolean, error: boolean, warn: boolean): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      header: header, 
      message: message, 
      success: success, 
      error: error, 
      warn: warn
    };
    dialogConfig.width ='280px';
    dialogConfig.minWidth = '280px';
    dialogConfig.maxWidth = '280px';
    this.dialog.open(DialogComponent, dialogConfig);
  }

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
          if (type == '1') {
            this.openDialog('Cancel', 'Soft suspend', false, true, false);
          } 
          if(type == '2'){
            this.openDialog('Cancel', 'Hard suspend', false, true, false);
          }
          if(type == '3'){
            this.openDialog('Active', 'Active', false, true, false);
          }
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
