import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { Observable, Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LocationService, ReasonsService } from '@app/services';
import { AuthService } from '@app/core/services';
import { SpinnerService } from '@app/shared/spinner.service';
import { map, catchError } from 'rxjs/operators';
import { AppointmentService } from '@app/services/appointment.service';
import { Appointment, Reason } from '@app/_models';
import { FormBuilder, Validators } from '@angular/forms';
import { ConfirmValidParentMatcher } from '@app/validators';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from '@app/shared/dialog/dialog.component';
import { VideoDialogComponent } from '@app/shared/video-dialog/video-dialog.component';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-host',
  templateUrl: './host.component.html',
  styleUrls: ['./host.component.scss']
})
export class HostComponent implements OnInit {
  locations$: Observable<Location[]>;
  appointments$: Observable<Appointment[]>;
  messages$: Observable<any>;
  newAppointment$: Observable<any>;
  updAppointment$: Observable<any>;
  getMessages$: Observable<any[]>;
  checkIn$: Observable<any>;
  HostLocations: Subscription;
  commentsSubs: Subscription;
  reasonsSub: Subscription;

  showMessageSche=[];
  showMessageWalk=[];
  showMessagePre=[];

  getCommentsSche=[];
  getCommentsWalk=[];
  getCommentsPre=[];

  showDetailsSche=[];
  showDetailsWalk=[];
  showDetailsPre=[];
  showCancelOptions=[];
  
  selected=[];

  reasons: Reason[]=[];

  doors: string[]=[];
  businessId: string = '';
  userId: string = '';
  showDoorInfo: boolean = false;
  showApp: boolean = false;

  locationId: string = '';
  doorId: string = '';
  qrCode: string = '';

  onError: string = '';

  get f(){
    return this.clientForm.controls;
  }

  confirmValidParentMatcher = new ConfirmValidParentMatcher();

  constructor(
    private domSanitizer: DomSanitizer,
    private spinnerService: SpinnerService,
    private _snackBar: MatSnackBar,
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private reasonService: ReasonsService,
    private locationService: LocationService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private matIconRegistry: MatIconRegistry
  ) {
    this.matIconRegistry.addSvgIcon('cancel',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/cancel.svg'));
    this.matIconRegistry.addSvgIcon('clock',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/clock.svg'));
    this.matIconRegistry.addSvgIcon('expand',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/expand.svg'));
    this.matIconRegistry.addSvgIcon('handicap',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/handicap.svg'));
    this.matIconRegistry.addSvgIcon('older',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/older.svg'));
    this.matIconRegistry.addSvgIcon('pregnant',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/pregnant.svg'));
    this.matIconRegistry.addSvgIcon('readycheck',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/readycheck.svg'));
    this.matIconRegistry.addSvgIcon('sms',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/sms.svg'));
  }

  clientForm = this.fb.group({
    Phone: ['',[Validators.maxLength(14)]],
    Name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    Email: ['', [Validators.maxLength(200), Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]],
    DOB: [''],
    Gender: [''],
    Preference: [''],
    Disability: [''],
    Companions: ['']
  })

  schedule = [
    {
      AppId: "12345",
      ClientId: "55555",
      Name: "ERICK SANTIZO",
      Phone: "9009009282",
      OnBehalf: 0,
      Companions: 1,
      DateAppo: "09:00",
      Door: "LEVEL 1",
      Disability: "",
      DateFull: "2020-05-25-09-00",
      Unread: "0"
    },
    {
      AppId: "67890",
      ClientId: "55555",
      Name: "LUIS PEREZ",
      Phone: "1239009282",
      OnBehalf: 0,
      Companions: 1,
      DateAppo: "09:00",
      Door: "LEVEL 1",
      Disability: "",
      DateFull: "2020-05-25-09-00",
      Unread: "0"
    },
    {
      AppId: "67895",
      ClientId: "55555",
      Name: "J. SMITH",
      Phone: "9899109282",
      OnBehalf: 0,
      Companions: 1,
      DateAppo: "09:00",
      Door: "LEVEL 1",
      Disability: "",
      DateFull: "2020-05-25-09-00",
      Unread: "0"
    },
    {
      AppId: "69998",
      ClientId: "55555",
      Name: "LUISA MARTINEZ",
      Phone: "2333339132",
      OnBehalf: 0,
      Companions: 1,
      DateAppo: "09:00",
      Door: "LEVEL 1",
      Disability: "",
      DateFull: "2020-05-25-09-00",
      Unread: "0"
    },
    {
      AppId: "69890",
      ClientId: "55555",
      Name: "L. FERGUSON",
      Phone: "1233449282",
      OnBehalf: 0,
      Companions: 1,
      DateAppo: "10:00",
      Door: "LEVEL 1",
      Disability: "",
      DateFull: "2020-05-25-10-00",
      Unread: "0"
    },
    {
      AppId: "69095",
      ClientId: "55555",
      Name: "AUSTIN SMITH",
      Phone: "4549109282",
      OnBehalf: 0,
      Companions: 1,
      DateAppo: "10:00",
      Door: "LEVEL 1",
      Disability: "",
      DateFull: "2020-05-25-10-00",
      Unread: "0"
    },
  ];
  walkIns = [
    {
      AppId: "45456",
      ClientId: "55555",
      Name: "VALERIE SANTIZO",
      Phone: "1239009282",
      OnBehalf: 0,
      Companions: 1,
      DateAppo: "10:00",
      Door: "LEVEL 1",
      Disability: "",
      DateFull: "2020-05-25-10-00",
      Unread: "0"
    }
  ]
  preCheckIn =[]
  // {
  //   AppId: "34256",
  //   ClientId: "55555",
  //   Name: "MELANIE SANTIZO",
  //   Phone: "4569009282",
  //   OnBehalf: 0,
  //   Companions: 1,
  //   DateAppo: "10:00",
  //   Door: "LEVEL 1",
  //   Disability: "",
  //   DateFull: "2020-05-25-10-00",
  //   Unread: "0"
  // }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
    });
  }

  openDialog(header: string, message: string, success: boolean, error: boolean, warn: boolean): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      header: header, 
      message: message, 
      success: success, 
      error: error, 
      warn: warn
    };
    dialogConfig.width ='280px';
    dialogConfig.minWidth = '280px';
    dialogConfig.maxWidth = '280px';
    this.dialog.open(DialogComponent, dialogConfig);
  }

  ngOnInit(): void {
    this.businessId = this.authService.businessId();
    this.userId = this.authService.userId();

    this.HostLocations = this.appointmentService.getHostLocations(this.businessId, this.userId).subscribe((res: any) => {
      if (res.Locs != null){
        this.locationId = res.Locs.LocationId;
        this.doorId = res.Locs.Door;
        this.getAppointments();
      } else {
        this.showDoorInfo = true;
        this.locations$ = this.locationService.getLocationsHost(this.businessId).pipe(
          map((res: any) => {
            return res.Locs;
          }),
          catchError(err => {
            this.onError = err.Message;
            return this.onError;
          })
        );
      }
    });

    this.reasonsSub = this.reasonService.getReasons(this.businessId).subscribe(
      (res: any) => {
        if (res != null ){
          if (res.Code == 200){
            this.reasons = res.Reasons;
            return res.Reasons;
          }
        }
      },
      error => {
        //save error
        this.openSnackBar("An error ocurred, try again","Error");
      });
  }

  addAppointment(){
    //AGREGAR WALK IN Y APPOINTMENT
    let dobClient: Date = this.clientForm.value.DOB;
    let dob: string = '';
    if (dobClient.toString() == '') {
      dob = '';
    } else {
      let month = ((dobClient.getMonth()+1).toString().length > 1 ? (dobClient.getMonth()+1).toString() : '0'+(dobClient.getMonth()+1).toString()); 
      let day = (dobClient.getDate().toString().length > 1 ? dobClient.getDate().toString() : '0'+dobClient.getDate().toString());
      dob = dobClient.getUTCFullYear().toString() + '-' + month + '-' + day;
    }
    let phoneNumber = this.clientForm.value.Phone.toString().replace('(','').replace(')','').replace(' ','').replace('-','');
    let formData = {
      BusinessId: this.businessId,
      LocationId: this.locationId,
      Door: this.doorId,
      Phone: (phoneNumber == '' ?  '0000000000' : phoneNumber),
      Name: this.clientForm.value.Name,
      Email: (this.clientForm.value.Email == '' ? '' : this.clientForm.value.Email),
      DOB: dob,
      Gender: (this.clientForm.value.Gender == '' ? '': this.clientForm.value.Gender),
      Preference: (this.clientForm.value.Preference == '' ? '': this.clientForm.value.Preference),
      Disability: (this.clientForm.value.Disability == null ? '': this.clientForm.value.Disability),
      Companions: (this.clientForm.value.Companions == null ? '': this.clientForm.value.Companions)
    }
    var spinnerRef = this.spinnerService.start("Adding Appointment...");
    this.newAppointment$ = this.appointmentService.postNewAppointment(formData).pipe(
      map((res: any) => {
        if (res.Code == 200){
          this.walkIns.push(res.Appointment);
        }
        this.spinnerService.stop(spinnerRef);
        this.clientForm.reset({Phone:'',Name:'',Email:'',DOB:'',Gender:'',Preference:''});
        this.showApp = false;
        return res.Code;
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        this.onError = err.Message;
        this.openDialog('Error !', "Error on created appointment, try again", false, true, false);
        return this.onError;
      })
    );
  }

  showAppointment(){
    this.showApp = !this.showApp;
    if (this.showApp){
      this.clientForm.reset({Phone:'',Name:'',Email:'',DOB:'',Gender:'',Preference:''});
    }
  }

  onCancelAddAppointment(){
    this.clientForm.reset({Phone:'',Name:'',Email:'',DOB:'',Gender:'',Preference:''});
    this.showApp = false;
  }

  getErrorMessage(component: string){
    if (component === 'Email'){
      return this.f.Email.hasError('required') ? 'You must enter an Email' :
        this.f.Email.hasError('maxlength') ? 'Maximun length 200' :
          this.f.Email.hasError('pattern') ? 'Invalid Email' :
          '';
    }
    if (component === 'Name'){
      return this.f.Name.hasError('required') ? 'You must enter a value' :
        this.f.Name.hasError('minlength') ? 'Minimun length 3' :
          this.f.Name.hasError('maxlength') ? 'Maximun length 100' :
            '';
    }
    if (component === 'Phone'){
      return this.f.Phone.hasError('minlength') ? 'Minimun length 6' :
        this.f.Phone.hasError('maxlength') ? 'Maximun length 14' :
          '';
    }
    if (component === 'Companions'){
      return this.f.Companions.hasError('maxlength') ? 'Maximun length 2' :
        this.f.Companions.hasError('min') ? 'Minimun value 1' :
          this.f.Companions.hasError('max') ? 'Maximun value 20' :
            '';
    }
  }

  onCancelApp(appo: any, reasonId: string, index: number){
    //CANCELAR APPOINTMENT
    if (reasonId == undefined){
      this.openSnackBar("You must select a reason","Cancel Appointment");
    }
    let formData = {
      Status: 5,
      DateAppo: appo.DateFull,
      Reason: reasonId
    }
    this.updAppointment$ = this.appointmentService.updateAppointment(appo.AppId, formData).pipe(
      map((res: any) => {
        if (res.Code == 200){
          var data = this.preCheckIn.findIndex(e => e.AppId === appo.AppId);
          this.preCheckIn.splice(data, 1);
          this.showCancelOptions[index] = false;
          this.selected[index] = undefined; 
          this.openSnackBar("La Cita cancelled successfull","Cancel");
        }
      }),
      catchError(err => {
        this.onError = err.Message;
        this.openSnackBar("Something goes wrong try again","Cancel");
        return this.onError;
      })
    );
  }

  onCheckInApp(appo: any){
    //READ QR CODE AND CHECK-IN PROCESS
    if (appo.Phone != '0000000000') {
      const dialogRef = this.dialog.open(VideoDialogComponent, {
        width: '450px',
        height: '570px',
        data: {qrCode: ''}
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result != undefined) {
          this.qrCode = result;
          this.checkInAppointment(this.qrCode, appo);
        }
      });
    } else {
      this.checkInAppointment('VALID', appo);
    }
  }

  checkInAppointment(qrCode: string, appo: any){
    let formData = {
      Status: 3,
      DateAppo: appo.DateFull,
      qrCode: qrCode
    }
    this.checkIn$ = this.appointmentService.updateAppointment(appo.AppId, formData).pipe(
      map((res: any) => {
        if (res.Code == 200){
          var data = this.preCheckIn.findIndex(e => e.AppId === appo.AppId);
          this.preCheckIn.splice(data, 1);
          
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

  onMessageApp(appointmentId: string, value: string, i: number, qeue: string){
    //GET MESSAGES APPOINTMENT
    let formData = {
      Message: value
    }
    this.messages$ = this.appointmentService.putMessage(appointmentId, '1', formData).pipe(
      map((res:any) => {
        if (res != null){
          if (res.Code == 200){
            if (qeue == 'schedule'){
              this.showMessageSche[i] = false;
            }
            if (qeue == 'walkin'){
              this.showMessageWalk[i] = false;
            }
            if (qeue == 'precheck'){
              this.showMessagePre[i] = false;
            }
            this.openSnackBar("Messages send successfull","Messages");
          } else {
            this.openSnackBar("Something goes wrong try again","Messages");
          }
        } else {
          this.openSnackBar("Something goes wrong try again","Messages");
        }
      }),
      catchError(err => {
        this.openSnackBar("Something goes wrong try again","Messages");
        this.onError = err.Message;
        return this.onError;
      })
    );
  }

  onShowMessage(appo: any, i: number, type: string){
    if (appo.Unread == 'H') {
      appo.Unread = '0';
    }
    this.commentsSubs = this.appointmentService.getMessages(appo.AppId, 'H').subscribe((res: any) => {
        if (res != null){
          if (res.Code == 200){
            if (type == 'schedule'){
              this.getCommentsSche[i] = res.Messages;
            }
            if (type == 'walkin'){
              this.getCommentsWalk[i] = res.Messages;
            }
            if (type == 'pre'){
              this.getCommentsPre[i] = res.Messages;
            }
          } else {
            this.openSnackBar("Something goes wrong try again","Messages");
          }
        }
      });
  }

  onReadyCheckIn(appo: any, tipo: number){
    //MOVE TO READY TO CHECK-IN INSTEAD OF DRAG AND DROP
    let formData = {
      Status: 2,
      DateAppo: appo.DateFull
    }
    this.updAppointment$ = this.appointmentService.updateAppointment(appo.AppId, formData).pipe(
      map((res: any) => {
        if (res.Code == 200){
          if (tipo == 1) { 
            var data = this.schedule.findIndex(e => e.AppId === appo.AppId);
            this.schedule.splice(data, 1);
          } else {
            var data = this.walkIns.findIndex(e => e.AppId === appo.AppId);
            this.walkIns.splice(data, 1);
          }
          this.preCheckIn.push(appo);
          this.openSnackBar("Ready to check-in successfull","Ready to Check-In");
        }
      }),
      catchError(err => {
        this.onError = err.Message;
        this.openSnackBar("Something goes wrong try again","Transfer");
        return this.onError;
      })
    );
  }

  setLocation(event){
    this.doors = event.Doors.split(',');
    this.locationId = event.LocationId;
    this.getAppointments();
  }

  getAppointments(){
    let dateAppo = new Date();
    //let dateAppoStr = dateAppo.getFullYear() + '-' + (dateAppo.getMonth()+1 < 10 ? '0' + (dateAppo.getMonth()+1).toString() : dateAppo.getMonth()+1) + '-' + (dateAppo.getDate() < 10 ? '0' + dateAppo.getDate().toString() : dateAppo.getDate().toString());
    let dateAppoStr = '2020-05-25-09-00';
    let dateAppoFinStr = '2020-05-25-23-00';
    var spinnerRef = this.spinnerService.start("Loading Appointments...");
    this.appointments$ = this.appointmentService.getAppointments(this.businessId, this.locationId, dateAppoStr, dateAppoFinStr, 1, 2).pipe(
      map((res: any) => {
        if (res != null) {
          res['Appos-01'].forEach(item => {
            let hora = item['DateAppo'].substring(11,16).replace('-',':');
            hora = (+hora.substring(0,2) > 12 ? (+hora.substring(0,2)-12).toString() : hora.substring(0,2)) + ':' + hora.substring(3).toString() + (+hora.substring(0,2) > 12 ? ' PM' : ' AM');
            let data = {
              AppId: item['AppointmentId'],
              ClientId: item['ClienteId'],
              Name: item['Name'].toLowerCase().substring(0, 24)+(item['Name'].length > 24 ? '...' : ''),
              OnBehalf: item['OnBehalf'],
              Companions: item['Companions'],
              Door: item['Door'].substring(0,40)+(item['Door'].length > 40 ? '...' : ''),
              Disability: item['Disability'],
              Phone: item['Phone'],
              DateFull: item['DateAppo'],
              DateAppo: hora,
              Unread: item['Unread']
            }
            if (item['Type'] == 1 && item['Status'] == 1){
              this.schedule.push(data);
            }
            if (item['Type'] == 2 && item['Status'] == 1){
              this.walkIns.push(data);
            }
          });
          res['Appos-02'].forEach(item => {
            let hora = item['DateAppo'].substring(11,16).replace('-',':');
            let data = {
              AppId: item['AppointmentId'],
              ClientId: item['ClienteId'],
              Name: item['Name'],
              OnBehalf: item['OnBehalf'],
              Companions: item['Companions'],
              Door: item['Door'],
              Disability: item['Disability'],
              Phone: item['Phone'],
              DateFull: item['DateAppo'],
              DateAppo: hora,
              Unread: item['Unread']
            }
            if (item['Status'] == 2){
              this.preCheckIn.push(data);
            }
          });
          this.spinnerService.stop(spinnerRef);
        }
        return res.Appos;
      }),
      catchError(err => {
        this.onError = err.Message;
        this.spinnerService.stop(spinnerRef);
        return this.onError;
      })
    );
  }

  setDoor(event) {
    this.doorId = event.value;
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer != event.container) {
      let appo = event.previousContainer.data[event.previousIndex];
      let container = event.previousContainer.id;
      let formData = {
        Status: 2,
        DateAppo: appo['DateFull']
      }

      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, this.preCheckIn.length);
      this.updAppointment$ = this.appointmentService.updateAppointment(appo['AppId'], formData).pipe(
        map((res: any) => {
          if (res.Code == 200){
            this.openSnackBar("Ready to check-in successfull","Ready to Check-In");
          }
        }),
        catchError(err => {
          var data = this.preCheckIn.findIndex(e => e.AppId === appo['AppId']);
          this.preCheckIn.splice(data, 1);

          if (container == "cdk-drop-list-0"){ 
            this.schedule.push(JSON.parse(appo));
          } else {
            this.walkIns.push(JSON.parse(appo));
          }

          this.onError = err.Message;
          this.openSnackBar("Something goes wrong try again","Transfer");
          return this.onError;
        })
      );
    }
  }

  ngOnDestroy() {
    if (this.HostLocations){
      this.HostLocations.unsubscribe();
    }
    if (this.commentsSubs){
      this.commentsSubs.unsubscribe();
    }
    if (this.reasonsSub){
      this.reasonsSub.unsubscribe();
    }
  }

  onLoadMoreAppointments(){
    console.log("fire more appos");
  }

}
