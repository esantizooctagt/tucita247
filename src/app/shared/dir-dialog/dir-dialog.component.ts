import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { AppointmentService } from '@app/services/appointment.service';
import { Observable } from 'rxjs';
import { SpinnerService } from '../spinner.service';
import { map, catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface DialogInfo {
  walkIns: [];
  businessId: string;
  locationId: string;
}

@Component({
  selector: 'app-dir-dialog',
  templateUrl: './dir-dialog.component.html',
  styleUrls: ['./dir-dialog.component.scss']
})
export class DirDialogComponent implements OnInit {
  base: DialogInfo;
  dirWalkIns = [];
  businessId: string ='';
  locationId: string ='';
  filterData=[];
  letter_arr = [
    { text: 'ALL', disabled: false },
    { text: 'A', disabled: true },
    { text: 'B', disabled: true },
    { text: 'C', disabled: true },
    { text: 'D', disabled: true },
    { text: 'E', disabled: true },
    { text: 'F', disabled: true },
    { text: 'G', disabled: true },
    { text: 'H', disabled: true },
    { text: 'I', disabled: true },
    { text: 'J', disabled: true },
    { text: 'K', disabled: true },
    { text: 'L', disabled: true },
    { text: 'M', disabled: true },
    { text: 'N', disabled: true },
    { text: 'O', disabled: true },
    { text: 'P', disabled: true },
    { text: 'Q', disabled: true },
    { text: 'R', disabled: true },
    { text: 'S', disabled: true },
    { text: 'T', disabled: true },
    { text: 'U', disabled: true },
    { text: 'V', disabled: true },
    { text: 'W', disabled: true },
    { text: 'X', disabled: true },
    { text: 'Y', disabled: true },
    { text: 'Z', disabled: true },
  ];

  getLocInfo$: Observable<any>;
  
  constructor(
    private appointmentService: AppointmentService,
    private _snackBar: MatSnackBar,
    private spinnerService: SpinnerService,
    private dialogRef: MatDialogRef<DirDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogInfo
  ) { }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
    });
  }

  ngOnInit(): void {
    this.filterData=[];
    this.dirWalkIns = this.data.walkIns;
    this.businessId = this.data.businessId;
    this.locationId = this.data.locationId;
    this.dirWalkIns.sort((a, b) => (a.Name < b.Name ? -1 : 1));
    this.dirWalkIns.map(a => this.letter_arr.filter(b => b.text.toLowerCase() == a.Name[0].toLowerCase()).map(b => b.disabled = false));
    this.filterData = this.dirWalkIns;
  }

  close() {
    this.dialogRef.close();
  }

  filterLetter(event: MatTabChangeEvent) {
    let letter = event.tab.textLabel
    this.filterData=[];
    if (letter != 'ALL') {
      this.filterData = this.dirWalkIns.filter( function (x) { return x.Name[0].toLowerCase() == letter.toLowerCase() });
    }
    else {
      this.filterData = this.dirWalkIns;
    }
  }

  checkOutWalkIn(){
    let appId=[];
    this.dirWalkIns.forEach(x =>{
      if (x.CheckOut == 1 || x.ChecOut == true){
        appId.push({AppointmentId: x.AppointmentId, Qty: x.NoPeople, DateAppo: x.DateAppo});
      }
    });
    if (appId.length > 0){
      let formData = {
        BusinessId: this.businessId,
        LocationId: this.locationId,
        Appos: appId
      }
      var spinnerRef = this.spinnerService.start("Check Out Walk-Ins...");
      this.getLocInfo$ = this.appointmentService.updateAppointmentWalkInsCheckOut(formData).pipe(
        map((res: any) => {
          if (res != null){
            if (res.Code == 200){
              this.openSnackBar("Check out successfull","Check-Out");
              this.spinnerService.stop(spinnerRef);
            } else {
              this.openSnackBar("Something goes wrong, try again","Check-Out");
              this.spinnerService.stop(spinnerRef);
            }
          } else {
            this.openSnackBar("Something goes wrong, try again","Check-Out");
            this.spinnerService.stop(spinnerRef);
          }
          this.dialogRef.close();
        }),
        catchError(err => {
          this.openSnackBar("Something goes wrong on process, try again","Check-Out");
          this.spinnerService.stop(spinnerRef);
          return err.message;
        })
      );
    } else {
      this.dialogRef.close();
    }
  }
}
