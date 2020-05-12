import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

export interface DialogData {
  header: string;
  message: string;
  success: boolean;
  error: boolean;
  warn: boolean;
  ask: boolean;
}

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit {
  base: DialogData;
  header: string;
  message: string;
  success: boolean;
  error: boolean;
  warn: boolean;
  ask: boolean;
  accepted: boolean = true;

  constructor(
    private domSanitizer: DomSanitizer, 
    private dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private matIconRegistry: MatIconRegistry
  ) { 
    this.matIconRegistry.addSvgIcon('check',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/check.svg'));
    this.matIconRegistry.addSvgIcon('error',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/error.svg'));
    this.matIconRegistry.addSvgIcon('warning',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/warning.svg'));
  }

  ngOnInit() {
    this.header = this.data.header;
    this.message = this.data.message;
    this.success = this.data.success;
    this.warn = this.data.warn;
    this.error = this.data.error;
    if (this.data.ask != undefined){
      this.ask = this.data.ask; 
    }
  }

  close() {
    this.accepted = false;
    this.dialogRef.close();
  }

}
