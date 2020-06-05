import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import jsQR, { QRCode } from 'jsqr';

@Component({
  selector: 'app-video-dialog',
  templateUrl: './video-dialog.component.html',
  styleUrls: ['./video-dialog.component.scss']
})
export class VideoDialogComponent implements OnInit {
  @ViewChild('video', {static: true}) videoElm: ElementRef;
  @ViewChild('canvas', {static: true}) canvasElm: ElementRef;

  qrCode: string = '';
  checkInValues: any;
  companions: number = 0;
  videoStart = false;
  medias: MediaStreamConstraints = {
    audio: false,
    video: false,
  };

  constructor(
    public dialogRef: MatDialogRef<VideoDialogComponent>
  ) { }

  ngOnInit(): void {
    this.startVideo();
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
      } else {
          setTimeout(() => { this.checkImage(); }, 100)
      }
    }
  }

  onOK(): void{
    let checkInValues ={
      qrCode : this.qrCode,
      Companions : this.companions
    }
    this.dialogRef.close(checkInValues);
  }

  onNoClick(): void {
    if (this.videoStart) { this.stopVideo(); }
    this.qrCode = '';
    this.dialogRef.close();
  }
}
