import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '@app/core/services';
import { LocationService, BusinessService, AdminService } from '@app/services';
import { map, catchError, mergeMap, switchMap } from 'rxjs/operators';
import { SpinnerService } from '@app/shared/spinner.service';
import { AppointmentService } from '@app/services/appointment.service';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from '@app/shared/dialog/dialog.component';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';

// import * as am4core from "@amcharts/amcharts4/core";
// import * as am4charts from "@amcharts/amcharts4/charts";
// import am4themes_animated from "@amcharts/amcharts4/themes/animated";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  quantityPeople$: Observable<any>;
  appos$: Observable<any>;
  avgData$: Observable<any[]>;
  soft$: Observable<any>;
  payment$: Observable<any>;
  paymentSave$: Observable<any>;
  customerId$: Observable<any>;

  orders: any[]=[];
  customerId: string = '';
  businessId: string = '';
  onError: string = '';
  locationId: string = '';
  selectedSer: string = '';
  services: []=[];
  doorId: string = '';
  userId: string = '';
  isAdmin: number = 0;
  email: string = '';
  language: string = '';
  selectedLoc: string = '';
  contentHash: string = '';
  merchantKey: string = '';
  siteId: string = '';
  resultLoc: any[] =[];
  perLocation: number = 0;
  quantity: number = 0;

  series: any[];
  // options
  showXAxis: boolean = true;
  showYAxis: boolean = true;
  gradient: boolean = true;
  showLegend: boolean = false;
  showXAxisLabel: boolean = false;
  xAxisLabel: string = ''; //Current Month
  showYAxisLabel: boolean = false;
  yAxisLabel: string = ''; //Average cita
  legendTitle: string = ''; //Locations
  displayYesNo: boolean = false;

  orderId: string = '';
  ccData: any[]=[];
  ccName: string = '';
  ccNumber: string = '';
  cvv: string;
  ccMonth: number;
  ccYear: number;
  today: Date = new Date();
  numMonths = ['01','02','03','04','05','06','07','08','09','10','11','12'];
  numYears =[];

  displayedColumns = ['id', 'date_created', 'status', 'total'];
  ccNumberData: string = '';
  ccNameData: string = '';
  ccToken: string = '';

  dispForm: boolean =false;

  tabSelected = 0;

  colorScheme = {
    domain: ['#FF4F00']
  };

  constructor(
    private authService: AuthService,
    private locationService: LocationService,
    private businessService: BusinessService,
    private appointmentService: AppointmentService,
    private datePipe: DatePipe,
    private dialog: MatDialog,
    private adminService: AdminService,
    private router: Router,
    private spinnerService: SpinnerService
  ) {
    this.language = this.authService.language().toLowerCase();
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
    var spinnerRef = this.spinnerService.start($localize`:@@dashboard.loading:`);
    this.businessId = this.authService.businessId();
    this.email = this.authService.email();
    this.isAdmin = this.authService.isAdmin();
    this.userId = this.authService.userId();
    this.businessService.setSession(Math.floor(Math.random() * 999999) + 900001);
    this.siteId = environment.siteId;
    this.merchantKey = environment.merchantKey;
    this.numYears = Array(10).fill(10).map((_, i) => i+this.today.getFullYear());

    let initDate = '';
    let yearCurr = this.getYear();
    let monthCurr = this.getMonth();
    let dayCurr = this.getDay();
    initDate = yearCurr+'-'+monthCurr+'-'+dayCurr;
    let result = [];
    for (let i=1; i<=+dayCurr; i++){
      let data = {
        name: i,
        series: []
      }
      result.push(data);
    }

    this.appos$ = this.businessService.getBusinessAppos(this.businessId).pipe(
      map((res: any) => {
        if (res != null){
          this.orderId = res.Order;
          return res;
        }
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        this.onError = err.Message;
        return err;
      })
    );

    if (this.isAdmin == 0){
      this.quantityPeople$ = this.appointmentService.getHostLocations(this.businessId, this.userId).pipe(
        map((res: any) => {
          if (res.Code == 200 && res.Locs.length > 0){
            this.locationId = res.Locs[0].LocationId;
            this.doorId = res.Locs[0].Door;
            return 0;
          }
        }),
        mergeMap(x => this.locationService.getLocationQuantityAll(this.businessId, this.locationId).pipe(
          map((res: any) => {
            if (res != null){
              this.resultLoc = res.Data.Locs.sort((a, b) => (a.Name < b.Name ? -1 : 1));
              this.resultLoc.forEach(x => x.Services.sort((a, b) => (a.Name < b.Name ? -1 : 1)));
              if (this.resultLoc.length > 0){
                this.selectedLoc = this.resultLoc[0].LocationId + '#' + this.resultLoc[0].Services[0].ProviderId;
                this.perLocation = this.resultLoc[0].Services[0].PerLocation;
                this.selectedSer = this.resultLoc[0].Services[0].ProviderId;
                this.quantity = this.resultLoc[0].Services[0].Quantity;
              }
              this.spinnerService.stop(spinnerRef);
              return res;
            }
          })
        )),
        switchMap(_ => 
          this.appointmentService.getApposAverage(this.selectedLoc.replace('LOC#','').split('#')[0], this.selectedSer, initDate).pipe(
            map((res: any) => {
              if (res != null){
                let content = [];
                res.Data.forEach(item => {
                  let line = {
                    name: item.DateAppo.substring(8,10),
                    value: item.Average
                  }
                  content.push(line);
                });
                this.series = content;

                Object.assign(this, this.series);
                return res;
              }
            })
          )
        ),
        catchError(err => {
          this.spinnerService.stop(spinnerRef);
          this.onError = err.Message;
          return '0';
        })
      );
    } else {
      this.locationId = '_';
      this.quantityPeople$ = this.locationService.getLocationQuantityAll(this.businessId, this.locationId).pipe(
        map((res: any) => {
          if (res != null){
            this.resultLoc = res.Data.sort((a, b) => (a.Name < b.Name ? -1 : 1));
            this.resultLoc.forEach(x => x.Services.sort((a, b) => (a.Name < b.Name ? -1 : 1)));
            if (this.resultLoc.length > 0){
              this.selectedLoc = this.resultLoc[0].LocationId + '#' + this.resultLoc[0].Services[0].ProviderId;
              this.perLocation = this.resultLoc[0].Services[0].PerLocation;
              this.selectedSer = this.resultLoc[0].Services[0].ProviderId;
              this.quantity = this.resultLoc[0].Services[0].Quantity;
            }
            this.spinnerService.stop(spinnerRef);
            return res;
          }
        }),
        switchMap(_ => 
          this.appointmentService.getApposAverage(this.selectedLoc.replace('LOC#','').split('#')[0], this.selectedSer, initDate).pipe(
            map((res: any) => {
              if (res != null){
                let content = [];
                res.Data.forEach(item => {
                  let line = {
                    name: item.DateAppo.substring(8,10),
                    value: item.Average
                  }
                  content.push(line);
                });
                this.series = content;

                Object.assign(this, this.series);
                return res;
              }
            })
          )
        ),
        catchError(err => {
          this.spinnerService.stop(spinnerRef);
          this.onError = err.Message;
          return '0';
        })
      );
      
      this.payment$ = this.businessService.postHash(this.siteId + this.businessService.getSession().toString() +  this.businessId).pipe(
        map((res: any) => {
          if (res.Code == 200){
            this.contentHash = res.Hash;
          }
        }),
        switchMap(_ => 
          this.businessService.getAccounts(this.businessId, this.contentHash).pipe(
            map((res: any) => {
              this.ccData = res.Data;
              if (this.ccData.length > 0){
                let resCC = this.ccData.filter(x => x.IsDefault == true);
                if (resCC.length > 0){
                  this.ccNumberData = resCC[0].Account;
                  this.ccNameData = resCC[0].CustomerName;
                  this.ccToken = resCC[0].AccountToken;
                } else {
                  this.ccNumberData = this.ccData[0].Account;
                  this.ccNameData = this.ccData[0].CustomerName;
                  this.ccToken = this.ccData[0].AccountToken;
                }
              }
            })
          )
        ),
        catchError(err => {
          this.spinnerService.stop(spinnerRef);
          this.onError = err.Message;
          return '0';
        })
      );

      this.customerId$ = this.businessService.getId(this.email).pipe(
        map((res: any) => {
          this.customerId = res[0].id;
        }),
        switchMap (_ => 
          this.businessService.getOrders(this.customerId).pipe(
            map((res: any) => {
              this.orders = res;
            })
          )
        ),
        catchError(err => {
          this.spinnerService.stop(spinnerRef);
          this.onError = err.Message;
          return '0';
        })
      )
    }

    setInterval(() => { 
      if (this.locationId != ''){
        this.quantityPeople$ = this.locationService.getLocationQuantityAll(this.businessId, this.locationId).pipe(
          map((res: any) => {
            if (res != null){
              this.resultLoc = res.Data;
              if (this.resultLoc.length > 0){
                this.selectedLoc = this.resultLoc[0].LocationId + '#' + this.resultLoc[0].Services[0].ProviderId;
                this.perLocation = this.resultLoc[0].Services[0].PerLocation;
                this.selectedSer = this.resultLoc[0].Services[0].ProviderId;
                this.quantity = this.resultLoc[0].Services[0].Quantity;
              }
              return res;
            }
          }),
          catchError(err => {
            this.onError = err.Message;
            return '0';
          })
        );
      }
    }, 120000);
  }

  onSelectLocation(event){
    let value = event.source.value;
    let serSelected;
    let serLocation;
    let initDate = '';
    let yearCurr = this.getYear();
    let monthCurr = this.getMonth();
    let dayCurr = this.getDay();
    let locId = '';

    this.selectedLoc = value;
    locId = this.selectedLoc.replace('LOC#','').split('#')[0];
    serLocation = this.resultLoc.filter(x => x.LocationId.replace('LOC#','') == locId);
    serSelected = serLocation[0].Services.filter(x => x.ProviderId == this.selectedLoc.replace('LOC#','').split('#')[1]);
    initDate = yearCurr+'-'+monthCurr+'-'+dayCurr;    

    if (serSelected.length > 0){
      this.perLocation = serSelected[0].PerLocation;
      this.quantity = serSelected[0].Quantity;
      this.selectedSer = serSelected[0].ProviderId;
      this.avgData$ = this.appointmentService.getApposAverage(locId, this.selectedSer, initDate).pipe(
        map((res: any) => {
          if (res != null){
            let content = [];
            res.Data.forEach(item => {
              let line = {
                name: this.datePipe.transform(item.DateAppo, 'MMM dd'),
                value: (this.tabSelected == 1 ? item.Average : item.Qty)
              }
              content.push(line);
            });
            this.series = content;
            Object.assign(this, this.series);
            return res;
          }
        }),
        catchError(err => {
          this.onError = err.Message;
          return '0';
        })
      );
    } else {
      this.perLocation = 0;
      this.quantity = 0;
    }
  }

  changeGraph(event){
    let initDate = '';
    let yearCurr = this.getYear();
    let monthCurr = this.getMonth();
    let dayCurr = this.getDay();
    initDate = yearCurr+'-'+monthCurr+'-'+dayCurr;

    let type = event.index;
    this.tabSelected = type;
    this.avgData$ = this.appointmentService.getApposAverage(this.selectedLoc.replace('LOC#','').split('#')[0], this.selectedSer, initDate).pipe(
      map((res: any) => {
        if (res != null){
          let content = [];
          res.Data.forEach(item => {
            let line = {
              name: this.datePipe.transform(item.DateAppo, 'MMM dd'),
              value: (type == 1 ? item.Average : item.Qty)
            }
            content.push(line);
          });
          this.series = content;
          Object.assign(this, this.series);
          return res;
        }
      }),
      catchError(err => {
        this.onError = err.Message;
        return '0';
      })
    );
  }

  sumAdditional(packs: any) : number{
    return packs.reduce((sum, current) => sum + current.Appointments, 0);
  }

  sumUsed(packs: any, used: number): number{
    return packs.reduce((sum, current) => sum + current.Used, 0)+used;
  }

  sumAvailable(packs: any, available: number): number{
    return packs.reduce((sum, current) => sum + current.Available, 0)+available;
  }
  
  getExpire(packs: any): string{
    let sortPack;
    sortPack = packs.sort((a,b) => (+a.DueDate.replace('-','') > +b.DueDate.replace('-','')) ? 1 : ((+b.DueDate.replace('-','') > +a.DueDate.replace('-','')) ? -1 : 0));
    return sortPack[0].DueDate;
  }

  getExpireCitas(packs: any): number{
    let sortPack;
    sortPack = packs.sort((a,b) => (+a.DueDate.replace('-','') > +b.DueDate.replace('-','')) ? 1 : ((+b.DueDate.replace('-','') > +a.DueDate.replace('-','')) ? -1 : 0));
    return sortPack[0].Available;
  }

  addCitas(subs, type){
    if (this.language == 'en'){
      window.open("https://tucita247.com/direct-shopping/?email="+this.email+"&business_id="+this.businessId+"&subscription_type="+this.MD5(subs.toLowerCase())+"&type="+type, "_blank");
    } else {
      window.open("https://tucita247.com/es/compra-directa/?email="+this.email+"&business_id="+this.businessId+"&subscription_type="+this.MD5(subs.toLowerCase())+"&type="+type, "_blank");
    }
  }

  suspend(){
    if (this.businessId == '') {return;}
    this.displayYesNo = true;
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      header: $localize`:@@dashboard.cancel:`, 
      message: $localize`:@@dashboard.cancelmess:`, 
      success: false, 
      error: false, 
      warn: false,
      ask: this.displayYesNo
    };
    dialogConfig.width ='280px';
    dialogConfig.minWidth = '280px';
    dialogConfig.maxWidth = '280px';

    const dialogRef = this.dialog.open(DialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if(result != undefined){
        if (result){
          var spinnerRef = this.spinnerService.start($localize`:@@dashboard.processing:`);
          this.soft$ = this.adminService.putSuspend(this.businessId, '1', '1').pipe(
            map((res: any) => {
              if (res.Code == 200){
                this.spinnerService.stop(spinnerRef);
                this.authService.logout();
                this.router.navigate(['/login']);
              }
              return res;
            })
          );
        }
      }
    });
  }

  getYear(): string{
    let options = {
      timeZone: 'America/Puerto_Rico',
      year: 'numeric'
    } as const;
    let formatter = new Intl.DateTimeFormat([], options);
    var actual = formatter.format(new Date());
    return actual;
  }

  getMonth(): string{
    let options = {
      timeZone: 'America/Puerto_Rico',
      month: 'numeric'
    } as const;
    let formatter = new Intl.DateTimeFormat([], options);
    var actual = formatter.format(new Date());
    return actual.padStart(2,'0');
  }

  getDay(): string{
    let options = {
      timeZone: 'America/Puerto_Rico',
      day: 'numeric'
    } as const;
    let formatter = new Intl.DateTimeFormat([], options);
    var actual = formatter.format(new Date());
    return actual.padStart(2,'0');
  }

  update(){
    if (this.ccName == '' || this.ccNumber == '' || this.ccYear.toString() == '' || this.ccMonth.toString() == '' || this.cvv.toString() == '') {return;}
    var spinnerRef = this.spinnerService.start($localize`:@@dashboard.loading:`);
    this.paymentSave$ = this.businessService.postToken(this.contentHash, this.merchantKey, this.ccNumber, this.ccMonth, this.ccYear, this.ccName, this.businessId, this.authService.email()).pipe(
      map((res: any) => {
        if (res.AccountToken != '' && res.State == 'Validated'){
          this.ccToken = res.AccountToken;
        }
      }),
      switchMap(_ => 
        this.businessService.updAccount(this.orderId, this.ccToken).pipe(
          map((res: any) => {
            this.spinnerService.stop(spinnerRef);
            return res.id;
          })
        )
      ),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        this.onError = err.Message;
        return '0';
      })
    );
  }

  MD5 = function (string) {

    function RotateLeft(lValue, iShiftBits) {
            return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));
    }
 
    function AddUnsigned(lX,lY) {
            var lX4,lY4,lX8,lY8,lResult;
            lX8 = (lX & 0x80000000);
            lY8 = (lY & 0x80000000);
            lX4 = (lX & 0x40000000);
            lY4 = (lY & 0x40000000);
            lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);
            if (lX4 & lY4) {
                    return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
            }
            if (lX4 | lY4) {
                    if (lResult & 0x40000000) {
                            return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
                    } else {
                            return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
                    }
            } else {
                    return (lResult ^ lX8 ^ lY8);
            }
    }
 
    function F(x,y,z) { return (x & y) | ((~x) & z); }
    function G(x,y,z) { return (x & z) | (y & (~z)); }
    function H(x,y,z) { return (x ^ y ^ z); }
    function I(x,y,z) { return (y ^ (x | (~z))); }
 
    function FF(a,b,c,d,x,s,ac) {
            a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
            return AddUnsigned(RotateLeft(a, s), b);
    };
 
    function GG(a,b,c,d,x,s,ac) {
            a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
            return AddUnsigned(RotateLeft(a, s), b);
    };
 
    function HH(a,b,c,d,x,s,ac) {
            a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
            return AddUnsigned(RotateLeft(a, s), b);
    };
 
    function II(a,b,c,d,x,s,ac) {
            a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
            return AddUnsigned(RotateLeft(a, s), b);
    };
 
    function ConvertToWordArray(string) {
            var lWordCount;
            var lMessageLength = string.length;
            var lNumberOfWords_temp1=lMessageLength + 8;
            var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;
            var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
            var lWordArray=Array(lNumberOfWords-1);
            var lBytePosition = 0;
            var lByteCount = 0;
            while ( lByteCount < lMessageLength ) {
                    lWordCount = (lByteCount-(lByteCount % 4))/4;
                    lBytePosition = (lByteCount % 4)*8;
                    lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount)<<lBytePosition));
                    lByteCount++;
            }
            lWordCount = (lByteCount-(lByteCount % 4))/4;
            lBytePosition = (lByteCount % 4)*8;
            lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
            lWordArray[lNumberOfWords-2] = lMessageLength<<3;
            lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
            return lWordArray;
    };
 
    function WordToHex(lValue) {
            var WordToHexValue="",WordToHexValue_temp="",lByte,lCount;
            for (lCount = 0;lCount<=3;lCount++) {
                    lByte = (lValue>>>(lCount*8)) & 255;
                    WordToHexValue_temp = "0" + lByte.toString(16);
                    WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2);
            }
            return WordToHexValue;
    };
 
    function Utf8Encode(string) {
            string = string.replace(/\r\n/g,"\n");
            var utftext = "";
 
            for (var n = 0; n < string.length; n++) {
 
                    var c = string.charCodeAt(n);
 
                    if (c < 128) {
                            utftext += String.fromCharCode(c);
                    }
                    else if((c > 127) && (c < 2048)) {
                            utftext += String.fromCharCode((c >> 6) | 192);
                            utftext += String.fromCharCode((c & 63) | 128);
                    }
                    else {
                            utftext += String.fromCharCode((c >> 12) | 224);
                            utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                            utftext += String.fromCharCode((c & 63) | 128);
                    }
 
            }
 
            return utftext;
    };
 
    var x=Array();
    var k,AA,BB,CC,DD,a,b,c,d;
    var S11=7, S12=12, S13=17, S14=22;
    var S21=5, S22=9 , S23=14, S24=20;
    var S31=4, S32=11, S33=16, S34=23;
    var S41=6, S42=10, S43=15, S44=21;
 
    string = Utf8Encode(string);
 
    x = ConvertToWordArray(string);
 
    a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;
 
    for (k=0;k<x.length;k+=16) {
            AA=a; BB=b; CC=c; DD=d;
            a=FF(a,b,c,d,x[k+0], S11,0xD76AA478);
            d=FF(d,a,b,c,x[k+1], S12,0xE8C7B756);
            c=FF(c,d,a,b,x[k+2], S13,0x242070DB);
            b=FF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);
            a=FF(a,b,c,d,x[k+4], S11,0xF57C0FAF);
            d=FF(d,a,b,c,x[k+5], S12,0x4787C62A);
            c=FF(c,d,a,b,x[k+6], S13,0xA8304613);
            b=FF(b,c,d,a,x[k+7], S14,0xFD469501);
            a=FF(a,b,c,d,x[k+8], S11,0x698098D8);
            d=FF(d,a,b,c,x[k+9], S12,0x8B44F7AF);
            c=FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);
            b=FF(b,c,d,a,x[k+11],S14,0x895CD7BE);
            a=FF(a,b,c,d,x[k+12],S11,0x6B901122);
            d=FF(d,a,b,c,x[k+13],S12,0xFD987193);
            c=FF(c,d,a,b,x[k+14],S13,0xA679438E);
            b=FF(b,c,d,a,x[k+15],S14,0x49B40821);
            a=GG(a,b,c,d,x[k+1], S21,0xF61E2562);
            d=GG(d,a,b,c,x[k+6], S22,0xC040B340);
            c=GG(c,d,a,b,x[k+11],S23,0x265E5A51);
            b=GG(b,c,d,a,x[k+0], S24,0xE9B6C7AA);
            a=GG(a,b,c,d,x[k+5], S21,0xD62F105D);
            d=GG(d,a,b,c,x[k+10],S22,0x2441453);
            c=GG(c,d,a,b,x[k+15],S23,0xD8A1E681);
            b=GG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);
            a=GG(a,b,c,d,x[k+9], S21,0x21E1CDE6);
            d=GG(d,a,b,c,x[k+14],S22,0xC33707D6);
            c=GG(c,d,a,b,x[k+3], S23,0xF4D50D87);
            b=GG(b,c,d,a,x[k+8], S24,0x455A14ED);
            a=GG(a,b,c,d,x[k+13],S21,0xA9E3E905);
            d=GG(d,a,b,c,x[k+2], S22,0xFCEFA3F8);
            c=GG(c,d,a,b,x[k+7], S23,0x676F02D9);
            b=GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
            a=HH(a,b,c,d,x[k+5], S31,0xFFFA3942);
            d=HH(d,a,b,c,x[k+8], S32,0x8771F681);
            c=HH(c,d,a,b,x[k+11],S33,0x6D9D6122);
            b=HH(b,c,d,a,x[k+14],S34,0xFDE5380C);
            a=HH(a,b,c,d,x[k+1], S31,0xA4BEEA44);
            d=HH(d,a,b,c,x[k+4], S32,0x4BDECFA9);
            c=HH(c,d,a,b,x[k+7], S33,0xF6BB4B60);
            b=HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
            a=HH(a,b,c,d,x[k+13],S31,0x289B7EC6);
            d=HH(d,a,b,c,x[k+0], S32,0xEAA127FA);
            c=HH(c,d,a,b,x[k+3], S33,0xD4EF3085);
            b=HH(b,c,d,a,x[k+6], S34,0x4881D05);
            a=HH(a,b,c,d,x[k+9], S31,0xD9D4D039);
            d=HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);
            c=HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);
            b=HH(b,c,d,a,x[k+2], S34,0xC4AC5665);
            a=II(a,b,c,d,x[k+0], S41,0xF4292244);
            d=II(d,a,b,c,x[k+7], S42,0x432AFF97);
            c=II(c,d,a,b,x[k+14],S43,0xAB9423A7);
            b=II(b,c,d,a,x[k+5], S44,0xFC93A039);
            a=II(a,b,c,d,x[k+12],S41,0x655B59C3);
            d=II(d,a,b,c,x[k+3], S42,0x8F0CCC92);
            c=II(c,d,a,b,x[k+10],S43,0xFFEFF47D);
            b=II(b,c,d,a,x[k+1], S44,0x85845DD1);
            a=II(a,b,c,d,x[k+8], S41,0x6FA87E4F);
            d=II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);
            c=II(c,d,a,b,x[k+6], S43,0xA3014314);
            b=II(b,c,d,a,x[k+13],S44,0x4E0811A1);
            a=II(a,b,c,d,x[k+4], S41,0xF7537E82);
            d=II(d,a,b,c,x[k+11],S42,0xBD3AF235);
            c=II(c,d,a,b,x[k+2], S43,0x2AD7D2BB);
            b=II(b,c,d,a,x[k+9], S44,0xEB86D391);
            a=AddUnsigned(a,AA);
            b=AddUnsigned(b,BB);
            c=AddUnsigned(c,CC);
            d=AddUnsigned(d,DD);
        }
 
      var temp = WordToHex(a)+WordToHex(b)+WordToHex(c)+WordToHex(d);
 
      return temp.toLowerCase();
 }

}