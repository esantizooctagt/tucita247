import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

export interface DialogData {
  businessName: string;
  citaLink: string;
}

@Component({
  selector: 'app-sticker-dialog',
  templateUrl: './sticker-dialog.component.html',
  styleUrls: ['./sticker-dialog.component.scss']
})
export class StickerDialogComponent implements OnInit {
  base: DialogData;
  business: string = '';
  link: string = '';
  elementType : 'url' | 'canvas' | 'img' = 'url';

  constructor(
    private domSanitizer: DomSanitizer,
    private dialogRef: MatDialogRef<StickerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private matIconRegistry: MatIconRegistry
  ) {
    this.matIconRegistry.addSvgIcon('qrCode',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/qr-code.svg'));
   }

  ngOnInit(): void {
    this.business = this.data.businessName;
    this.link = this.data.citaLink;
  }

  doPrint() {
    window.print();
  }
}
