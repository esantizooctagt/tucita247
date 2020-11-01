import { Component, OnInit, Inject, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { Reason } from '@app/_models';
import { BusinessService, ReasonsService, AppointmentService } from '@app/services';
import { AuthService } from '@app/core/services';
import { catchError, map } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SpinnerService } from '../spinner.service';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

export interface DialogData {
  businessId: string;
  locationId: string;
  providerId: string;
  appoTime: string;
  appoDate: string;
  service: string;
}

@Component({
  selector: 'app-showappo-dialog',
  templateUrl: './showappo-dialog.component.html',
  styleUrls: ['./showappo-dialog.component.scss']
})
export class ShowappoDialogComponent implements OnInit {
  comments$: Observable<any>;
  opeHours$: Observable<any>;
  getLocInfo$: Observable<any>;
  reasons$: Observable<any>;
  messages$: Observable<any>;
  updAppointment$: Observable<any>;
  appointmentsSche$: Observable<any[]>;

  onSyncMessages = new EventEmitter();

  showMessageSche=[];
  showDetailsSche=[];
  showCancelOptionsSche=[];
  getCommentsSche=[];
  selectedSche=[];

  reasons: Reason[]=[];
  schedule = [];

  locationId: string = '';
  businessId: string = '';
  providerId: string = '';
  userId: string = '';
  onError: string = '';
  newTime: string = '';

  cancelAppo: number = 0;
  
  constructor(
    public dialogRef: MatDialogRef<ShowappoDialogComponent>,
    private spinnerService: SpinnerService,
    private appointmentService: AppointmentService,
    private businessService: BusinessService,
    private reasonService: ReasonsService,
    private _snackBar: MatSnackBar,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) { 
    this.matIconRegistry.addSvgIcon('cancel',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/cancel.svg'));
    this.matIconRegistry.addSvgIcon('clock',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/clock.svg'));
    this.matIconRegistry.addSvgIcon('expand',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/expand.svg'));
    this.matIconRegistry.addSvgIcon('handicap',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/handicap.svg'));
    this.matIconRegistry.addSvgIcon('older',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/older.svg'));
    this.matIconRegistry.addSvgIcon('pregnant',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/pregnant.svg'));
    this.matIconRegistry.addSvgIcon('readycheck',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/readycheck.svg'));
    this.matIconRegistry.addSvgIcon('sms',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/sms.svg'));
    this.matIconRegistry.addSvgIcon('mas',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/mas.svg'));
    this.matIconRegistry.addSvgIcon('menos',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/menos.svg'));
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
    });
  }

  ngOnInit(): void {
    this.userId = this.authService.userId();
    this.businessId = this.data.businessId;
    this.locationId = this.data.locationId;
    this.providerId = this.data.providerId;

    this.newTime = +this.data.appoTime.substring(0,2) > 12 ? (+this.data.appoTime.substring(0,2)-12).toString() + ':00 PM' : this.data.appoTime + ' AM';
    this.reasons$ = this.reasonService.getReasons(this.businessId).pipe(
      map((res: any) => {
        if (res != null ){
          if (res.Code == 200){
            this.reasons = res.Reasons.split(',');
            return res.Reasons;
          }
        }
      }),
      catchError(err => {
        this.onError = err.Message;
        return '0';
      })
    );
    this.getAppointmentsSche();
  }

  getAppointmentsSche(){
    let hourIni = this.data.appoTime.replace(':','-');
    let dateAppoStr = this.data.appoDate + '-' + hourIni;
    var spinnerRef = this.spinnerService.start($localize`:@@host.loadingappos1:`);
    this.schedule = [];
    this.appointmentsSche$ = this.appointmentService.getAppointmentsSche(this.businessId, this.locationId, this.providerId, dateAppoStr).pipe(
      map((res: any) => {
        if (res != null) {
          res['Appos'].forEach(item => {
            let hora = item['DateAppo'].substring(11,16).replace('-',':');
            hora = (+hora.substring(0,2) > 12 ? (+hora.substring(0,2)-12).toString().padStart(2,'0') : hora.substring(0,2)) + ':' + hora.substring(3).toString() + (+hora.substring(0,2) > 12 ? ' PM' : ' AM');
            let data = {
              AppId: item['AppointmentId'],
              ClientId: item['ClientId'],
              Name: item['Name'].toLowerCase(),
              OnBehalf: item['OnBehalf'],
              Guests: item['Guests'],
              Door: item['Door'],
              Disability: item['Disability'],
              Phone: item['Phone'],
              DateFull: item['DateAppo'],
              Type: item['Type'],
              DateAppo: hora,
              Unread: item['Unread']
            }
            this.schedule.push(data);
          });
          this.spinnerService.stop(spinnerRef);
        }
        return res.Appos;
      }),
      catchError(err => {
        this.onError = err.Message;
        this.schedule = [];
        this.spinnerService.stop(spinnerRef);
        return this.onError;
      })
    );
  }

  onCancelApp(appo: any, reasonId: string, index: number){
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    var currdate = yyyy+'-'+mm+'-'+dd;
    //CANCELAR APPOINTMENT
    if (reasonId == undefined){
      this.openSnackBar($localize`:@@host.selectreason:`,$localize`:@@host.cancelappodyn:`);
    }
    let formData = {
      Status: 5,
      DateAppo: appo.DateFull,
      Reason: reasonId,
      Guests: appo.Guests,
      BusinessName: this.authService.businessName(),
      Language: this.authService.businessLanguage()
    }
    this.updAppointment$ = this.appointmentService.updateAppointment(appo.AppId, formData).pipe(
      map((res: any) => {
        if (res.Code == 200){
          this.cancelAppo = 1;
          var data = this.schedule.findIndex(e => e.AppId === appo.AppId);
          this.schedule.splice(data, 1);
          this.showCancelOptionsSche[index] = false;
          this.selectedSche[index] = undefined; 
          this.openSnackBar($localize`:@@host.cancelsuccess:`,$localize`:@@appos.cancel:`);
        }
      }),
      catchError(err => {
        this.onError = err.Message;
        this.openSnackBar($localize`:@@shared.wrong:`,$localize`:@@shared.error:`);
        return this.onError;
      })
    );
  }
  
  close(){
    let values = {
      cancelAppo: this.cancelAppo
    }
    this.dialogRef.close(values);
  }

  onShowMessage(appo: any, i: number, type: string){
    if (appo.Unread == 'H') {
      appo.Unread = '0';
    }
    this.comments$ = this.appointmentService.getMessages(appo.AppId, 'H').pipe(
      map((res: any) => {
        if (res != null){
          if (res.Code == 200){
            if (type == 'schedule'){
              this.getCommentsSche[i] = res.Messages;
            }
          } else {
            this.openSnackBar($localize`:@@shared.wrong:`,$localize`:@@shared.error:`);
          }
        }
      }),
      catchError(err => {
        this.onError = err.Message;
        return this.onError;
      })
    );
  }

  onMessageApp(appointmentId: string, value: string, i: number, qeue: string){
    //GET MESSAGES APPOINTMENT
    let formData = {
      Message: value,
      BusinessName: this.authService.businessName()
    }
    this.messages$ = this.appointmentService.putMessage(appointmentId, '1', formData).pipe(
      map((res:any) => {
        if (res != null){
          if (res.Code == 200){
            if (qeue == 'schedule'){
              this.showMessageSche[i] = false;
            }
            this.openSnackBar($localize`:@@host.messagessend:`,$localize`:@@host.messages:`);
          } else {
            this.openSnackBar($localize`:@@shared.wrong:`,$localize`:@@shared.error:`);
          }
        } else {
          this.openSnackBar($localize`:@@shared.wrong:`,$localize`:@@shared.error:`);
        }
      }),
      catchError(err => {
        this.openSnackBar($localize`:@@shared.wrong:`,$localize`:@@shared.error:`);
        this.onError = err.Message;
        return this.onError;
      })
    );
  }

}
