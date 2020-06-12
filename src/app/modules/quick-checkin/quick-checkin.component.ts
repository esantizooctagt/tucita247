import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LocationService, ReasonsService, BusinessService } from '@app/services';
import { AuthService } from '@app/core/services';
import { SpinnerService } from '@app/shared/spinner.service';
import { map, catchError } from 'rxjs/operators';
import { AppointmentService } from '@app/services/appointment.service';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from '@app/shared/dialog/dialog.component';
import { VideoDialogComponent } from '@app/shared/video-dialog/video-dialog.component';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { DirDialogComponent } from '@app/shared/dir-dialog/dir-dialog.component';

@Component({
  selector: 'app-quick-checkin',
  templateUrl: './quick-checkin.component.html',
  styleUrls: ['./quick-checkin.component.scss']
})
export class QuickCheckinComponent implements OnInit {
  qrCode: string = '';
  businessId: string  = '';
  locationId: string = '';
  onError: string = '';

  check$: Observable<any>;

  constructor(
    private spinnerService: SpinnerService,
    private _snackBar: MatSnackBar,
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private businessService: BusinessService,
    private locationService: LocationService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private router: Router
  ) { }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
    });
  }

  ngOnInit(): void {
    this.businessId = this.authService.businessId();
  }

  checkOutQR(){
    const dialogRef = this.dialog.open(VideoDialogComponent, {
      width: '450px',
      height: '595px',
      data: {guests: 0, title: 'Check-Out', tipo: 2}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result != undefined) {
        this.qrCode = result;
        this.checkOutAppointment(this.qrCode);
      }
    });
  }

  checkOutAppointment(qrCode: string){
    let formData = {
      Status: 4,
      qrCode: qrCode,
      BusinessId: this.businessId,
      LocationId: this.locationId
    }
    this.check$ = this.appointmentService.updateAppointmentCheckOut(formData).pipe(
      map((res: any) => {
        if (res.Code == 200){
          this.openSnackBar("La Cita check-out successfull","Check-Out");
        }
      }),
      catchError(err => {
        if (err.Status == 404){
          this.openSnackBar("Invalid qr code","Check-out");
          return err.Message;
        }
        this.onError = err.Message;
        this.openSnackBar("Something goes wrong try again","Check-out");
        return this.onError;
      })
    );
  }

  onCheckInApp(){
    //READ QR CODE AND CHECK-IN PROCESS
    const dialogRef = this.dialog.open(VideoDialogComponent, {
      width: '450px',
      height: '675px',
      data: {guests: 0, title: 'Check-In', tipo: 3 }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result != undefined) {
        this.qrCode = result.qrCode;
        let guestsAppo = result.Guests;
        if (this.qrCode != '' && guestsAppo > 0){
          this.checkInAppointment(this.qrCode, guestsAppo);
        }
      }
    });
  }

  checkInAppointment(qrCode: string, guests: number){
    let formData = {
      Status: 3,
      qrCode: qrCode,
      Guests: guests,
      BusinessId: this.businessId,
      LocationId: this.locationId
    }
    this.check$ = this.appointmentService.updateAppointmentCheckIn(qrCode, formData).pipe(
      map((res: any) => {
        if (res.Code == 200){
          this.openSnackBar("La Cita check-in successfull","Check-In");
        }
      }),
      catchError(err => {
        if (err.Status == 404){
          this.openSnackBar("Invalid qr code","Check-in");
          return err.Message;
        }
        this.onError = err.Message;
        this.openSnackBar("Something goes wrong try again","Check-in");
        return this.onError;
      })
    );
  }
}
