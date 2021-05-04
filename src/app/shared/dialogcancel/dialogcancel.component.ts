import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SpinnerService } from '@app/shared/spinner.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppointmentService } from '@app/services';

export interface DialogData {
  header: string;
  message: string;
  success: boolean;
  error: boolean;
  warn: boolean;
  ask: boolean;
  businessId: string;
  locationId: string;
  providerId: string;
  dateAppo: string;
  lan: string;
}

@Component({
  selector: 'app-dialogcancel',
  templateUrl: './dialogcancel.component.html',
  styleUrls: ['./dialogcancel.component.scss']
})
export class DialogcancelComponent implements OnInit {
  base: DialogData;
  header: string;
  message: string;
  success: boolean;
  error: boolean;
  warn: boolean;
  ask: boolean;
  accepted: boolean = true;

  businessId: string = '';
  locationId: string = '';
  providerId: string = '';
  dateAppo: string = '';
  lan: string = '';

  cancelAppos$: Observable<any>;

  constructor(
    private domSanitizer: DomSanitizer, 
    private dialogRef: MatDialogRef<DialogcancelComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private spinnerService: SpinnerService,
    private matIconRegistry: MatIconRegistry,
    private _snackBar: MatSnackBar,
    private appointmentService: AppointmentService
  ) {
    this.matIconRegistry.addSvgIcon('check',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/check.svg'));
    this.matIconRegistry.addSvgIcon('error',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/error.svg'));
    this.matIconRegistry.addSvgIcon('warning',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/warning.svg'));
   }

  ngOnInit(): void {
    this.header = this.data.header;
    this.message = this.data.message;
    this.success = this.data.success;
    this.warn = this.data.warn;
    this.error = this.data.error;

    this.businessId = this.data.businessId;
    this.locationId = this.data.locationId,
    this.providerId = this.data.providerId;
    this.dateAppo = this.data.dateAppo;
    this.lan = this.data.lan;

    if (this.data.ask != undefined){
      this.ask = this.data.ask; 
    }
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
    });
  }

  close() {
    this.accepted = false;
    this.dialogRef.close();
  }
  
  cancelAppos(){
    var spinnerRef = this.spinnerService.start($localize`:@@sche.deletingcitas:`);
    this.cancelAppos$ =  this.appointmentService.putCancelAppos(this.businessId, this.locationId, this.providerId, this.dateAppo, this.lan).pipe(
      map((res: any) => {
        if (res != null) {
          if (res.Code == 200){
            this.openSnackBar($localize`:@@sche.deletedssuccess:`, $localize`:@@sche.citastext:`);
          }
          this.spinnerService.stop(spinnerRef);
          this.close();
        }
      })
    );
  }

}
