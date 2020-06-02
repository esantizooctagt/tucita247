import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { Observable, Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LocationService, ReasonsService, BusinessService } from '@app/services';
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
  appointmentsSche$: Observable<Appointment[]>;
  appointmentsWalk$: Observable<Appointment[]>;
  appointmentsPre$: Observable<Appointment[]>;
  appointmentsPrevious$: Observable<Appointment[]>;
  getCheckIns$: Observable<any[]>;
  messages$: Observable<any>;
  newAppointment$: Observable<any>;
  updAppointment$: Observable<any>;
  getMessages$: Observable<any[]>;
  quantityPeople$: Observable<any>;
  checkIn$: Observable<any>;
  HostLocations: Subscription;
  commentsSubs: Subscription;
  reasonsSub: Subscription;
  opeHoursSub: Subscription;

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

  showPrevious: boolean = false;
  previous=[];
  selected=[];

  buckets=[];
  currHour: number = 0;
  bucketInterval: number = 0;
  qtyPeople: string = '';
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

  lastItemWalk: string = '_';
  lastItemPre: string = '_';
  lastItem: string = '_';
  appoIdWalk: string = '_';
  appoIdPre: string = '_';
  appoIdSche: string = '_';
  lastItemCheckIn: string = '_';
  appoIdCheckIn: string = '_';

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
    private businessService: BusinessService,
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
    {
      AppId: "69090",
      ClientId: "55555",
      Name: "L SMITH",
      Phone: "4549109452",
      OnBehalf: 0,
      Companions: 1,
      DateAppo: "10:00",
      Door: "LEVEL 1",
      Disability: "",
      DateFull: "2020-05-25-10-00",
      Unread: "0"
    },
    {
      AppId: "62395",
      ClientId: "55555",
      Name: "J SMITH",
      Phone: "4549359282",
      OnBehalf: 0,
      Companions: 1,
      DateAppo: "10:00",
      Door: "LEVEL 1",
      Disability: "",
      DateFull: "2020-05-25-10-00",
      Unread: "0"
    },
    {
      AppId: "34095",
      ClientId: "55555",
      Name: "M SMITH",
      Phone: "4549103482",
      OnBehalf: 0,
      Companions: 1,
      DateAppo: "10:00",
      Door: "LEVEL 1",
      Disability: "",
      DateFull: "2020-05-25-10-00",
      Unread: "0"
    },
    {
      AppId: "67895",
      ClientId: "55555",
      Name: "SS SMITH",
      Phone: "4549359282",
      OnBehalf: 0,
      Companions: 1,
      DateAppo: "10:00",
      Door: "LEVEL 1",
      Disability: "",
      DateFull: "2020-05-25-10-00",
      Unread: "0"
    },
    {
      AppId: "36795",
      ClientId: "55555",
      Name: "M Bsm",
      Phone: "4549103482",
      OnBehalf: 0,
      Companions: 1,
      DateAppo: "10:00",
      Door: "LEVEL 1",
      Disability: "",
      DateFull: "2020-05-25-10-00",
      Unread: "0"
    }
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
  preCheckIn =[
    {
      AppId: "34256",
      ClientId: "55555",
      Name: "MELANIE SANTIZO",
      Phone: "4569009282",
      OnBehalf: 0,
      Companions: 1,
      DateAppo: "10:00",
      Door: "LEVEL 1",
      Disability: "",
      DateFull: "2020-05-25-10-00",
      Unread: "0",
      CheckInTime: "2020-05-25-10-00",
      ElapsedTime: ""
    }
  ]

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
        this.getOperationHours(this.businessId, this.locationId);
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

    setTimeout(() => {
      if (this.locationId != '') {
        this.getAppointmentsSche();
        this.getAppointmentsWalk();
        this.getAppointmentsPre();
        this.quantityPeople$ = this.locationService.getLocationQuantity(this.businessId, this.locationId).pipe(
          map((res: any) => {
            if (res != null){
              this.qtyPeople = res.Quantity;
              return res.Quantity.toString();
            }
          }),
          catchError(err => {
            this.onError = err.Message;
            return '0';
          })
        );
      }
    }, 3000);

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

    setInterval(() => { 
      this.quantityPeople$ = this.locationService.getLocationQuantity(this.businessId, this.locationId).pipe(
          map((res: any) => {
            if (res != null){
              this.qtyPeople = res.Quantity;
              return res.Quantity.toString();
            }
          }),
          catchError(err => {
            this.onError = err.Message;
            return '0';
          })
        );
    }, 30000);

    setInterval(() => {
      this.preCheckIn.forEach(res => {
        let options = {
          timeZone: 'America/Puerto_Rico',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          hour12: false,
        },
        formatter = new Intl.DateTimeFormat([], options);
        var actual = formatter.format(new Date());
        var d = new Date();
        d.setHours(+res.CheckInTime.substring(11,13));
        d.setMinutes(+res.CheckInTime.substring(14,16));
        
        var a = new Date();
        a.setHours(+actual.substring(0,2));
        a.setMinutes(+actual.substring(3,5));
        
        var diff = (+a - +d); 
        var diffHrs = Math.floor((diff % 86400000) / 3600000); // hours
        var diffMins = Math.round(((diff % 86400000) % 3600000) / 60000); // minutes
        var diff = (diffHrs*60)+diffMins;
        res.ElapsedTime = diff.toString();
      });

    }, 60000);
  
    setInterval(() => {
      this.getAppointmentsSche();
      this.getAppointmentsWalk();
      this.getAppointmentsPre();
    }, 3500000);
  }

  getLocationCheckIn(){
    let dateAppo = '2020-05-25';
    // let yearCurr = this.getYear();
    // let monthCurr = this.getMonth();
    // let dayCurr = this.getDay();
    // let dateAppo = yearCurr + '-' + monthCurr + '-' + dayCurr;

    this.getCheckIns$ = this.locationService.getLocationCheckIn(this.businessId, this.locationId, dateAppo, this.lastItemCheckIn, this.appoIdCheckIn).pipe(
      map((res: any) => {
        if (res.Code == 200){
          this.lastItemCheckIn = res['lastItem'].toString().replace('3#DT#','');
          this.appoIdCheckIn = res['AppId'];
          // res['Appos'].forEach(item => {
          //   let data = {
          //     AppId: item['AppointmentId'],
          //     Name: item['Name'],
          //     Phone: item['Phone'],
          //     Door: item['Door']
          //   }
          //   this.checkIns.push(data);
          // });
          return res.Appos;
        }
      }),
      catchError(err => {
        this.onError = err.Message;
        return this.onError;
      })
    );
  }

  getOperationHours(businessId: string, locationId: string){
    this.opeHoursSub = this.businessService.getBusinessOpeHours(businessId, locationId).subscribe((res: any) =>{
      if (res != null) {
        if (res.Code == 200) {
          this.bucketInterval = parseFloat(res.BucketInterval);
          this.currHour = parseFloat(res.CurrHour);
          let hours = res.Hours;
          this.buckets = [];
          for (var i=0; i<=hours.length-1; i++){
            let horaIni = parseFloat(hours[i].HoraIni);
            let horaFin = parseFloat(hours[i].HoraFin);
            for (var x=horaIni; x<=horaFin; x+=this.bucketInterval){
              let hora = '';
              if (x % 1 != 0){
                hora = (x - (x%1)).toString().padStart(2,'0') + ':30';
              } else {
                hora = x.toString().padStart(2, '0') + ':00';
              }
              this.buckets.push({ TimeFormat: hora, Time: x });
            }
          }
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
      qrCode: qrCode,
      BusinessId: this.businessId,
      LocationId: this.locationId
    }
    this.checkIn$ = this.appointmentService.updateAppointmentCheckIn(appo.AppId, formData).pipe(
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
          let appoObj = res.Appo;
          if (tipo == 1) { 
            var data = this.schedule.findIndex(e => e.AppId === appo.AppId);
            this.schedule.splice(data, 1);
          } else {
            var data = this.walkIns.findIndex(e => e.AppId === appo.AppId);
            this.walkIns.splice(data, 1);
          }
          appo.CheckInTime = appoObj['TIMECHEK'];
          appo.ElapsedTime = "0";
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
    this.getAppointmentsSche();
    this.getAppointmentsWalk();
    this.getAppointmentsPre();
  }

  getTime(): string{
    let options = {
      timeZone: 'America/Puerto_Rico',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    },
    formatter = new Intl.DateTimeFormat([], options);
    var actual = formatter.format(new Date());
    var actualTime = '';
    var a = new Date();
    var hour: number = +actual.substring(0,2);
    var min: number = (+actual.substring(3,5) > 30 ? 0.5 : 0);
    if (+actual.substring(3,5) > 30){
      if (hour+1 > 24){
        hour = 1;
        min = 0;
      } else {
        hour = hour+1;
        min = 0;
      }
    }
    var actTime: number = 0;
    if (this.bucketInterval == 0.5){
      actTime = hour+min;
    } else {
      actTime = hour;
    }
    let iniTime = '';
    for (var i=0; i<= this.buckets.length-1; i++){
      if (this.buckets[i].Time == actTime){
        actualTime = this.buckets[i].TimeFormat;
        break;
      }
    }
    return actualTime;
  }

  getYear(): string{
    let options = {
      timeZone: 'America/Puerto_Rico',
      year: 'numeric'
    },
    formatter = new Intl.DateTimeFormat([], options);
    var actual = formatter.format(new Date());
    return actual;
  }

  getMonth(): string{
    let options = {
      timeZone: 'America/Puerto_Rico',
      month: 'numeric'
    },
    formatter = new Intl.DateTimeFormat([], options);
    var actual = formatter.format(new Date());
    return actual.padStart(2,'0');
  }

  getDay(): string{
    let options = {
      timeZone: 'America/Puerto_Rico',
      day: 'numeric'
    },
    formatter = new Intl.DateTimeFormat([], options);
    var actual = formatter.format(new Date());
    return actual.padStart(2,'0');
  }

  getPreviousAppos(time: string){
    let dateAppo = '2020-05-25-10-00';
    // let yearCurr = this.getYear();
    // let monthCurr = this.getMonth();
    // let dayCurr = this.getDay();
    // let dateAppoStr = yearCurr + '-' + monthCurr + '-' + dayCurr + '-' + time.replace(':','-');

    var spinnerRef = this.spinnerService.start("Loading Appointments...");
    this.appointmentsPrevious$ = this.appointmentService.getPreviousAppointments(this.businessId, this.locationId, dateAppo, 1, 1).pipe(
      map((res: any) => {
        if (res != null) {
          res['Appos'].forEach(item => {
            let hora = item['DateAppo'].substring(11,16).replace('-',':');
            hora = (+hora.substring(0,2) > 12 ? (+hora.substring(0,2)-12).toString() : hora.substring(0,2)) + ':' + hora.substring(3).toString() + (+hora.substring(0,2) > 12 ? ' PM' : ' AM');
            let data = {
              AppId: item['AppointmentId'],
              ClientId: item['ClientId'],
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
            this.previous.push(data);
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

  getAppointmentsSche(){
    let dateAppoStr = '2020-05-25-09-00';
    let dateAppoFinStr = '2020-05-25-23-00';
    // let getHours = this.getTime();
    // let hourIni = '00-00';
    // let hourFin = '00-00';
    // if (getHours.length > 0) {
    //   hourIni = getHours.replace(':','-');
    //   hourFin = getHours.replace(':','-');
    // }
    // let yearCurr = this.getYear();
    // let monthCurr = this.getMonth();
    // let dayCurr = this.getDay();
    // let dateAppoStr = yearCurr + '-' + monthCurr + '-' + dayCurr + '-' + hourIni;
    // let dateAppoFinStr = yearCurr + '-' + monthCurr + '-' + dayCurr + '-' + hourFin;

    var spinnerRef = this.spinnerService.start("Loading Appointments...");
    this.appointmentsSche$ = this.appointmentService.getAppointments(this.businessId, this.locationId, dateAppoStr, dateAppoFinStr, 1, 1, this.lastItem, this.appoIdSche).pipe(
      map((res: any) => {
        if (res != null) {
          this.lastItem = res['lastItem'].toString().replace('1#DT#','');
          this.appoIdSche = res['AppId'].toString();
          res['Appos'].forEach(item => {
            let hora = item['DateAppo'].substring(11,16).replace('-',':');
            hora = (+hora.substring(0,2) > 12 ? (+hora.substring(0,2)-12).toString() : hora.substring(0,2)) + ':' + hora.substring(3).toString() + (+hora.substring(0,2) > 12 ? ' PM' : ' AM');
            let data = {
              AppId: item['AppointmentId'],
              ClientId: item['ClientId'],
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
            this.schedule.push(data);
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

  getAppointmentsWalk(){
    let dateAppoStr = '2020-05-25-09-00';
    let dateAppoFinStr = '2020-05-25-23-00';
    // let getHours = this.getTime();
    // let hourIni = '00-00';
    // let hourFin = '00-00';
    // if (getHours.length > 0) {
    //   hourIni = getHours.replace(':','-');
    //   hourFin = getHours.replace(':','-');
    // }
    // let yearCurr = this.getYear();
    // let monthCurr = this.getMonth();
    // let dayCurr = this.getDay();
    // let dateAppoStr = yearCurr + '-' + monthCurr + '-' + dayCurr + '-' + hourIni;
    // let dateAppoFinStr = yearCurr + '-' + monthCurr + '-' + dayCurr + '-' + hourFin;

    var spinnerRef = this.spinnerService.start("Loading Appointments...");
    this.appointmentsWalk$ = this.appointmentService.getAppointments(this.businessId, this.locationId, dateAppoStr, dateAppoFinStr, 1, 2, this.lastItemWalk, this.appoIdWalk).pipe(
      map((res: any) => {
        if (res != null) {
          this.lastItemWalk = res['lastItem'].toString().replace('1#DT#','');
          this.appoIdWalk = res['AppId'].toString();
          res['Appos'].forEach(item => {
            let hora = item['DateAppo'].substring(11,16).replace('-',':');
            hora = (+hora.substring(0,2) > 12 ? (+hora.substring(0,2)-12).toString() : hora.substring(0,2)) + ':' + hora.substring(3).toString() + (+hora.substring(0,2) > 12 ? ' PM' : ' AM');
            let data = {
              AppId: item['AppointmentId'],
              ClientId: item['ClientId'],
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
            this.walkIns.push(data);
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

  getAppointmentsPre(){
    let dateAppoStr = '2020-05-25-09-00';
    let dateAppoFinStr = '2020-05-25-23-00';
    // let getHours = this.getTime();
    // let hourIni = '00-00';
    // let hourFin = '00-00';
    // if (getHours.length > 0) {
    //   hourIni = getHours.replace(':','-');
    //   hourFin = getHours.replace(':','-');
    // }
    // let yearCurr = this.getYear();
    // let monthCurr = this.getMonth();
    // let dayCurr = this.getDay();
    // let dateAppoStr = yearCurr + '-' + monthCurr + '-' + dayCurr + '-' + hourIni;
    // let dateAppoFinStr = yearCurr + '-' + monthCurr + '-' + dayCurr + '-' + hourFin;
    var spinnerRef = this.spinnerService.start("Loading Appointments...");
    this.appointmentsPre$ = this.appointmentService.getAppointments(this.businessId, this.locationId, dateAppoStr, dateAppoFinStr, 2, '_', this.lastItemPre, this.appoIdPre).pipe(
      map((res: any) => {
        if (res != null) {
          this.lastItemPre = res['lastItem'].toString().replace('2#DT#','');
          this.appoIdPre = res['AppId'].toString();
          res['Appos'].forEach(item => {
            let hora = item['DateAppo'].substring(11,16).replace('-',':');
            hora = (+hora.substring(0,2) > 12 ? (+hora.substring(0,2)-12).toString() : hora.substring(0,2)) + ':' + hora.substring(3).toString() + (+hora.substring(0,2) > 12 ? ' PM' : ' AM');
            let data = {
              AppId: item['AppointmentId'],
              ClientId: item['ClientId'],
              Name: item['Name'].toLowerCase().substring(0, 24)+(item['Name'].length > 24 ? '...' : ''),
              OnBehalf: item['OnBehalf'],
              Companions: item['Companions'],
              Door: item['Door'].substring(0,40)+(item['Door'].length > 40 ? '...' : ''),
              Disability: item['Disability'],
              Phone: item['Phone'],
              DateFull: item['DateAppo'],
              DateAppo: hora,
              Unread: item['Unread'],
              CheckInTime: item['CheckInTime'],
              ElapsedTime: this.calculateTime(item['CheckInTime'])
            }
            this.preCheckIn.push(data);
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

  calculateTime(cardTime: string): string{
    let options = {
      timeZone: 'America/Puerto_Rico',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    },
    formatter = new Intl.DateTimeFormat([], options);
    var actual = formatter.format(new Date());
    var d = new Date();
    d.setHours(+cardTime.substring(11,13));
    d.setMinutes(+cardTime.substring(14,16));
    
    var a = new Date();
    a.setHours(+actual.substring(0,2));
    a.setMinutes(+actual.substring(3,5));
    
    var diff = (+a - +d); 
    var diffHrs = Math.floor((diff % 86400000) / 3600000); // hours
    var diffMins = Math.round(((diff % 86400000) % 3600000) / 60000); // minutes
    var diff = (diffHrs*60)+diffMins;
    return diff.toString();
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
            let appoObj = res.Appo;
            let appoGet = this.preCheckIn[this.preCheckIn.length-1];
            appoGet.CheckInTime = appoObj['TIMECHEK'];
            appoGet.ElapsedTime = "0";
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
    if (this.opeHoursSub){
      this.opeHoursSub.unsubscribe();
    }
  }

  onScrollSche(){
    this.getAppointmentsSche();
  }

  onScrollWalk(){
    this.getAppointmentsWalk();
  }

  onScrollPre(){
    this.getAppointmentsPre();
  }
}