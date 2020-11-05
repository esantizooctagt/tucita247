import { Component, ViewChild, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppointmentService } from '@app/services';
import { SpinnerService } from '@app/shared/spinner.service';
import { ZXingScannerComponent, ZXingScannerModule } from '@zxing/ngx-scanner';

import { Observable } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';

export interface DialogData {
  guests: number;
  title: string;
  tipo: number;
  businessId: string;
  locationId: string;
  providerId: string;
}

@Component({
  selector: 'app-video-dialog',
  templateUrl: './video-dialog.component.html',
  styleUrls: ['./video-dialog.component.scss']
})
export class VideoDialogComponent implements OnInit {
  @ViewChild('scanner', { static: true }) scanner: ZXingScannerComponent;

  enabledCamera: boolean = true;
  hasCameras = false;
  hasPermission: boolean;
  availableDevices: MediaDeviceInfo[];
  selectedDevice: MediaDeviceInfo;
  currentDevice: MediaDeviceInfo = null;

  appoData$: Observable<any>;
  qrCode: string = '';
  checkInValues: any;
  Guests: number = 1;
  activeBlink: number = 0;

  constructor(
    public dialogRef: MatDialogRef<VideoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private spinnerService: SpinnerService,
    private appointmentService: AppointmentService
  ) {}

  ngOnInit(): void {
    this.Guests = (this.data.guests == 0 ? 1 : this.data.guests);
  }

  displayCameras(event){
    this.hasCameras = true;
    this.currentDevice = event[0];
    this.availableDevices = event;

    // selects the devices's back camera by default
    for (const device of event) {
      if (/back|rear|environment/gi.test(device.label)) {
        this.currentDevice = device;
        break;
      }
    }

    this.scanner.camerasNotFound.subscribe((devices: MediaDeviceInfo[]) => {
      console.error('An error has occurred when trying to enumerate your video-stream-enabled devices.');
    });

    this.scanner.permissionResponse.subscribe((answer: boolean) => {
      this.hasPermission = answer;
    });
  }
  
  handleQrCodeResult(resultString: string) {
    this.qrCode = resultString;
    if (this.data.tipo == 2){
      // var spinnerRef = this.spinnerService.start($localize`:@@host.loadingappos1:`);
      this.appoData$ = this.appointmentService.getAppointmentData(this.data.businessId, this.data.locationId, this.data.providerId, this.qrCode).pipe(
        map((res: any) => {
          if (res.Code == 200) {
            this.Guests = res.Guests;
            // this.spinnerService.stop(spinnerRef);
          }
          return res.Appos;
        }),
        catchError(err => {
          // this.spinnerService.stop(spinnerRef);
          return err.Message;
        })
      );
    }
  }

  onDeviceSelectChange(selectedValue: string) {
    let value = this.availableDevices.filter(val => val.deviceId == selectedValue);

    this.scanner.reset();
    this.currentDevice = <MediaDeviceInfo>value[0];
    this.scanner.restart();
  }

  onOK(): void{
    let checkInValues ={
      qrCode : this.qrCode,
      Guests : +this.Guests
    }
    this.dialogRef.close(checkInValues);
  }

  onNoClick(): void {
    this.enabledCamera = false;
    this.qrCode = '';
    this.dialogRef.close();
  }

  validQr(event){
    if (event.toString().length == 6){

      this.activeBlink = 1;
      let component = this;
      setTimeout(() => {
        component.activeBlink = 0;
        this.activeBlink = 0;
      },3000);

      if (this.data.tipo == 2){
        // var spinnerRef = this.spinnerService.start($localize`:@@host.loadingappos1:`);
        this.appoData$ = this.appointmentService.getAppointmentData(this.data.businessId, this.data.locationId, this.data.providerId, this.qrCode).pipe(
          map((res: any) => {
            if (res.Code == 200) {
              this.Guests = res.Guests;
              // this.spinnerService.stop(spinnerRef);
            }
            return res.Appos;
          }),
          catchError(err => {
            // this.spinnerService.stop(spinnerRef);
            return err.Message;
          })
        );
      }
    } else {
      this.activeBlink = 0;
    }
  }
}
