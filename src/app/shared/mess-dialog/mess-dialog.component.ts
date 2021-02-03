import { Component, Inject, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AppointmentService } from '@app/services';
import { AuthService } from '@app/core/services';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
  timeZone: string;
  appo: any;
}

@Component({
  selector: 'app-mess-dialog',
  templateUrl: './mess-dialog.component.html',
  styleUrls: ['./mess-dialog.component.scss']
})
export class MessDialogComponent implements OnInit {
  getComments: any[] =[];
  TimeZone: string = '';
  messages$: Observable<any>;
  comments$: Observable<any>;
  onError: string = '';

  appo: any;
  appId: string = '';

  constructor(
    private _snackBar: MatSnackBar,
    private authService: AuthService,
    private appointmentService: AppointmentService,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) { }

  ngOnInit(): void {
    this.appo = this.data.appo;
    this.TimeZone = this.data.timeZone;
    this.appId = this.data.appo.AppId;
    console.log(this.appo);
    this.onShowMessage();
  }
  
  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
    });
  }

  onMessageApp(item: any){
    let options = {
      timeZone: this.TimeZone,
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    },
    formatter = new Intl.DateTimeFormat([], options);
    var actual = formatter.format(new Date());
    let value = item.value;
    item.value = '';
    this.getComments.reverse();
    this.getComments.push({'H': value, 'T': actual});
    this.getComments.reverse();

    const itemToScrollTo = document.getElementById('chat');
    // null check to ensure that the element actually exists
    if (itemToScrollTo) {
      itemToScrollTo.scrollIntoView(true);
    }
    
    //GET MESSAGES APPOINTMENT
    let formData = {
      Message: value,
      BusinessName: this.authService.businessName()
    }
    this.messages$ = this.appointmentService.putMessage(this.appId, '1', formData).pipe(
      map((res:any) => {
        if (res != null){
          if (res.Code == 200){
            this.openSnackBar($localize`:@@host.messagessend:`,$localize`:@@host.messages:`);
          } else {
            this.openSnackBar($localize`:@@shared.wrong:`,$localize`:@@host.messages:`);
          }
        } else {
          this.openSnackBar($localize`:@@shared.wrong:`,$localize`:@@host.messages:`);
        }
      }),
      catchError(err => {
        this.openSnackBar($localize`:@@shared.wrong:`,$localize`:@@host.messages:`);
        this.onError = err.Message;
        return this.onError;
      })
    );
  }

  onShowMessage(){
    if (this.appo.Unread == 'H') {
      this.appo.Unread = '0';
    }
    // console.log(appo.OpenMess);
    // this.appo.OpenMess = (appo.OpenMess == 0 || appo.OpenMess == undefined ? 1 : 0);
    this.comments$ = this.appointmentService.getMessages(this.appo.AppId, 'H').pipe(
      map((res: any) => {
        if (res != null){
          if (res.Code == 200){
            this.getComments = res.Messages.reverse();
          } else {
            this.openSnackBar($localize`:@@shared.wrong:`,$localize`:@@host.messages:`);
          }
        }
      }),
      catchError(err => {
        this.onError = err.Message;
        return this.onError;
      })
    );
  }
}
