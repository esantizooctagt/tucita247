import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable, Subscription, throwError } from 'rxjs';
import { LocationService, ServService, BusinessService, AppointmentService } from '@app/services';
import { map, catchError, switchMap } from 'rxjs/operators';
import { SpinnerService } from '@app/shared/spinner.service';
import { AuthService } from '@app/core/services';
import { AppoDialogComponent } from '@app/shared/appo-dialog/appo-dialog.component';
import { ShowappoDialogComponent } from '@app/shared/showappo-dialog/showappo-dialog.component';
import { DialogComponent } from '@app/shared/dialog/dialog.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LearnDialogComponent } from '@app/shared/learn-dialog/learn-dialog.component';
import { MonitorService } from '@app/shared/monitor.service';
import { DialogcancelComponent } from '@app/shared/dialogcancel/dialogcancel.component';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScheduleComponent implements OnInit {
  currWeek: number = 1;
  currTime: string = '';
  searchValue: string = '';
  isSticky: boolean = false;
  today: Date;
  weekStart: Date;
  weekEnd: Date;
  monday: Date;
  tuesday: Date;
  wednesday: Date;
  thursday: Date;
  friday: Date;
  saturday: Date;
  sunday: Date;
  updatedMon: any;
  updatedTue: any;
  updatedWed: any;
  updatedThu: any;
  updatedFri: any;
  updatedSat: any;
  updatedSun: any;
  hours = [];
  MonHours = [];
  TueHours = [];
  WedHours = [];
  ThuHours = [];
  FriHours = [];
  SatHours = [];
  SunHours = [];

  businessId: string = '';
  doors: string = '';
  TimeZone: string = '';
  minHr: number = 0;
  maxHr: number = 0;
  minHr00: number = 0;
  maxHr00: number = 0;
  minHr45: number = 0;
  maxHr45: number = 0;

  locationData$: Observable<any[]>;
  cancelAppos$: Observable<any>;
  services$: Observable<any[]>;
  putAppo$: Observable<any>;
  validBusiness$: Observable<any>;
  locations: any[]=[];
  operationHours$: Observable<any>;
  locationData: string = '';
  locationId: string = '';
  providerId: string = '';
  resServices: any[]=[];

  hiddenUp: boolean = true;
  hiddenDown: boolean = true;

  subsMessages: Subscription;

  displayYesNo: boolean = false;

  timeHr = [0,15,30,45,100,115,130,145,200,215,230,245,300,315,330,345,400,415,430,445,500,515,530,545,600];
  //,615,630,645,700,715,730,745,800,815,830,845,900,915,930,945,1000,1015,1030,1045,1100,1115,1130,1145,1200,1215,1230,1245,1300,1315,1330,1345,1400,1415,1430,1445,1500,1515,1530,1545,1600,1615,1630,1645,1700,1715,1730,1745,1800,1815,1830,1845,1900,1915,1930,1945,2000,2015,2030,2045,2100,2115,2130,2145,2200,2215,2230,2245,2300,2315,2330,2345];

  liveData$ = this.monitorService.syncMessage.pipe(
    map((message: any) => {
      this.syncData(message);
    })
  );

  constructor(
    private authService: AuthService,
    private domSanitizer: DomSanitizer,
    private matIconRegistry: MatIconRegistry,
    private locationService: LocationService,
    private spinnerService: SpinnerService,
    private businessService: BusinessService,
    private serviceService: ServService,
    private appointmentService: AppointmentService,
    public dialog: MatDialog,
    private learnmore: MatDialog,
    private _snackBar: MatSnackBar,
    private monitorService: MonitorService,
    public datepipe: DatePipe
  ) {
    this.matIconRegistry.addSvgIcon('new',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/newAppo.svg'));
    this.matIconRegistry.addSvgIcon('less',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/less.svg'));
    this.matIconRegistry.addSvgIcon('less2',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/less2.svg'));
    this.matIconRegistry.addSvgIcon('more',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/more.svg'));
    this.matIconRegistry.addSvgIcon('cancel02',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/trash.svg'));
    this.matIconRegistry.addSvgIcon('view',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/expand02.svg'));
    this.matIconRegistry.addSvgIcon('check01',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/check01.svg'));
    this.matIconRegistry.addSvgIcon('refresh',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/refresh.svg'));
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

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
    });
  }

  openLearnMore(message: string): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      message: message
    };
    this.learnmore.open(LearnDialogComponent, dialogConfig);
  }

  syncData(msg: any){
    //NEW APPOINTMENT
    if (msg == null) {return;}
    console.log(msg);
    if (msg['Tipo'] == 'APPO'){
      if (msg['BusinessId'] == this.businessId && msg['LocationId'] == this.locationId && msg['ProviderId'] == this.providerId){
        let serv = this.resServices.filter(x => x.ServiceId == msg['ServiceId']);
        let time = 0;
        let bckt = 0;
        if (serv.length > 0){
          time = serv[0].TimeService;
          bckt = serv[0].Bucket;
        }
        
        if (this.monday.getFullYear()+'-'+(this.monday.getMonth()+1).toString().padStart(2,'0')+'-'+this.monday.getDate().toString().padStart(2,'0') == msg['DateFull'].substring(0,10)){
          let numRows = this.timeHr.indexOf(time);
          let data = this.MonHours.filter(x => x.Time24 >= Number(msg['DateFull'].toString().substring(11,16).replace('-','')));

          if (numRows > 0){
            for (let i=0; i <= numRows-1; i++){
              if (data.length > 0){
                data[i].Bucket = bckt;
                data[i].ServiceId = msg['ServiceId'];
                data[i].Used = Number(data[i].Used)+Number(msg['Guests']); 
                data[i].Available = Number(bckt)-Number(data[i].Used);
                this.updatedMon = new Date();
              }
            }
          }
        }
        if (this.tuesday.getFullYear()+'-'+(this.tuesday.getMonth()+1).toString().padStart(2,'0')+'-'+this.tuesday.getDate().toString().padStart(2,'0') == msg['DateFull'].substring(0,10)){
          let numRows = this.timeHr.indexOf(time);
          let data = this.TueHours.filter(x => x.Time24 >= Number(msg['DateFull'].toString().substring(11,16).replace('-','')));

          if (numRows > 0){
            for (let i=0; i <= numRows-1; i++){
              if (data.length > 0){
                data[i].Bucket = bckt;
                data[i].ServiceId = msg['ServiceId'];
                data[i].Used = Number(data[i].Used)+Number(msg['Guests']); 
                data[i].Available = Number(bckt)-Number(data[i].Used);
                this.updatedTue = new Date();
              }
            }
          }
        }
        if (this.wednesday.getFullYear()+'-'+(this.wednesday.getMonth()+1).toString().padStart(2,'0')+'-'+this.wednesday.getDate().toString().padStart(2,'0') == msg['DateFull'].substring(0,10)){
          let numRows = this.timeHr.indexOf(time);
          let data = this.WedHours.filter(x => x.Time24 >= Number(msg['DateFull'].toString().substring(11,16).replace('-','')));

          if (numRows > 0){
            for (let i=0; i <= numRows-1; i++){
              if (data.length > 0){
                data[i].Bucket = bckt;
                data[i].ServiceId = msg['ServiceId'];
                data[i].Used = Number(data[i].Used)+Number(msg['Guests']); 
                data[i].Available = Number(bckt)-Number(data[i].Used);
                this.updatedWed = new Date();
              }
            }
          }
        }
        if (this.thursday.getFullYear()+'-'+(this.thursday.getMonth()+1).toString().padStart(2,'0')+'-'+this.thursday.getDate().toString().padStart(2,'0') == msg['DateFull'].substring(0,10)){
          let numRows = this.timeHr.indexOf(time);
          let data = this.ThuHours.filter(x => x.Time24 >= Number(msg['DateFull'].toString().substring(11,16).replace('-','')));

          if (numRows > 0){
            for (let i=0; i <= numRows-1; i++){
              if (data.length > 0){
                data[i].Bucket = bckt;
                data[i].ServiceId = msg['ServiceId'];
                data[i].Used = Number(data[i].Used)+Number(msg['Guests']); 
                data[i].Available = Number(bckt)-Number(data[i].Used);
                this.updatedThu = new Date();
              }
            }
          }
        }
        if (this.friday.getFullYear()+'-'+(this.friday.getMonth()+1).toString().padStart(2,'0')+'-'+this.friday.getDate().toString().padStart(2,'0') == msg['DateFull'].substring(0,10)){
          let numRows = this.timeHr.indexOf(time);
          let data = this.FriHours.filter(x => x.Time24 >= Number(msg['DateFull'].toString().substring(11,16).replace('-','')));

          if (numRows > 0){
            for (let i=0; i <= numRows-1; i++){
              if (data.length > 0){
                data[i].Bucket = bckt;
                data[i].ServiceId = msg['ServiceId'];
                data[i].Used = Number(data[i].Used)+Number(msg['Guests']); 
                data[i].Available = Number(bckt)-Number(data[i].Used);
                this.updatedFri = new Date();
              }
            }
          }
        }
        if (this.saturday.getFullYear()+'-'+(this.saturday.getMonth()+1).toString().padStart(2,'0')+'-'+this.saturday.getDate().toString().padStart(2,'0') == msg['DateFull'].substring(0,10)){
          let numRows = this.timeHr.indexOf(time);
          let data = this.SatHours.filter(x => x.Time24 >= Number(msg['DateFull'].toString().substring(11,16).replace('-','')));

          if (numRows > 0){
            for (let i=0; i <= numRows-1; i++){
              if (data.length > 0){
                data[i].Bucket = bckt;
                data[i].ServiceId = msg['ServiceId'];
                data[i].Used = Number(data[i].Used)+Number(msg['Guests']); 
                data[i].Available = Number(bckt)-Number(data[i].Used);
                this.updatedSat = new Date();
              }
            }
          }
        }
        if (this.sunday.getFullYear()+'-'+(this.sunday.getMonth()+1).toString().padStart(2,'0')+'-'+this.sunday.getDate().toString().padStart(2,'0') == msg['DateFull'].substring(0,10)){
          let numRows = this.timeHr.indexOf(time);
          let data = this.SunHours.filter(x => x.Time24 >= Number(msg['DateFull'].toString().substring(11,16).replace('-','')));

          if (numRows > 0){
            for (let i=0; i <= numRows-1; i++){
              if (data.length > 0){
                data[i].Bucket = bckt;
                data[i].ServiceId = msg['ServiceId'];
                data[i].Used = Number(data[i].Used)+Number(msg['Guests']); 
                data[i].Available = Number(bckt)-Number(data[i].Used);
                this.updatedSun = new Date();
              }
            }
          }
        }
      }  
    }
    if (msg['Tipo'] == 'CANCEL'){
      if (msg['BusinessId'] == this.businessId && msg['LocationId'] == this.locationId && msg['ProviderId'] == this.providerId){
        let serv = this.resServices.filter(x => x.ServiceId == msg['ServiceId']);
        let time = 0;
        let bckt = 0;
        if (serv.length > 0){
          time = serv[0].TimeService;
          bckt = serv[0].Bucket;
        }

        if (this.monday.getFullYear()+'-'+(this.monday.getMonth()+1).toString().padStart(2,'0')+'-'+this.monday.getDate().toString().padStart(2,'0') == msg['DateAppo']){
          let numRows = this.timeHr.indexOf(time);
          let data = this.MonHours.filter(x => x.Time24 >= Number(msg['Hour'].toString().replace('-','')));

          if (numRows > 0){
            for (let i=0; i <= numRows-1; i++){
              if (data.length > 0){
                if (Number(data[i].Used)-Number(msg['Qty']) == 0){
                  data[i].Cancel = 0;
                  data[i].ServiceId = '';
                  data[i].Used = 0;
                  data[i].Available = 1;
                  data[i].Bucket = 1;
                  this.updatedMon = new Date();
                } else {
                  data[i].Used = Number(data[i].Used)-Number(msg['Qty']); 
                  data[i].Available = Number(msg['Qty'])+Number(data[i].Available);
                  this.updatedMon = new Date();
                }
              }
            }
          }
        }
        if (this.tuesday.getFullYear()+'-'+(this.tuesday.getMonth()+1).toString().padStart(2,'0')+'-'+this.tuesday.getDate().toString().padStart(2,'0') == msg['DateAppo']){
          let numRows = this.timeHr.indexOf(time);
          let data = this.TueHours.filter(x => x.Time24 >= Number(msg['Hour'].toString().replace('-','')));

          if (numRows > 0){
            for (let i=0; i <= numRows-1; i++){
              if (data.length > 0){
                if (Number(data[i].Used)-Number(msg['Qty']) == 0){
                  data[i].Cancel = 0;
                  data[i].ServiceId = '';
                  data[i].Used = 0;
                  data[i].Available = 1;
                  data[i].Bucket = 1;
                  this.updatedTue = new Date();
                } else {
                  data[i].Used = Number(data[i].Used)-Number(msg['Qty']); 
                  data[i].Available = Number(msg['Qty'])+Number(data[i].Available);
                  this.updatedTue = new Date();
                }
              }
            }
          }
        }
        if (this.wednesday.getFullYear()+'-'+(this.wednesday.getMonth()+1).toString().padStart(2,'0')+'-'+this.wednesday.getDate().toString().padStart(2,'0') == msg['DateAppo']){
          let numRows = this.timeHr.indexOf(time);
          let data = this.WedHours.filter(x => x.Time24 >= Number(msg['Hour'].toString().replace('-','')));

          if (numRows > 0){
            for (let i=0; i <= numRows-1; i++){
              if (data.length > 0){
                if (Number(data[i].Used)-Number(msg['Qty']) == 0){
                  data[i].Cancel = 0;
                  data[i].ServiceId = '';
                  data[i].Used = 0;
                  data[i].Available = 1;
                  data[i].Bucket = 1;
                  this.updatedWed = new Date();
                } else {
                  data[i].Used = Number(data[i].Used)-Number(msg['Qty']); 
                  data[i].Available = Number(msg['Qty'])+Number(data[i].Available);
                  this.updatedWed = new Date();
                }
              }
            }
          }
        }
        if (this.thursday.getFullYear()+'-'+(this.thursday.getMonth()+1).toString().padStart(2,'0')+'-'+this.thursday.getDate().toString().padStart(2,'0') == msg['DateAppo']){
          let numRows = this.timeHr.indexOf(time);
          let data = this.ThuHours.filter(x => x.Time24 >= Number(msg['Hour'].toString().replace('-','')));
          if (numRows > 0){
            for (let i=0; i <= numRows-1; i++){
              if (data.length > 0){
                if (Number(data[i].Used)-Number(msg['Qty']) == 0){
                  data[i].Cancel = 0;
                  data[i].ServiceId = '';
                  data[i].Used = 0;
                  data[i].Available = 1;
                  data[i].Bucket = 1;
                  this.updatedThu = new Date();
                } else {
                  data[i].Used = Number(data[i].Used)-Number(msg['Qty']); 
                  data[i].Available = Number(msg['Qty'])+Number(data[i].Available);
                  this.updatedThu = new Date();
                }
              }
            }
          }
        }
        if (this.friday.getFullYear()+'-'+(this.friday.getMonth()+1).toString().padStart(2,'0')+'-'+this.friday.getDate().toString().padStart(2,'0') == msg['DateAppo']){
          let numRows = this.timeHr.indexOf(time);
          let data = this.FriHours.filter(x => x.Time24 >= Number(msg['Hour'].toString().replace('-','')));

          if (numRows > 0){
            for (let i=0; i <= numRows-1; i++){
              if (data.length > 0){
                if (Number(data[i].Used)-Number(msg['Qty']) == 0){
                  data[i].Cancel = 0;
                  data[i].ServiceId = '';
                  data[i].Used = 0;
                  data[i].Available = 1;
                  data[i].Bucket = 1;
                  this.updatedFri = new Date();
                } else {
                  data[i].Used = Number(data[i].Used)-Number(msg['Qty']); 
                  data[i].Available = Number(msg['Qty'])+Number(data[i].Available);
                  this.updatedFri = new Date();
                }
              }
            }
          }
        }
        if (this.saturday.getFullYear()+'-'+(this.saturday.getMonth()+1).toString().padStart(2,'0')+'-'+this.saturday.getDate().toString().padStart(2,'0') == msg['DateAppo']){
          let numRows = this.timeHr.indexOf(time);
          let data = this.SatHours.filter(x => x.Time24 >= Number(msg['Hour'].toString().replace('-','')));

          if (numRows > 0){
            for (let i=0; i <= numRows-1; i++){
              if (data.length > 0){
                if (Number(data[i].Used)-Number(msg['Qty']) == 0){
                  data[i].Cancel = 0;
                  data[i].ServiceId = '';
                  data[i].Used = 0;
                  data[i].Available = 1;
                  data[i].Bucket = 1;
                  this.updatedSat = new Date();
                } else {
                  data[i].Used = Number(data[i].Used)-Number(msg['Qty']); 
                  data[i].Available = Number(msg['Qty'])+Number(data[i].Available);
                  this.updatedSat = new Date();
                }
              }
            }
          }
        }
        if (this.sunday.getFullYear()+'-'+(this.sunday.getMonth()+1).toString().padStart(2,'0')+'-'+this.sunday.getDate().toString().padStart(2,'0') == msg['DateAppo']){
          let numRows = this.timeHr.indexOf(time);
          let data = this.SunHours.filter(x => x.Time24 >= Number(msg['Hour'].toString().replace('-','')));

          if (numRows > 0){
            for (let i=0; i <= numRows-1; i++){
              if (data.length > 0){
                if (Number(data[i].Used)-Number(msg['Qty']) == 0){
                  data[i].Cancel = 0;
                  data[i].ServiceId = '';
                  data[i].Used = 0;
                  data[i].Available = 1;
                  data[i].Bucket = 1;
                  this.updatedSun = new Date();
                } else {
                  data[i].Used = Number(data[i].Used)-Number(msg['Qty']); 
                  data[i].Available = Number(msg['Qty'])+Number(data[i].Available);
                  this.updatedSun = new Date();
                }
              }
            }
          }
        }
      }
    }
    if (msg['Tipo'] == 'AVAILABLE'){
      if (msg['BusinessId'] == this.businessId && msg['LocationId'] == this.locationId  && msg['ProviderId'] == this.providerId){
        let time24Hr = Number(msg['Hour'].toString().replace('-',''));
        let available = (Number(msg['Available']) == 1 ? 0 : 1);
        let used = (Number(msg['Available']));
        if (this.monday.getFullYear()+'-'+(this.monday.getMonth()+1).toString().padStart(2,'0')+'-'+this.monday.getDate().toString().padStart(2,'0') == msg['DateAppo']){
          let data = this.MonHours.filter(x => x.Time24 == Number(msg['Hour'].toString().replace('-','')));
          if (data.length > 0) {
            data[0].Cancel = available;
            data[0].ServiceId = '';
            data[0].Used = 0;
            data[0].Available = used;
            data[0].Bucket = used;
          } else {
            this.MonHours.push({Time: (time24Hr <= 1245 ? time24Hr.toString().padStart(4, '0').substring(0,2) : (time24Hr-1200).toString().padStart(4,'0').substring(0,2)) + ':' + (time24Hr.toString().padStart(4,'0').substring(2,4)) + (time24Hr < 1200 ? ' AM' : ' PM'), Time24: time24Hr, Bucket: 1, Available: 1, ServiceId: '', Used: 0, Cancel: 0});
          }
          this.updatedMon = new Date();
          this.MonHours.sort((a, b) => (a.Time24 < b.Time24 ? -1 : 1));
        }
        if (this.tuesday.getFullYear()+'-'+(this.tuesday.getMonth()+1).toString().padStart(2,'0')+'-'+this.tuesday.getDate().toString().padStart(2,'0') == msg['DateAppo']){
          let data = this.TueHours.filter(x => x.Time24 == Number(msg['Hour'].toString().replace('-','')));
          if (data.length > 0) {
            data[0].Cancel = available;
            data[0].ServiceId = '';
            data[0].Used = 0;
            data[0].Available = used;
            data[0].Bucket = used;
          } else {
            this.TueHours.push({Time: (time24Hr <= 1245 ? time24Hr.toString().padStart(4, '0').substring(0,2) : (time24Hr-1200).toString().padStart(4,'0').substring(0,2)) + ':' + (time24Hr.toString().padStart(4,'0').substring(2,4)) + (time24Hr < 1200 ? ' AM' : ' PM'), Time24: time24Hr, Bucket: 1, Available: 1, ServiceId: '', Used: 0, Cancel: 0});
          }
          this.updatedTue = new Date();
          this.TueHours.sort((a, b) => (a.Time24 < b.Time24 ? -1 : 1));
        }
        if (this.wednesday.getFullYear()+'-'+(this.wednesday.getMonth()+1).toString().padStart(2,'0')+'-'+this.wednesday.getDate().toString().padStart(2,'0') == msg['DateAppo']){
          let data = this.WedHours.filter(x => x.Time24 == Number(msg['Hour'].toString().replace('-','')));
          if (data.length > 0) {
            data[0].Cancel = available;
            data[0].ServiceId = '';
            data[0].Used = 0;
            data[0].Available = used;
            data[0].Bucket = used;
          } else {
            this.WedHours.push({Time: (time24Hr <= 1245 ? time24Hr.toString().padStart(4, '0').substring(0,2) : (time24Hr-1200).toString().padStart(4,'0').substring(0,2)) + ':' + (time24Hr.toString().padStart(4,'0').substring(2,4)) + (time24Hr < 1200 ? ' AM' : ' PM'), Time24: time24Hr, Bucket: 1, Available: 1, ServiceId: '', Used: 0, Cancel: 0});
          }
          this.updatedWed = new Date();
          this.WedHours.sort((a, b) => (a.Time24 < b.Time24 ? -1 : 1));
        }
        if (this.thursday.getFullYear()+'-'+(this.thursday.getMonth()+1).toString().padStart(2,'0')+'-'+this.thursday.getDate().toString().padStart(2,'0') == msg['DateAppo']){
          let data = this.ThuHours.filter(x => x.Time24 == Number(msg['Hour'].toString().replace('-','')));
          if (data.length > 0) {
            data[0].Cancel = available;
            data[0].ServiceId = '';
            data[0].Used = 0;
            data[0].Available = used;
            data[0].Bucket = used;
          } else {
            this.ThuHours.push({Time: (time24Hr <= 1245 ? time24Hr.toString().padStart(4, '0').substring(0,2) : (time24Hr-1200).toString().padStart(4,'0').substring(0,2)) + ':' + (time24Hr.toString().padStart(4,'0').substring(2,4)) + (time24Hr < 1200 ? ' AM' : ' PM'), Time24: time24Hr, Bucket: 1, Available: 1, ServiceId: '', Used: 0, Cancel: 0});
          }
          this.updatedThu = new Date();
          this.ThuHours.sort((a, b) => (a.Time24 < b.Time24 ? -1 : 1));
        }
        if (this.friday.getFullYear()+'-'+(this.friday.getMonth()+1).toString().padStart(2,'0')+'-'+this.friday.getDate().toString().padStart(2,'0') == msg['DateAppo']){
          let data = this.FriHours.filter(x => x.Time24 == Number(msg['Hour'].toString().replace('-','')));
          if (data.length > 0) {
            data[0].Cancel = available;
            data[0].ServiceId = '';
            data[0].Used = 0;
            data[0].Available = used;
            data[0].Bucket = used;
          } else {
            this.FriHours.push({Time: (time24Hr <= 1245 ? time24Hr.toString().padStart(4, '0').substring(0,2) : (time24Hr-1200).toString().padStart(4,'0').substring(0,2)) + ':' + (time24Hr.toString().padStart(4,'0').substring(2,4)) + (time24Hr < 1200 ? ' AM' : ' PM'), Time24: time24Hr, Bucket: 1, Available: 1, ServiceId: '', Used: 0, Cancel: 0});
          }
          this.updatedFri = new Date();
          this.FriHours.sort((a, b) => (a.Time24 < b.Time24 ? -1 : 1));
        }
        if (this.saturday.getFullYear()+'-'+(this.saturday.getMonth()+1).toString().padStart(2,'0')+'-'+this.saturday.getDate().toString().padStart(2,'0') == msg['DateAppo']){
          let data = this.SatHours.filter(x => x.Time24 == Number(msg['Hour'].toString().replace('-','')));
          if (data.length > 0) {
            data[0].Cancel = available;
            data[0].ServiceId = '';
            data[0].Used = 0;
            data[0].Available = used;
            data[0].Bucket = used;
          } else {
            this.SatHours.push({Time: (time24Hr <= 1245 ? time24Hr.toString().padStart(4, '0').substring(0,2) : (time24Hr-1200).toString().padStart(4,'0').substring(0,2)) + ':' + (time24Hr.toString().padStart(4,'0').substring(2,4)) + (time24Hr < 1200 ? ' AM' : ' PM'), Time24: time24Hr, Bucket: 1, Available: 1, ServiceId: '', Used: 0, Cancel: 0});
          }
          this.updatedSat = new Date();
          this.SatHours.sort((a, b) => (a.Time24 < b.Time24 ? -1 : 1));
        }
        if (this.sunday.getFullYear()+'-'+(this.sunday.getMonth()+1).toString().padStart(2,'0')+'-'+this.sunday.getDate().toString().padStart(2,'0') == msg['DateAppo']){
          let data = this.SunHours.filter(x => x.Time24 == Number(msg['Hour'].toString().replace('-','')));
          if (data.length > 0) {
            data[0].Cancel = available;
            data[0].ServiceId = '';
            data[0].Used = 0;
            data[0].Available = used;
            data[0].Bucket = used;
          } else {
            this.SunHours.push({Time: (time24Hr <= 1245 ? time24Hr.toString().padStart(4, '0').substring(0,2) : (time24Hr-1200).toString().padStart(4,'0').substring(0,2)) + ':' + (time24Hr.toString().padStart(4,'0').substring(2,4)) + (time24Hr < 1200 ? ' AM' : ' PM'), Time24: time24Hr, Bucket: 1, Available: 1, ServiceId: '', Used: 0, Cancel: 0});
          }
          this.updatedSun = new Date();
          this.SunHours.sort((a, b) => (a.Time24 < b.Time24 ? -1 : 1));
        }
      }
    }

  }

  ngOnInit(): void {
    this.businessId = this.authService.businessId();
    var spinnerRef = this.spinnerService.start($localize`:@@sche.loadingsche:`);

    this.services$ = this.serviceService.getServicesColor(this.businessId).pipe(
      map((res: any) => {
        this.resServices = res;
        return res;
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        return err;
      })
    );
    this.locationData$ = this.locationService.getLocationsHost(this.businessId).pipe(
      map((res: any) => {
        if (res.Code == 200){
          if (res.Locs.length > 0){
            this.locations = res.Locs.sort((a, b) => (a.Name < b.Name ? -1 : 1));
            this.locationId = this.locations[0].LocationId;
            this.doors = this.locations[0].Doors;
            this.TimeZone = this.locations[0].TimeZone;
            this.locations.forEach(x => x.Providers.sort((a, b) => (a.Name < b.Name ? -1 : 1)));

            if (this.locations[0].Providers.length > 0){
              this.locationData = this.locations[0].Providers[0].ProviderId;
              this.providerId = this.locations[0].Providers[0].ProviderId.split('#')[1];
            }

            let yearCurr = this.getYear();
            let monthCurr = this.getMonth();
            let dayCurr = this.getDay();

            this.today = new Date(+yearCurr, +monthCurr-1, +dayCurr);
            var startDay = 1;
            var d = this.today.getDay();

            this.weekStart = new Date(this.today.valueOf() - (d<=0 ? 7-startDay:d-startDay)*86400000);
            this.weekEnd = new Date(this.weekStart.valueOf() + 6*86400000);
            this.currTime = this.getActTime().replace(':','');

            this.monday = this.weekStart;
            this.tuesday = this.addDays(this.weekStart, 1);
            this.wednesday = this.addDays(this.weekStart, 2);
            this.thursday = this.addDays(this.weekStart, 3);
            this.friday = this.addDays(this.weekStart, 4);
            this.saturday = this.addDays(this.weekStart, 5);
            this.sunday = this.addDays(this.weekStart, 6);

            this.loadHours();
          }
          this.spinnerService.stop(spinnerRef);
          return res.Locs;
        }
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        return err;
      })
    )
  }

  loadHours(){
    this.hours = [];
    this.MonHours = [];
    this.TueHours = [];
    this.WedHours = [];
    this.ThuHours = [];
    this.FriHours = [];
    this.SatHours = [];
    this.SunHours = [];
    var spinnerRef = this.spinnerService.start($localize`:@@sche.loadingsche:`);
    this.operationHours$ = this.appointmentService.getOperationHours(this.businessId, this.locationId, this.providerId, this.datepipe.transform(this.monday, 'yyyy-MM-dd')).pipe(
      map((res: any) => {
        if (res.Code == 200){
          this.hours = res.Hours;
          this.MonHours = res.Monday;
          this.TueHours = res.Tuesday;
          this.WedHours = res.Wednesday;
          this.ThuHours = res.Thursday;
          this.FriHours = res.Friday;
          this.SatHours = res.Saturday;
          this.SunHours = res.Sunday;
          
          let entroMon = 0;
          this.MonHours.sort((a, b) => (a.Time24 < b.Time24 ? -1 : 1))
          if (this.MonHours.length > 0){
            this.minHr = this.MonHours[0].Time24;
            this.maxHr = this.MonHours[this.MonHours.length-1].Time24;
            entroMon = 1;
          }
          let entroTue = 0;
          this.TueHours.sort((a, b) => (a.Time24 < b.Time24 ? -1 : 1))
          if (this.TueHours.length > 0){
            if (entroMon == 1){
              this.minHr = (this.TueHours[0].Time24 < this.minHr ? this.TueHours[0].Time24 : this.minHr);
              this.maxHr = (this.TueHours[this.TueHours.length-1].Time24 > this.maxHr ? this.TueHours[this.TueHours.length-1].Time24 : this.maxHr);
            } else {
              this.minHr = this.TueHours[0].Time24;
              this.maxHr = this.TueHours[this.TueHours.length-1].Time24;
            }
            entroTue = 1;
          }
          let entroWed = 0;
          this.WedHours.sort((a, b) => (a.Time24 < b.Time24 ? -1 : 1))
          if (this.WedHours.length > 0){
            if (entroTue == 1){
              this.minHr = (this.WedHours[0].Time24 < this.minHr ? this.WedHours[0].Time24 : this.minHr);
              this.maxHr = (this.WedHours[this.WedHours.length-1].Time24 > this.maxHr ? this.WedHours[this.WedHours.length-1].Time24 : this.maxHr);
            } else {
              this.minHr = this.WedHours[0].Time24;
              this.maxHr = this.WedHours[this.WedHours.length-1].Time24;
            }
            entroWed = 1;
          }
          let entroThu = 0;
          this.ThuHours.sort((a, b) => (a.Time24 < b.Time24 ? -1 : 1))
          if (this.ThuHours.length > 0){
            if (entroWed == 1){
              this.minHr = (this.ThuHours[0].Time24 < this.minHr ? this.ThuHours[0].Time24 : this.minHr);
              this.maxHr = (this.ThuHours[this.ThuHours.length-1].Time24 > this.maxHr ? this.ThuHours[this.ThuHours.length-1].Time24 : this.maxHr);
            } else{
              this.minHr = this.ThuHours[0].Time24;
              this.maxHr = this.ThuHours[this.ThuHours.length-1].Time24;
            }
            entroThu = 1;
          }
          let entroFri = 0;
          this.FriHours.sort((a, b) => (a.Time24 < b.Time24 ? -1 : 1))
          if (this.FriHours.length > 0){
            if (entroThu == 1){
              this.minHr = (this.FriHours[0].Time24 < this.minHr ? this.FriHours[0].Time24 : this.minHr);
              this.maxHr = (this.FriHours[this.FriHours.length-1].Time24 > this.maxHr ? this.FriHours[this.FriHours.length-1].Time24 : this.maxHr);
            } else {
              this.minHr = this.FriHours[0].Time24;
              this.maxHr = this.FriHours[this.FriHours.length-1].Time24;
            }
            entroFri = 1;
          }
          let entroSat = 0;
          this.SatHours.sort((a, b) => (a.Time24 < b.Time24 ? -1 : 1))
          if (this.SatHours.length > 0){
            if (entroFri == 1){
              this.minHr = (this.SatHours[0].Time24 < this.minHr ? this.SatHours[0].Time24 : this.minHr);
              this.maxHr = (this.SatHours[this.SatHours.length-1].Time24 > this.maxHr ? this.SatHours[this.SatHours.length-1].Time24 : this.maxHr);
            } else {
              this.minHr = this.SatHours[0].Time24;
              this.maxHr = this.SatHours[this.SatHours.length-1].Time24;
            }
            entroSat = 1;
          }
          this.SunHours.sort((a, b) => (a.Time24 < b.Time24 ? -1 : 1))
          if (this.SunHours.length > 0){
            if (entroSat == 1){
              this.minHr = (this.SunHours[0].Time24 < this.minHr ? this.SunHours[0].Time24 : this.minHr);
              this.maxHr = (this.SunHours[this.SunHours.length-1].Time24 > this.maxHr ? this.SunHours[this.SunHours.length-1].Time24 : this.maxHr);
            } else {
              this.minHr = this.SunHours[0].Time24;
              this.maxHr = this.SunHours[this.SunHours.length-1].Time24;
            }
          }
          
          this.minHr00 = +(this.minHr.toString().padStart(4,'0').substring(0,2)+'00');
          this.maxHr00 = +(this.maxHr.toString().padStart(4,'0').substring(0,2)+'00');

          this.minHr45 = +(this.minHr.toString().padStart(4,'0').substring(0,2)+'45');
          this.maxHr45 = +(this.maxHr.toString().padStart(4,'0').substring(0,2)+'45');

          this.minHr = +(this.minHr.toString().padStart(4,'0').substring(0,2)+'30');
          this.maxHr = +(this.maxHr.toString().padStart(4,'0').substring(0,2)+'30');
          
          this.MonHours.sort((a, b) => (a.Time24 < b.Time24 ? -1 : 1))
          this.TueHours.sort((a, b) => (a.Time24 < b.Time24 ? -1 : 1))
          this.WedHours.sort((a, b) => (a.Time24 < b.Time24 ? -1 : 1))
          this.ThuHours.sort((a, b) => (a.Time24 < b.Time24 ? -1 : 1))
          this.FriHours.sort((a, b) => (a.Time24 < b.Time24 ? -1 : 1))
          this.SatHours.sort((a, b) => (a.Time24 < b.Time24 ? -1 : 1))
          this.SunHours.sort((a, b) => (a.Time24 < b.Time24 ? -1 : 1))
          this.spinnerService.stop(spinnerRef);
          return res;
        }
      }), 
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        return err;
      })
    )
  }

  addDays(date, days) {
    const copy = new Date(Number(date))
    copy.setDate(date.getDate() + days)
    return copy
  }

  getDayData(timeGrl: string, dayNum: number): any{
    let result;
    let value = {};
    switch (dayNum){
      case 1: 
        result = this.MonHours.filter(val => val.Time == timeGrl);
        break;
      case 2: 
        result = this.TueHours.filter(val => val.Time == timeGrl);
        break;
      case 3: 
        result = this.WedHours.filter(val => val.Time == timeGrl);
        break;
      case 4: 
        result = this.ThuHours.filter(val => val.Time == timeGrl);
        break;
      case 5: 
        result = this.FriHours.filter(val => val.Time == timeGrl);
        break;
      case 6: 
        result = this.SatHours.filter(val => val.Time == timeGrl);
        break;
      case 7: 
        result = this.SunHours.filter(val => val.Time == timeGrl);
        break;
      default: 
        break;
    }
    if (result.length > 0 && result != undefined){
      value = result[0];
    }
    return value;
  }

  getDayInfo(dayNum: number): any{
    let result;
    switch (dayNum){
      case 1: 
        result = this.MonHours;
        break;
      case 2: 
        result = this.TueHours;
        break;
      case 3: 
        result = this.WedHours;
        break;
      case 4: 
        result = this.ThuHours;
        break;
      case 5: 
        result = this.FriHours;
        break;
      case 6: 
        result = this.SatHours;
        break;
      case 7: 
        result = this.SunHours;
        break;
      default: 
        break;
    }
    return result;
  }

  nextWeek(){
    let todNext = new Date();
    todNext = this.addDays(this.monday, 7);

    var startDay = 1;
    var d = todNext.getDay();
    this.weekStart = new Date(todNext.valueOf() - (d<=0 ? 7-startDay:d-startDay)*86400000);
    this.weekEnd = new Date(this.weekStart.valueOf() + 6*86400000);

    this.monday = this.weekStart;
    this.tuesday = this.addDays(this.weekStart, 1);
    this.wednesday = this.addDays(this.weekStart, 2);
    this.thursday = this.addDays(this.weekStart, 3);
    this.friday = this.addDays(this.weekStart, 4);
    this.saturday = this.addDays(this.weekStart, 5);
    this.sunday = this.addDays(this.weekStart, 6);

    this.currWeek = 0;
    this.loadHours();
  }

  prevWeek(){
    if (this.currWeek == 1) {return;}
    let todNext = new Date();
    todNext = this.addDays(this.monday, -7);

    var startDay = 1;
    var d = todNext.getDay();
    this.weekStart = new Date(todNext.valueOf() - (d<=0 ? 7-startDay:d-startDay)*86400000);
    this.weekEnd = new Date(this.weekStart.valueOf() + 6*86400000);

    this.monday = this.weekStart;
    this.tuesday = this.addDays(this.weekStart, 1);
    this.wednesday = this.addDays(this.weekStart, 2);
    this.thursday = this.addDays(this.weekStart, 3);
    this.friday = this.addDays(this.weekStart, 4);
    this.saturday = this.addDays(this.weekStart, 5);
    this.sunday = this.addDays(this.weekStart, 6);

    if (this.today >= this.monday && this.today <= this.sunday){
      this.currWeek = 1;
    } else {
      this.currWeek = 0;
    }
    this.loadHours();
  }

  newAppo(timeGrl: string, day: Date, dayNum: number){
    let result = this.getDayData(timeGrl, dayNum);
    let dayInfo = this.getDayInfo(dayNum);
    if (result == {}) { return; }
    if (result.Available == 0) { return; }

    let timeAppo = (result.Time.substring(6,8) == 'PM' ? (+result.Time.substring(0,2) == 12 ? result.Time.substring(0,5).replace(':','-') : (+result.Time.substring(0,2)+12).toString()+'-'+result.Time.substring(3,5)) : result.Time.substring(0,5).replace(':','-'));
    var spinnerRef = this.spinnerService.start($localize`:@@sche.loadingsche:`);
    this.validBusiness$ = this.businessService.getValidBusiness(this.businessId, this.locationId, this.providerId, (result.ServiceId == "" ? "_" : result.ServiceId), this.datepipe.transform(day, 'yyyy-MM-dd'), timeAppo).pipe(    
      map((res: any) => {
        if (res.Code == 200){
          this.spinnerService.stop(spinnerRef);
          const dialogRef = this.dialog.open(AppoDialogComponent, {
            width: '450px',
            height: '700px',
            data: {businessId: this.businessId, locationId: this.locationId, providerId: this.providerId, serviceId: result.ServiceId, appoTime: timeGrl, appoDate: this.datepipe.transform(day, 'yyyy-MM-dd'), doors: this.doors.split(','), dayData: dayInfo}
          });
        }
        if (res.Code == 404){
          this.spinnerService.stop(spinnerRef);
          this.openSnackBar($localize`:@@host.companydisabled:`,$localize`:@@shared.error:`);
        }
        if (res.Code == 400){
          this.spinnerService.stop(spinnerRef);
          this.openSnackBar($localize`:@@host.noappos:`,$localize`:@@shared.error:`);
        }
        if (res.Code == 500){
          this.spinnerService.stop(spinnerRef);
          this.openSnackBar($localize`:@@host.invalidTime:`,$localize`:@@shared.error:`);
        }
        return res;
      }), 
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        return err;
      })
    );
  }

  onSelectLocation(event){
    this.locationData = event.value;
    this.locationId = event.value.split('#')[0];
    this.providerId = event.value.split('#')[1];

    let search = this.locations.filter(x => x.LocationId == this.locationId);
    this.doors = search[0].Doors;
    this.TimeZone = search[0].TimeZone;

    // let yearCurr = this.getYear();
    // let monthCurr = this.getMonth();
    // let dayCurr = this.getDay();

    // this.today = new Date(+yearCurr, +monthCurr-1, +dayCurr);
    // var startDay = 1;
    // var d = this.today.getDay();

    // this.weekStart = new Date(this.today.valueOf() - (d<=0 ? 7-startDay:d-startDay)*86400000);
    // this.weekEnd = new Date(this.weekStart.valueOf() + 6*86400000);
    this.currTime = this.getActTime().replace(':','');

    this.monday = this.weekStart;
    this.tuesday = this.addDays(this.weekStart, 1);
    this.wednesday = this.addDays(this.weekStart, 2);
    this.thursday = this.addDays(this.weekStart, 3);
    this.friday = this.addDays(this.weekStart, 4);
    this.saturday = this.addDays(this.weekStart, 5);
    this.sunday = this.addDays(this.weekStart, 6);
    this.loadHours();
  }
  
  cancelTime(timeGrl: string, day: any){
    this.displayYesNo = true;
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      header: $localize`:@@sche.citastext:`, 
      message: $localize`:@@sche.deletetext:`, 
      success: false, 
      error: false, 
      warn: false,
      ask: this.displayYesNo,
      businessId : this.businessId,
      locationId: this.locationId,
      providerId: this.providerId,
      dateAppo: this.datepipe.transform(day, 'yyyy-MM-dd') + '-' + timeGrl.toString().padStart(4,'0').substring(0,2) + '-' + timeGrl.toString().padStart(4,'0').substring(2,4),
      lan: this.authService.businessLanguage()
    };
    dialogConfig.width ='280px';
    dialogConfig.minWidth = '280px';
    dialogConfig.maxWidth = '280px';

    const dialogRef = this.dialog.open(DialogcancelComponent, dialogConfig);
  }

  expandTime(timeGrl: string, day: any, timeNom: string, dayNum: number){
    let result = this.getDayData(timeNom, dayNum);
    if (result == {}) { return; }
    let res = this.resServices.filter(x => x.ServiceId == result.ServiceId);
    let nameService = '';
    if (res.length > 0){
      nameService = res[0].Name;
    }
    const dialogRef = this.dialog.open(ShowappoDialogComponent, {
      width: '450px',
      height: '700px',
      data: {businessId: this.businessId, locationId: this.locationId, providerId: this.providerId, service: nameService, appoTime: timeGrl, appoDate: this.datepipe.transform(day, 'yyyy-MM-dd')}
    });
  }

  ngOnDestroy() {
    if (this.subsMessages){
      this.subsMessages.unsubscribe();
    }
  }

  enableHour(timeGrl: string, day: any, timeNom: string, dayNum: number){
    var spinnerRef = this.spinnerService.start($localize`:@@sche.openhour:`);
    this.putAppo$ = this.appointmentService.putTimeAvailable(this.businessId, this.locationId, this.providerId, this.datepipe.transform(day, 'yyyy-MM-dd') + '-' + timeGrl.toString().padStart(4,'0').substring(0,2) + '-' + timeGrl.toString().padStart(4,'0').substring(2,4)).pipe(
      map((res: any) => {
        if (res != null) {
          if (res.Code == 200){
            // this.openDialog($localize`:@@sche.citastext:`, $localize`:@@sche.openhoursuccess:`, true, false, false);
            this.openSnackBar($localize`:@@sche.openhoursuccess:`, $localize`:@@sche.citastext:`);
            this.spinnerService.stop(spinnerRef);
            // this.loadHours();
          }
        }
      })
    );
  }

  getActTime(): string{
    let options = {
      timeZone: this.TimeZone,
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    },
    formatter = new Intl.DateTimeFormat([], options);
    // var actual = formatter.format(new Date());
    var v = new Date();
    var actual = formatter.format(v.setMinutes(v.getMinutes()-14));
    var hour: string = (+actual.substring(0,2) == 24 ? '00' : (+actual.substring(0,2)).toString().padStart(2, '0'));
    var min: string = actual.substring(3,5).padStart(2,'0');
    return hour+':'+min;
  }

  getYear(): string{
    let options = {
      timeZone: this.TimeZone,
      year: 'numeric'
    },
    formatter = new Intl.DateTimeFormat([], options);
    var actual = formatter.format(new Date());
    return actual;
  }

  getMonth(): string{
    let options = {
      timeZone: this.TimeZone,
      month: 'numeric'
    },
    formatter = new Intl.DateTimeFormat([], options);
    var actual = formatter.format(new Date());
    return actual.padStart(2,'0');
  }

  getDay(): string{
    let options = {
      timeZone: this.TimeZone,
      day: 'numeric'
    },
    formatter = new Intl.DateTimeFormat([], options);
    var actual = formatter.format(new Date());
    return actual.padStart(2,'0');
  }

  learnMore(textNumber: number){
    let message = '';
    switch(textNumber) { 
      case 35: { 
        message = $localize`:@@learnMore.LMCON35:`;
        break; 
      }
      default: { 
        message = ''; 
        break; 
      } 
    } 
    this.openLearnMore(message);
  }
}
