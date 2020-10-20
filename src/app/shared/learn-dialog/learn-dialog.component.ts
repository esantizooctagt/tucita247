import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

export interface DialogData {
  message: string;
}

@Component({
  selector: 'app-learn-dialog',
  templateUrl: './learn-dialog.component.html',
  styleUrls: ['./learn-dialog.component.scss']
})
export class LearnDialogComponent implements OnInit {
  base: DialogData;
  message = '';
  
  constructor(
    private domSanitizer: DomSanitizer, 
    private dialogRef: MatDialogRef<LearnDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private matIconRegistry: MatIconRegistry
  ) {
    this.matIconRegistry.addSvgIcon('light',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/light.svg'));
   }

  ngOnInit(): void {
    this.message = this.data.message;
  }

}
