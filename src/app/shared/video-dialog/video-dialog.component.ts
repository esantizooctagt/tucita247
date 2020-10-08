import { Component, ViewChild, ElementRef, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppointmentService } from '@app/services';
import { SpinnerService } from '@app/shared/spinner.service';

import jsQR, { QRCode } from 'jsqr';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

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
  @ViewChild('video', {static: true}) videoElm: ElementRef;
  @ViewChild('canvas', {static: true}) canvasElm: ElementRef;

  appoData$: Observable<any>;
  qrCode: string = '';
  checkInValues: any;
  videoStart = false;
  Guests: number = 0;
  a=new AudioContext();

  medias: MediaStreamConstraints = {
    audio: false,
    video: false,
  };

  constructor(
    public dialogRef: MatDialogRef<VideoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private spinnerService: SpinnerService,
    private appointmentService: AppointmentService
  ) { }

  ngOnInit(): void {
    this.startVideo();
    this.Guests = this.data.guests;
  }
  
  toggleVideoMedia() {
    if (this.videoStart) {
      this.stopVideo();
    } else {
      this.startVideo()
    }
  }

  startVideo() {
    this.medias.video = true;
    navigator.mediaDevices.getUserMedia(this.medias).then(
      (localStream: MediaStream) => {
        this.videoElm.nativeElement.srcObject = localStream;
        this.videoStart = true;
        this.checkImage();
      }
    ).catch(
      error => {
        console.error(error);
        this.videoStart = false;
      }
    );
  }

  stopVideo() {
    this.medias.video = false;
    this.videoElm.nativeElement.srcObject.getVideoTracks()[0].enabled = false;
    this.videoElm.nativeElement.srcObject.getVideoTracks()[0].stop();
    this.videoStart = false;
  }

  checkImage() {
    const WIDTH = this.videoElm.nativeElement.clientWidth;
    const HEIGHT = this.videoElm.nativeElement.clientHeight;
    this.canvasElm.nativeElement.width  = WIDTH;
    this.canvasElm.nativeElement.height = HEIGHT;
    if (WIDTH > 0) {
      const ctx = this.canvasElm.nativeElement.getContext('2d') as CanvasRenderingContext2D;

      ctx.drawImage(this.videoElm.nativeElement, 0, 0, WIDTH, HEIGHT)
      const imageData = ctx.getImageData(0, 0, WIDTH, HEIGHT)
      const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert" })

      if (code) {
          this.qrCode = code.data;
          this.beep(100, 520, 200);
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
          setTimeout(() => { this.checkImage(); }, 100)
      }
    }
  }

  onOK(): void{
    let checkInValues ={
      qrCode : this.qrCode,
      Guests : (this.data.guests.toString() == '' ? 0 : +this.data.guests)
    }
    this.dialogRef.close(checkInValues);
  }

  onNoClick(): void {
    if (this.videoStart) { this.stopVideo(); }
    this.qrCode = '';
    this.dialogRef.close();
  }

  validQr(event){
    if (event.toString().length == 6){
      this.beep(100, 520, 200);
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
  }

  beep(vol, freq, duration){
    let v=this.a.createOscillator();
    let u=this.a.createGain();
    v.connect(u)
    v.frequency.value=freq
    v.type="square"
    u.connect(this.a.destination)
    u.gain.value=vol*0.01
    v.start(this.a.currentTime)
    v.stop(this.a.currentTime+duration*0.001)
  }
}
