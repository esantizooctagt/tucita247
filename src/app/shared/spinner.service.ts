import { Injectable } from '@angular/core';
import { Router } from '@angular/router';  
import { MatDialog, MatDialogRef } from '@angular/material/dialog';  
import { SpinnerComponent } from '@shared/spinner/spinner.component';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {

  constructor(
    private router: Router, 
    private dialog: MatDialog
  ) { }

  start(message?): MatDialogRef<SpinnerComponent> {  
    const dialogRef = this.dialog.open(SpinnerComponent,{  
        disableClose: true ,  
        data: message == ''|| message == undefined ? "Loading..." : message  
    });  
    return dialogRef;  
  };  

  stop(ref:MatDialogRef<SpinnerComponent>){  
      ref.close();  
  } 
}
