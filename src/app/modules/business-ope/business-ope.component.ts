import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { DialogComponent } from '@app/shared/dialog/dialog.component';
import { ThemePalette } from '@angular/material/core';
import { Options, LabelType } from 'ng5-slider';
import { BusinessService } from '@app/services';
import { SpinnerService } from '@app/shared/spinner.service';
import { AuthService } from '@app/core/services';
import { Subscription, throwError, Observable } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { LearnDialogComponent } from '@app/shared/learn-dialog/learn-dialog.component';

@Component({
  selector: 'app-business-ope',
  templateUrl: './business-ope.component.html',
  styleUrls: ['./business-ope.component.scss']
})
export class BusinessOpeComponent implements OnInit {
  //Generic Option for ng5-slider
  genOption = {
    floor: 0,
    ceil: 24,
    disabled: false,
    translate: (value: number, label: LabelType): string => {
      switch (label) {
        case LabelType.Low:
          return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
        case LabelType.High:
          return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
        default: 
          return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : (value).toString());
      }
    }
  };

  //Business Operation Hours
  options: Options[] = [];
  options02: Options[] = [];
  newInterval: any[] = [];

  businessId: string = '';
  locationId: string = '_';
  providerId: string = '_';
  providerVal: string = '';

  providerParentHours: number = 1;
  locationParentHours: number = 1;

  locationData: any;
  serviceData: any;
  subsBusiness: Subscription;
  business$: Observable<any>;
  opeHoursSave$: Observable<any>;
  updateParentHours$: Observable<any>;

  get fBusiness(){
    return this.businessForm.controls;
  }

  links = [{label:$localize`:@@business-ope.opehours:`,link:'/businessope',active:1}, {label:$localize`:@@business-ope.daysoff:`,link:'/businessdays',active:0}];
  activeLink = this.links[0];
  background: ThemePalette = undefined;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private learnmore: MatDialog,
    private _snackBar: MatSnackBar,
    private authService: AuthService,
    private businessService: BusinessService,
    private spinnerService: SpinnerService
  ) { }

  businessForm = this.fb.group({
    BusinessId: [''],
    OperationHours: ['', [Validators.required]],
    Mon: new FormControl([8, 17]),
    Mon02: new FormControl([8, 17]),
    MonEnabled: [0],
    Tue: new FormControl([8, 17]),
    Tue02: new FormControl([8, 17]),
    TueEnabled: [0],
    Wed: new FormControl([8, 17]),
    Wed02: new FormControl([8, 17]),
    WedEnabled: [0],
    Thu: new FormControl([8, 17]),
    Thu02: new FormControl([8, 17]),
    ThuEnabled: [0],
    Fri: new FormControl([8, 17]),
    Fri02: new FormControl([8, 17]),
    FriEnabled: [0],
    Sat: new FormControl([8, 12]),
    Sat02: new FormControl([8, 17]),
    SatEnabled: [0],
    Sun: new FormControl([8, 12]),
    Sun02: new FormControl([8, 17]),
    SunEnabled: [0]
  });

  openLearnMore(message: string): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      message: message
    };
    this.learnmore.open(LearnDialogComponent, dialogConfig);
  }

  ngOnInit(): void {
    var spinnerRef = this.spinnerService.start($localize`:@@business-ope.loadopeninghours:`);
    this.businessId = this.authService.businessId();
    this.locationId = this.route.snapshot.paramMap.get('locations') == null ? "_" : "1";
    
    if (this.route.snapshot.paramMap.get('locations') != null){
      if (this.route.snapshot.paramMap.get('locations') == "1"){
        this.links = [{label:$localize`:@@business-ope.opehours:`,link:'/locationope/1',active:1}, {label:$localize`:@@business-ope.daysoff:`,link:'/locationdays/1',active:0}];
      }
    }
    
    if (this.route.snapshot.paramMap.get('provider') == null){
      this.providerId = "_";
    } else {
      this.locationId = "1";
      this.providerId = "1";
      if (this.route.snapshot.paramMap.get('provider') == "2"){
        this.links = [{label:$localize`:@@business-ope.opehours:`,link:'/providerope/2',active:1}, {label:$localize`:@@business-ope.daysoff:`,link:'/providerdays/2',active:0}];
      }
    }

    this.options[0] = Object.assign({}, this.genOption);
    this.options[1] = Object.assign({}, this.genOption);
    this.options[2] = Object.assign({}, this.genOption);
    this.options[3] = Object.assign({}, this.genOption);
    this.options[4] = Object.assign({}, this.genOption);
    this.options[5] = Object.assign({}, this.genOption);
    this.options[6] = Object.assign({}, this.genOption);

    this.options02[0] = Object.assign({}, this.genOption);
    this.options02[1] = Object.assign({}, this.genOption);
    this.options02[2] = Object.assign({}, this.genOption);
    this.options02[3] = Object.assign({}, this.genOption);
    this.options02[4] = Object.assign({}, this.genOption);
    this.options02[5] = Object.assign({}, this.genOption);
    this.options02[6] = Object.assign({}, this.genOption);

    this.newInterval[0] = "0";
    this.newInterval[1] = "0";
    this.newInterval[2] = "0";
    this.newInterval[3] = "0";
    this.newInterval[4] = "0";
    this.newInterval[5] = "0";
    this.newInterval[6] = "0";

    this.onValueChanges();

    this.business$ = this.businessService.getOpeningHours(this.businessId, this.locationId, this.providerId).pipe(
      tap((res: any) => {
        if (res.Code == 200){
          if (this.locationId == "_"){
            var opeHour = JSON.parse(res.Data[0].OperationHours);
            this.businessForm.setValue({
              BusinessId: res.Data[0].BusinessId,
              OperationHours: res.Data[0].OperationHours,
              Mon: ("MON" in opeHour ? [+opeHour.MON[0].I, +opeHour.MON[0].F] : [8, 12]),
              Mon02: ("MON" in opeHour ? (opeHour.MON.length > 1 ? [+opeHour.MON[1].I, +opeHour.MON[1].F] : [0,0]) : [0, 0]),
              MonEnabled: ("MON" in opeHour ? 1 : 0),
              Tue: ("TUE" in opeHour ? [+opeHour.TUE[0].I, +opeHour.TUE[0].F] : [8, 12]),
              Tue02: ("TUE" in opeHour ? (opeHour.TUE.length > 1 ? [+opeHour.TUE[1].I, +opeHour.TUE[1].F] : [0,0]) : [0, 0]),
              TueEnabled: ("TUE" in opeHour ? 1 : 0),
              Wed: ("WED" in opeHour ? [+opeHour.WED[0].I, +opeHour.WED[0].F] : [8, 12]),
              Wed02: ("WED" in opeHour ? (opeHour.WED.length > 1 ? [+opeHour.WED[1].I, +opeHour.WED[1].F] : [0,0]) : [0, 0]),
              WedEnabled: ("WED" in opeHour ? 1 : 0),
              Thu: ("THU" in opeHour ? [+opeHour.THU[0].I, +opeHour.THU[0].F] : [8, 12]),
              Thu02: ("THU" in opeHour ? (opeHour.THU.length > 1 ? [+opeHour.THU[1].I, +opeHour.THU[1].F] : [0,0]) : [0, 0]),
              ThuEnabled: ("THU" in opeHour ? 1 : 0),
              Fri: ("FRI" in opeHour ? [+opeHour.FRI[0].I, +opeHour.FRI[0].F] : [8, 12]),
              Fri02: ("FRI" in opeHour ? (opeHour.FRI.length > 1 ? [+opeHour.FRI[1].I, +opeHour.FRI[1].F] : [0,0]) : [0, 0]),
              FriEnabled: ("FRI" in opeHour ? 1 : 0),
              Sat: ("SAT" in opeHour ? [+opeHour.SAT[0].I, +opeHour.SAT[0].F] : [8, 12]),
              Sat02: ("SAT" in opeHour ? (opeHour.SAT.length > 1 ? [+opeHour.SAT[1].I, +opeHour.SAT[1].F] : [0,0]) : [0, 0]),
              SatEnabled: ("SAT" in opeHour ? 1 : 0),
              Sun: ("SUN" in opeHour ? [+opeHour.SUN[0].I, +opeHour.SUN[0].F] : [8, 12]),
              Sun02: ("SUN" in opeHour ? (opeHour.SUN.length > 1 ? [+opeHour.SUN[1].I, +opeHour.TUE[1].F] : [0,0]) : [0, 0]),
              SunEnabled: ("SUN" in opeHour ? 1 : 0),
            });
          }
          if (this.locationId != "_" && this.providerId == "_"){
            this.locationData = res.Data;
            this.locationId = res.Data[0].LocationId;
            this.locationParentHours = res.Data[0].ParentHours;
            var opeHour = JSON.parse(res.Data[0].OperationHours);
            this.businessForm.setValue({
              BusinessId: this.businessId,
              OperationHours: res.Data[0].OperationHours,
              Mon: ("MON" in opeHour ? [+opeHour.MON[0].I, +opeHour.MON[0].F] : [8, 12]),
              Mon02: ("MON" in opeHour ? (opeHour.MON.length > 1 ? [+opeHour.MON[1].I, +opeHour.MON[1].F] : [0,0]) : [0, 0]),
              MonEnabled: ("MON" in opeHour ? 1 : 0),
              Tue: ("TUE" in opeHour ? [+opeHour.TUE[0].I, +opeHour.TUE[0].F] : [8, 12]),
              Tue02: ("TUE" in opeHour ? (opeHour.TUE.length > 1 ? [+opeHour.TUE[1].I, +opeHour.TUE[1].F] : [0,0]) : [0, 0]),
              TueEnabled: ("TUE" in opeHour ? 1 : 0),
              Wed: ("WED" in opeHour ? [+opeHour.WED[0].I, +opeHour.WED[0].F] : [8, 12]),
              Wed02: ("WED" in opeHour ? (opeHour.WED.length > 1 ? [+opeHour.WED[1].I, +opeHour.WED[1].F] : [0,0]) : [0, 0]),
              WedEnabled: ("WED" in opeHour ? 1 : 0),
              Thu: ("THU" in opeHour ? [+opeHour.THU[0].I, +opeHour.THU[0].F] : [8, 12]),
              Thu02: ("THU" in opeHour ? (opeHour.THU.length > 1 ? [+opeHour.THU[1].I, +opeHour.THU[1].F] : [0,0]) : [0, 0]),
              ThuEnabled: ("THU" in opeHour ? 1 : 0),
              Fri: ("FRI" in opeHour ? [+opeHour.FRI[0].I, +opeHour.FRI[0].F] : [8, 12]),
              Fri02: ("FRI" in opeHour ? (opeHour.FRI.length > 1 ? [+opeHour.FRI[1].I, +opeHour.FRI[1].F] : [0,0]) : [0, 0]),
              FriEnabled: ("FRI" in opeHour ? 1 : 0),
              Sat: ("SAT" in opeHour ? [+opeHour.SAT[0].I, +opeHour.SAT[0].F] : [8, 12]),
              Sat02: ("SAT" in opeHour ? (opeHour.SAT.length > 1 ? [+opeHour.SAT[1].I, +opeHour.SAT[1].F] : [0,0]) : [0, 0]),
              SatEnabled: ("SAT" in opeHour ? 1 : 0),
              Sun: ("SUN" in opeHour ? [+opeHour.SUN[0].I, +opeHour.SUN[0].F] : [8, 12]),
              Sun02: ("SUN" in opeHour ? (opeHour.SUN.length > 1 ? [+opeHour.SUN[1].I, +opeHour.TUE[1].F] : [0,0]) : [0, 0]),
              SunEnabled: ("SUN" in opeHour ? 1 : 0),
            });
          }
          if (this.providerId != "_"){
            this.serviceData = res.Data;
            this.providerVal = res.Data[0].LocationId + '#' + res.Data[0].Services[0].ProviderId;
            this.locationId = res.Data[0].LocationId;
            this.providerId = res.Data[0].Services[0].ProviderId;
            this.providerParentHours = res.Data[0].Services[0].ParentHours;
            var opeHour = JSON.parse(res.Data[0].Services[0].OperationHours);
            this.businessForm.setValue({
              BusinessId: this.businessId,
              OperationHours: res.Data[0].Services[0].OperationHours,
              Mon: ("MON" in opeHour ? [+opeHour.MON[0].I, +opeHour.MON[0].F] : [8, 12]),
              Mon02: ("MON" in opeHour ? (opeHour.MON.length > 1 ? [+opeHour.MON[1].I, +opeHour.MON[1].F] : [0,0]) : [0, 0]),
              MonEnabled: ("MON" in opeHour ? 1 : 0),
              Tue: ("TUE" in opeHour ? [+opeHour.TUE[0].I, +opeHour.TUE[0].F] : [8, 12]),
              Tue02: ("TUE" in opeHour ? (opeHour.TUE.length > 1 ? [+opeHour.TUE[1].I, +opeHour.TUE[1].F] : [0,0]) : [0, 0]),
              TueEnabled: ("TUE" in opeHour ? 1 : 0),
              Wed: ("WED" in opeHour ? [+opeHour.WED[0].I, +opeHour.WED[0].F] : [8, 12]),
              Wed02: ("WED" in opeHour ? (opeHour.WED.length > 1 ? [+opeHour.WED[1].I, +opeHour.WED[1].F] : [0,0]) : [0, 0]),
              WedEnabled: ("WED" in opeHour ? 1 : 0),
              Thu: ("THU" in opeHour ? [+opeHour.THU[0].I, +opeHour.THU[0].F] : [8, 12]),
              Thu02: ("THU" in opeHour ? (opeHour.THU.length > 1 ? [+opeHour.THU[1].I, +opeHour.THU[1].F] : [0,0]) : [0, 0]),
              ThuEnabled: ("THU" in opeHour ? 1 : 0),
              Fri: ("FRI" in opeHour ? [+opeHour.FRI[0].I, +opeHour.FRI[0].F] : [8, 12]),
              Fri02: ("FRI" in opeHour ? (opeHour.FRI.length > 1 ? [+opeHour.FRI[1].I, +opeHour.FRI[1].F] : [0,0]) : [0, 0]),
              FriEnabled: ("FRI" in opeHour ? 1 : 0),
              Sat: ("SAT" in opeHour ? [+opeHour.SAT[0].I, +opeHour.SAT[0].F] : [8, 12]),
              Sat02: ("SAT" in opeHour ? (opeHour.SAT.length > 1 ? [+opeHour.SAT[1].I, +opeHour.SAT[1].F] : [0,0]) : [0, 0]),
              SatEnabled: ("SAT" in opeHour ? 1 : 0),
              Sun: ("SUN" in opeHour ? [+opeHour.SUN[0].I, +opeHour.SUN[0].F] : [8, 12]),
              Sun02: ("SUN" in opeHour ? (opeHour.SUN.length > 1 ? [+opeHour.SUN[1].I, +opeHour.TUE[1].F] : [0,0]) : [0, 0]),
              SunEnabled: ("SUN" in opeHour ? 1 : 0),
            });
          }
          if (this.businessForm.value.Mon02[0] > 0){
            this.newInterval[0] = "1";
            let iniGenOption = {
              floor: 0,
              ceil: this.businessForm.value.Mon02[0]-1,
              disabled: false,
              translate: (value: number, label: LabelType): string => {
                switch (label) {
                  case LabelType.Low:
                    return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
                  case LabelType.High:
                    return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
                  default: 
                    return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : (value).toString());
                }
              }
            };
            let locGenOption = {
              floor: this.businessForm.value.Mon02[0],
              ceil: 24,
              disabled: false,
              translate: (value: number, label: LabelType): string => {
                switch (label) {
                  case LabelType.Low:
                    return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
                  case LabelType.High:
                    return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
                  default: 
                    return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : (value).toString());
                }
              }
            };
            this.options[0] = Object.assign({}, iniGenOption, {disabled: ("MON" in opeHour ? 0 : 1)});
            this.options02[0] = Object.assign({}, locGenOption, {disabled: ("MON" in opeHour ? 0 : 1)});
          } else {
            this.options[0] = Object.assign({}, this.genOption, {disabled: ("MON" in opeHour ? 0 : 1)});
          }
          if (this.businessForm.value.Tue02[0] > 0){
            this.newInterval[1] = "1";
            let iniGenOption = {
              floor: 0,
              ceil: this.businessForm.value.Tue02[0]-1,
              disabled: false,
              translate: (value: number, label: LabelType): string => {
                switch (label) {
                  case LabelType.Low:
                    return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
                  case LabelType.High:
                    return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
                  default: 
                    return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : (value).toString());
                }
              }
            };
            let locGenOption = {
              floor: this.businessForm.value.Tue02[0],
              ceil: 24,
              disabled: false,
              translate: (value: number, label: LabelType): string => {
                switch (label) {
                  case LabelType.Low:
                    return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
                  case LabelType.High:
                    return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
                  default: 
                    return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : (value).toString());
                }
              }
            };
            this.options[1] = Object.assign({}, iniGenOption, {disabled: ("TUE" in opeHour ? 0 : 1)});
            this.options02[1] = Object.assign({}, locGenOption, {disabled: ("TUE" in opeHour ? 0 : 1)});
          } else {
            this.options[1] = Object.assign({}, this.genOption, {disabled: ("TUE" in opeHour ? 0 : 1)});
          }
          if (this.businessForm.value.Wed02[0] > 0){
            this.newInterval[2] = "1";
            let iniGenOption = {
              floor: 0,
              ceil: this.businessForm.value.Wed02[0]-1,
              disabled: false,
              translate: (value: number, label: LabelType): string => {
                switch (label) {
                  case LabelType.Low:
                    return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
                  case LabelType.High:
                    return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
                  default: 
                    return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : (value).toString());
                }
              }
            };
            let locGenOption = {
              floor: this.businessForm.value.Wed02[0],
              ceil: 24,
              disabled: false,
              translate: (value: number, label: LabelType): string => {
                switch (label) {
                  case LabelType.Low:
                    return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
                  case LabelType.High:
                    return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
                  default: 
                    return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : (value).toString());
                }
              }
            };
            this.options[2] = Object.assign({}, iniGenOption, {disabled: ("WED" in opeHour ? 0 : 1)});
            this.options02[2] = Object.assign({}, locGenOption, {disabled: ("WED" in opeHour ? 0 : 1)});
          } else {
            this.options[2] = Object.assign({}, this.genOption, {disabled: ("WED" in opeHour ? 0 : 1)});
          }
          if (this.businessForm.value.Thu02[0] > 0){
            this.newInterval[3] = "1";
            let iniGenOption = {
              floor: 0,
              ceil: this.businessForm.value.Thu02[0]-1,
              disabled: false,
              translate: (value: number, label: LabelType): string => {
                switch (label) {
                  case LabelType.Low:
                    return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
                  case LabelType.High:
                    return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
                  default: 
                    return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : (value).toString());
                }
              }
            };
            let locGenOption = {
              floor: this.businessForm.value.Thu02[0],
              ceil: 24,
              disabled: false,
              translate: (value: number, label: LabelType): string => {
                switch (label) {
                  case LabelType.Low:
                    return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
                  case LabelType.High:
                    return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
                  default: 
                    return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : (value).toString());
                }
              }
            };
            this.options[3] = Object.assign({}, iniGenOption, {disabled: ("THU" in opeHour ? 0 : 1)});
            this.options02[3] = Object.assign({}, locGenOption, {disabled: ("THU" in opeHour ? 0 : 1)});
          } else {
            this.options[3] = Object.assign({}, this.genOption, {disabled: ("THU" in opeHour ? 0 : 1)});
          }
          if (this.businessForm.value.Fri02[0] > 0){
            this.newInterval[4] = "1";
            let iniGenOption = {
              floor: 0,
              ceil: this.businessForm.value.Fri02[0]-1,
              disabled: false,
              translate: (value: number, label: LabelType): string => {
                switch (label) {
                  case LabelType.Low:
                    return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
                  case LabelType.High:
                    return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
                  default: 
                    return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : (value).toString());
                }
              }
            };
            let locGenOption = {
              floor: this.businessForm.value.Fri02[0],
              ceil: 24,
              disabled: false,
              translate: (value: number, label: LabelType): string => {
                switch (label) {
                  case LabelType.Low:
                    return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
                  case LabelType.High:
                    return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
                  default: 
                    return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : (value).toString());
                }
              }
            };
            this.options[4] = Object.assign({}, iniGenOption, {disabled: ("FRI" in opeHour ? 0 : 1)});
            this.options02[4] = Object.assign({}, locGenOption, {disabled: ("FRI" in opeHour ? 0 : 1)});
          } else {
            this.options[4] = Object.assign({}, this.genOption, {disabled: ("FRI" in opeHour ? 0 : 1)});
          }
          if (this.businessForm.value.Sat02[0] > 0){
            this.newInterval[5] = "1";
            let iniGenOption = {
              floor: 0,
              ceil: this.businessForm.value.Sat02[0]-1,
              disabled: false,
              translate: (value: number, label: LabelType): string => {
                switch (label) {
                  case LabelType.Low:
                    return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
                  case LabelType.High:
                    return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
                  default: 
                    return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : (value).toString());
                }
              }
            };
            let locGenOption = {
              floor: this.businessForm.value.Sat02[0],
              ceil: 24,
              disabled: false,
              translate: (value: number, label: LabelType): string => {
                switch (label) {
                  case LabelType.Low:
                    return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
                  case LabelType.High:
                    return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
                  default: 
                    return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : (value).toString());
                }
              }
            };
            this.options[5] = Object.assign({}, iniGenOption, {disabled: ("SAT" in opeHour ? 0 : 1)});
            this.options02[5] = Object.assign({}, locGenOption, {disabled: ("SAT" in opeHour ? 0 : 1)});
          } else {
            this.options[5] = Object.assign({}, this.genOption, {disabled: ("SAT" in opeHour ? 0 : 1)});
          }
          if (this.businessForm.value.Sun02[0] > 0){
            this.newInterval[6] = "1";
            let iniGenOption = {
              floor: 0,
              ceil: this.businessForm.value.Sun02[0]-1,
              disabled: false,
              translate: (value: number, label: LabelType): string => {
                switch (label) {
                  case LabelType.Low:
                    return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
                  case LabelType.High:
                    return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
                  default: 
                    return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : (value).toString());
                }
              }
            };
            let locGenOption = {
              floor: this.businessForm.value.Sun02[0],
              ceil: 24,
              disabled: false,
              translate: (value: number, label: LabelType): string => {
                switch (label) {
                  case LabelType.Low:
                    return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
                  case LabelType.High:
                    return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
                  default: 
                    return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : (value).toString());
                }
              }
            };
            this.options[6] = Object.assign({}, iniGenOption, {disabled: ("SUN" in opeHour ? 0 : 1)});
            this.options02[6] = Object.assign({}, locGenOption, {disabled: ("SUN" in opeHour ? 0 : 1)});
          } else {
            this.options[6] = Object.assign({}, this.genOption, {disabled: ("SUN" in opeHour ? 0 : 1)});
          }

          this.spinnerService.stop(spinnerRef);
        } else {
          this.spinnerService.stop(spinnerRef);
          this.businessForm.reset({BusinessId: '', OperationHours: '', Mon:[8,17], Mon02:[18,24], MonEnabled: 0, Tue:[8,17], Tue02:[18,24], TueEnabled: 0, Wed:[8,17], Wed02:[18,24], WedEnabled: 0, Thu:[8,17], Thu02:[18,24], ThuEnabled: 0, Fri:[8,17], Fri02:[18,24], FriEnabled: 0, Sat:[8,17], Sat02:[18,24], SatEnabled: 0, Sun:[8,17], Sun02:[18,24], SunEnabled: 0});
        }
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        this.businessForm.reset({BusinessId: '', OperationHours: '', Mon:[8,17], Mon02:[18,24], MonEnabled: 0, Tue:[8,17], Tue02:[18,24], TueEnabled: 0, Wed:[8,17], Wed02:[18,24], WedEnabled: 0, Thu:[8,17], Thu02:[18,24], ThuEnabled: 0, Fri:[8,17], Fri02:[18,24], FriEnabled: 0, Sat:[8,17], Sat02:[18,24], SatEnabled: 0, Sun:[8,17], Sun02:[18,24], SunEnabled: 0});
        this.openDialog($localize`:@@shared.error:`, err.Message, false, true, false);
        return throwError(err || err.message);
      })
    );
  }

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

  onChangeDisabled(item: number, event: any){
    this.options[item] = Object.assign({}, this.genOption, {disabled: !event.checked});
    if (event.checked == false){
      this.newInterval[item] = "0";
    }
  }

  onAddInterval(dayNum: number){
    let maxValue;
    switch (dayNum) {
      case 0: maxValue = this.businessForm.value.Mon[1]; break;
      case 1: maxValue = this.businessForm.value.Tue[1]; break;
      case 2: maxValue = this.businessForm.value.Wed[1]; break;
      case 3: maxValue = this.businessForm.value.Thu[1]; break;
      case 4: maxValue = this.businessForm.value.Fri[1]; break;
      case 5: maxValue = this.businessForm.value.Sat[1]; break;
      case 6: maxValue = this.businessForm.value.Sun[1]; break;
    }
    if (maxValue < 23){
      this.newInterval[dayNum] = "1";
      let iniGenOption = {
        floor: 0,
        ceil: maxValue,
        disabled: false,
        translate: (value: number, label: LabelType): string => {
          switch (label) {
            case LabelType.Low:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            case LabelType.High:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            default: 
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : (value).toString());
          }
        }
      };
      let locGenOption = {
        floor: maxValue+1,
        ceil: 24,
        disabled: false,
        translate: (value: number, label: LabelType): string => {
          switch (label) {
            case LabelType.Low:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            case LabelType.High:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            default: 
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : (value).toString());
          }
        }
      };
      this.options02[dayNum] = Object.assign({}, locGenOption, {disabled: 0});
      this.options[dayNum] = Object.assign({}, iniGenOption, {disabled: 0});
    }
  }

  onRemInterval(dayNum: number){
    this.newInterval[dayNum] = "0";
    let locGenOption = {
      floor: 0,
      ceil: 24,
      disabled: false,
      translate: (value: number, label: LabelType): string => {
        switch (label) {
          case LabelType.Low:
            return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
          case LabelType.High:
            return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
          default: 
            return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : (value).toString());
        }
      }
    };
    this.options[dayNum] = Object.assign({}, locGenOption, {disabled: 0});
  }

  onValueChanges(): void {
    this.subsBusiness = this.businessForm.valueChanges.subscribe(val=>{
      if (val.MonEnabled === true) {
        this.businessForm.controls["MonEnabled"].setValue(1);
      }
      if (val.MonEnabled === false){
        this.businessForm.controls["MonEnabled"].setValue(0);
      }
      if (val.TueEnabled === true) {
        this.businessForm.controls["TueEnabled"].setValue(1);
      }
      if (val.TueEnabled === false){
        this.businessForm.controls["TueEnabled"].setValue(0);
      }
      if (val.WedEnabled === true) {
        this.businessForm.controls["WedEnabled"].setValue(1);
      }
      if (val.WedEnabled === false){
        this.businessForm.controls["WedEnabled"].setValue(0);
      }
      if (val.ThuEnabled === true) {
        this.businessForm.controls["ThuEnabled"].setValue(1);
      }
      if (val.ThuEnabled === false){
        this.businessForm.controls["ThuEnabled"].setValue(0);
      }
      if (val.FriEnabled === true) {
        this.businessForm.controls["FriEnabled"].setValue(1);
      }
      if (val.FriEnabled === false){
        this.businessForm.controls["FriEnabled"].setValue(0);
      }
      if (val.SatEnabled === true) {
        this.businessForm.controls["SatEnabled"].setValue(1);
      }
      if (val.SatEnabled === false){
        this.businessForm.controls["SatEnabled"].setValue(0);
      }
      if (val.SunEnabled === true) {
        this.businessForm.controls["SunEnabled"].setValue(1);
      }
      if (val.SunEnabled === false){
        this.businessForm.controls["SunEnabled"].setValue(0);
      }
    });
  }

  onSubmit(){
    if (!this.businessForm.valid){
      return;
    }
    let mon: any[] = [];
    let tue: any[] = [];
    let wed: any[] = [];
    let thu: any[] = [];
    let fri: any[] = [];
    let sat: any[] = [];
    let sun: any[] = [];

    let opeHours = {}
    if (this.businessForm.value.MonEnabled === 1) {
      mon.push({"I": this.businessForm.value.Mon[0].toString(), "F": this.businessForm.value.Mon[1].toString()});
      if (this.newInterval[0] == "1"){
        mon.push({"I": this.businessForm.value.Mon02[0].toString(), "F": this.businessForm.value.Mon02[1].toString()});
      }
      opeHours["MON"] = mon
    }
    if (this.businessForm.value.TueEnabled === 1) {
      tue.push({"I": this.businessForm.value.Tue[0].toString(), "F": this.businessForm.value.Tue[1].toString()});
      if (this.newInterval[1] == "1"){
        tue.push({"I": this.businessForm.value.Tue02[0].toString(), "F": this.businessForm.value.Tue02[1].toString()});
      }
      opeHours["TUE"] = tue
    }
    if (this.businessForm.value.WedEnabled === 1) {
      wed.push({"I": this.businessForm.value.Wed[0].toString(), "F": this.businessForm.value.Wed[1].toString()});
      if (this.newInterval[2] == "1"){
        wed.push({"I": this.businessForm.value.Wed02[0].toString(), "F": this.businessForm.value.Wed02[1].toString()});
      }
      opeHours["WED"] = wed
    }
    if (this.businessForm.value.ThuEnabled === 1) {
      thu.push({"I": this.businessForm.value.Thu[0].toString(), "F": this.businessForm.value.Thu[1].toString()});
      if (this.newInterval[3] == "1"){
        thu.push({"I": this.businessForm.value.Thu02[0].toString(), "F": this.businessForm.value.Thu02[1].toString()});
      }
      opeHours["THU"] = thu
    }
    if (this.businessForm.value.FriEnabled === 1) {
      fri.push({"I": this.businessForm.value.Fri[0].toString(), "F": this.businessForm.value.Fri[1].toString()});
      if (this.newInterval[4] == "1"){
        fri.push({"I": this.businessForm.value.Fri02[0].toString(), "F": this.businessForm.value.Fri02[1].toString()});
      }
      opeHours["FRI"] = fri
    }
    if (this.businessForm.value.SatEnabled === 1) {
      sat.push({"I": this.businessForm.value.Sat[0].toString(), "F": this.businessForm.value.Sat[1].toString()});
      if (this.newInterval[5] == "1"){
        sat.push({"I": this.businessForm.value.Sat02[0].toString(), "F": this.businessForm.value.Sat02[1].toString()});
      }
      opeHours["SAT"] = sat
    }
    if (this.businessForm.value.SunEnabled === 1) {
      sun.push({"I": this.businessForm.value.Sun[0].toString(), "F": this.businessForm.value.Sun[1].toString()});
      if (this.newInterval[6] == "1"){
        sun.push({"I": this.businessForm.value.Sun02[0].toString(), "F": this.businessForm.value.Sun02[1].toString()});
      }
      opeHours["SUN"] = sun
    }
    
    let dataForm =  { 
      "OpeHours": JSON.stringify(opeHours)
    }
    var spinnerRef = this.spinnerService.start($localize`:@@business.saving:`);
    this.opeHoursSave$ = this.businessService.updateOpeningHours(this.businessId, this.locationId, this.providerId, dataForm).pipe(
      tap((res: any) => { 
        if (res.Code == 200){
          this.spinnerService.stop(spinnerRef);
          this.openSnackBar($localize`:@@business-ope.openinghoursupdate:`,$localize`:@@business-ope.openinghours:`);
        } else {
          this.openSnackBar($localize`:@@shared.wrong:`,$localize`:@@business-ope.openinghours:`);
        }
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        this.openDialog($localize`:@@shared.error:`, err.Message, false, true, false);
        return throwError(err || err.message);
      })
    );
  }

  onLocationChange(event){
    if (event.value == "") {return;}
    var spinnerRef = this.spinnerService.start($localize`:@@business-ope.loadopeninghours:`);
    this.locationId = event.value;
    this.businessForm.reset({BusinessId: '', OperationHours: '', Mon:[8,17], Mon02:[18,24], MonEnabled: 0, Tue:[8,17], Tue02:[18,24], TueEnabled: 0, Wed:[8,17], Wed02:[18,24], WedEnabled: 0, Thu:[8,17], Thu02:[18,24], ThuEnabled: 0, Fri:[8,17], Fri02:[18,24], FriEnabled: 0, Sat:[8,17], Sat02:[18,24], SatEnabled: 0, Sun:[8,17], Sun02:[18,24], SunEnabled: 0});

    this.options[0] = Object.assign({}, this.genOption);
    this.options[1] = Object.assign({}, this.genOption);
    this.options[2] = Object.assign({}, this.genOption);
    this.options[3] = Object.assign({}, this.genOption);
    this.options[4] = Object.assign({}, this.genOption);
    this.options[5] = Object.assign({}, this.genOption);
    this.options[6] = Object.assign({}, this.genOption);

    this.options02[0] = Object.assign({}, this.genOption);
    this.options02[1] = Object.assign({}, this.genOption);
    this.options02[2] = Object.assign({}, this.genOption);
    this.options02[3] = Object.assign({}, this.genOption);
    this.options02[4] = Object.assign({}, this.genOption);
    this.options02[5] = Object.assign({}, this.genOption);
    this.options02[6] = Object.assign({}, this.genOption);

    this.newInterval[0] = "0";
    this.newInterval[1] = "0";
    this.newInterval[2] = "0";
    this.newInterval[3] = "0";
    this.newInterval[4] = "0";
    this.newInterval[5] = "0";
    this.newInterval[6] = "0";

    let loc = this.locationData.filter(x => x.LocationId == event.value);
    var opeHour = JSON.parse(loc[0].OperationHours);
    this.locationParentHours = loc[0].ParentHours;
    this.businessForm.setValue({
      BusinessId: this.businessId,
      OperationHours: loc[0].OperationHours,
      Mon: ("MON" in opeHour ? [+opeHour.MON[0].I, +opeHour.MON[0].F] : [8, 12]),
      Mon02: ("MON" in opeHour ? (opeHour.MON.length > 1 ? [+opeHour.MON[1].I, +opeHour.MON[1].F] : [0,0]) : [0, 0]),
      MonEnabled: ("MON" in opeHour ? 1 : 0),
      Tue: ("TUE" in opeHour ? [+opeHour.TUE[0].I, +opeHour.TUE[0].F] : [8, 12]),
      Tue02: ("TUE" in opeHour ? (opeHour.TUE.length > 1 ? [+opeHour.TUE[1].I, +opeHour.TUE[1].F] : [0,0]) : [0, 0]),
      TueEnabled: ("TUE" in opeHour ? 1 : 0),
      Wed: ("WED" in opeHour ? [+opeHour.WED[0].I, +opeHour.WED[0].F] : [8, 12]),
      Wed02: ("WED" in opeHour ? (opeHour.WED.length > 1 ? [+opeHour.WED[1].I, +opeHour.WED[1].F] : [0,0]) : [0, 0]),
      WedEnabled: ("WED" in opeHour ? 1 : 0),
      Thu: ("THU" in opeHour ? [+opeHour.THU[0].I, +opeHour.THU[0].F] : [8, 12]),
      Thu02: ("THU" in opeHour ? (opeHour.THU.length > 1 ? [+opeHour.THU[1].I, +opeHour.THU[1].F] : [0,0]) : [0, 0]),
      ThuEnabled: ("THU" in opeHour ? 1 : 0),
      Fri: ("FRI" in opeHour ? [+opeHour.FRI[0].I, +opeHour.FRI[0].F] : [8, 12]),
      Fri02: ("FRI" in opeHour ? (opeHour.FRI.length > 1 ? [+opeHour.FRI[1].I, +opeHour.FRI[1].F] : [0,0]) : [0, 0]),
      FriEnabled: ("FRI" in opeHour ? 1 : 0),
      Sat: ("SAT" in opeHour ? [+opeHour.SAT[0].I, +opeHour.SAT[0].F] : [8, 12]),
      Sat02: ("SAT" in opeHour ? (opeHour.SAT.length > 1 ? [+opeHour.SAT[1].I, +opeHour.SAT[1].F] : [0,0]) : [0, 0]),
      SatEnabled: ("SAT" in opeHour ? 1 : 0),
      Sun: ("SUN" in opeHour ? [+opeHour.SUN[0].I, +opeHour.SUN[0].F] : [8, 12]),
      Sun02: ("SUN" in opeHour ? (opeHour.SUN.length > 1 ? [+opeHour.SUN[1].I, +opeHour.TUE[1].F] : [0,0]) : [0, 0]),
      SunEnabled: ("SUN" in opeHour ? 1 : 0),
    });

    if (this.businessForm.value.Mon02[0] > 0){
      this.newInterval[0] = "1";
      let iniGenOption = {
        floor: 0,
        ceil: this.businessForm.value.Mon02[0]-1,
        disabled: false,
        translate: (value: number, label: LabelType): string => {
          switch (label) {
            case LabelType.Low:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            case LabelType.High:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            default: 
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : (value).toString());
          }
        }
      };
      let locGenOption = {
        floor: this.businessForm.value.Mon02[0],
        ceil: 24,
        disabled: false,
        translate: (value: number, label: LabelType): string => {
          switch (label) {
            case LabelType.Low:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            case LabelType.High:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            default: 
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : (value).toString());
          }
        }
      };
      this.options[0] = Object.assign({}, iniGenOption, {disabled: ("MON" in opeHour ? 0 : 1)});
      this.options02[0] = Object.assign({}, locGenOption, {disabled: ("MON" in opeHour ? 0 : 1)});
    } else {
      this.options[0] = Object.assign({}, this.genOption, {disabled: ("MON" in opeHour ? 0 : 1)});
    }
    if (this.businessForm.value.Tue02[0] > 0){
      this.newInterval[1] = "1";
      let iniGenOption = {
        floor: 0,
        ceil: this.businessForm.value.Tue02[0]-1,
        disabled: false,
        translate: (value: number, label: LabelType): string => {
          switch (label) {
            case LabelType.Low:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            case LabelType.High:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            default: 
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : (value).toString());
          }
        }
      };
      let locGenOption = {
        floor: this.businessForm.value.Tue02[0],
        ceil: 24,
        disabled: false,
        translate: (value: number, label: LabelType): string => {
          switch (label) {
            case LabelType.Low:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            case LabelType.High:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            default: 
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : (value).toString());
          }
        }
      };
      this.options[1] = Object.assign({}, iniGenOption, {disabled: ("TUE" in opeHour ? 0 : 1)});
      this.options02[1] = Object.assign({}, locGenOption, {disabled: ("TUE" in opeHour ? 0 : 1)});
    } else {
      this.options[1] = Object.assign({}, this.genOption, {disabled: ("TUE" in opeHour ? 0 : 1)});
    }
    if (this.businessForm.value.Wed02[0] > 0){
      this.newInterval[2] = "1";
      let iniGenOption = {
        floor: 0,
        ceil: this.businessForm.value.Wed02[0]-1,
        disabled: false,
        translate: (value: number, label: LabelType): string => {
          switch (label) {
            case LabelType.Low:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            case LabelType.High:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            default: 
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : (value).toString());
          }
        }
      };
      let locGenOption = {
        floor: this.businessForm.value.Wed02[0],
        ceil: 24,
        disabled: false,
        translate: (value: number, label: LabelType): string => {
          switch (label) {
            case LabelType.Low:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            case LabelType.High:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            default: 
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : (value).toString());
          }
        }
      };
      this.options[2] = Object.assign({}, iniGenOption, {disabled: ("WED" in opeHour ? 0 : 1)});
      this.options02[2] = Object.assign({}, locGenOption, {disabled: ("WED" in opeHour ? 0 : 1)});
    } else {
      this.options[2] = Object.assign({}, this.genOption, {disabled: ("WED" in opeHour ? 0 : 1)});
    }
    if (this.businessForm.value.Thu02[0] > 0){
      this.newInterval[3] = "1";
      let iniGenOption = {
        floor: 0,
        ceil: this.businessForm.value.Thu02[0]-1,
        disabled: false,
        translate: (value: number, label: LabelType): string => {
          switch (label) {
            case LabelType.Low:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            case LabelType.High:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            default: 
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : (value).toString());
          }
        }
      };
      let locGenOption = {
        floor: this.businessForm.value.Thu02[0],
        ceil: 24,
        disabled: false,
        translate: (value: number, label: LabelType): string => {
          switch (label) {
            case LabelType.Low:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            case LabelType.High:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            default: 
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : (value).toString());
          }
        }
      };
      this.options[3] = Object.assign({}, iniGenOption, {disabled: ("THU" in opeHour ? 0 : 1)});
      this.options02[3] = Object.assign({}, locGenOption, {disabled: ("THU" in opeHour ? 0 : 1)});
    } else {
      this.options[3] = Object.assign({}, this.genOption, {disabled: ("THU" in opeHour ? 0 : 1)});
    }
    if (this.businessForm.value.Fri02[0] > 0){
      this.newInterval[4] = "1";
      let iniGenOption = {
        floor: 0,
        ceil: this.businessForm.value.Fri02[0]-1,
        disabled: false,
        translate: (value: number, label: LabelType): string => {
          switch (label) {
            case LabelType.Low:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            case LabelType.High:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            default: 
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : (value).toString());
          }
        }
      };
      let locGenOption = {
        floor: this.businessForm.value.Fri02[0],
        ceil: 24,
        disabled: false,
        translate: (value: number, label: LabelType): string => {
          switch (label) {
            case LabelType.Low:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            case LabelType.High:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            default: 
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : (value).toString());
          }
        }
      };
      this.options[4] = Object.assign({}, iniGenOption, {disabled: ("FRI" in opeHour ? 0 : 1)});
      this.options02[4] = Object.assign({}, locGenOption, {disabled: ("FRI" in opeHour ? 0 : 1)});
    } else {
      this.options[4] = Object.assign({}, this.genOption, {disabled: ("FRI" in opeHour ? 0 : 1)});
    }
    if (this.businessForm.value.Sat02[0] > 0){
      this.newInterval[5] = "1";
      let iniGenOption = {
        floor: 0,
        ceil: this.businessForm.value.Sat02[0]-1,
        disabled: false,
        translate: (value: number, label: LabelType): string => {
          switch (label) {
            case LabelType.Low:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            case LabelType.High:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            default: 
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : (value).toString());
          }
        }
      };
      let locGenOption = {
        floor: this.businessForm.value.Sat02[0],
        ceil: 24,
        disabled: false,
        translate: (value: number, label: LabelType): string => {
          switch (label) {
            case LabelType.Low:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            case LabelType.High:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            default: 
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : (value).toString());
          }
        }
      };
      this.options[5] = Object.assign({}, iniGenOption, {disabled: ("SAT" in opeHour ? 0 : 1)});
      this.options02[5] = Object.assign({}, locGenOption, {disabled: ("SAT" in opeHour ? 0 : 1)});
    } else {
      this.options[5] = Object.assign({}, this.genOption, {disabled: ("SAT" in opeHour ? 0 : 1)});
    }
    if (this.businessForm.value.Sun02[0] > 0){
      this.newInterval[6] = "1";
      let iniGenOption = {
        floor: 0,
        ceil: this.businessForm.value.Sun02[0]-1,
        disabled: false,
        translate: (value: number, label: LabelType): string => {
          switch (label) {
            case LabelType.Low:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            case LabelType.High:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            default: 
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : (value).toString());
          }
        }
      };
      let locGenOption = {
        floor: this.businessForm.value.Sun02[0],
        ceil: 24,
        disabled: false,
        translate: (value: number, label: LabelType): string => {
          switch (label) {
            case LabelType.Low:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            case LabelType.High:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            default: 
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : (value).toString());
          }
        }
      };
      this.options[6] = Object.assign({}, iniGenOption, {disabled: ("SUN" in opeHour ? 0 : 1)});
      this.options02[6] = Object.assign({}, locGenOption, {disabled: ("SUN" in opeHour ? 0 : 1)});
    } else {
      this.options[6] = Object.assign({}, this.genOption, {disabled: ("SUN" in opeHour ? 0 : 1)});
    }

    this.spinnerService.stop(spinnerRef);
  }

  onServiceChange(event){
    if (event.value == "") {return;}
    var spinnerRef = this.spinnerService.start($localize`:@@business-ope.loadopeninghours:`);
    this.businessForm.reset({BusinessId: '', OperationHours: '', Mon:[8,17], Mon02:[18,24], MonEnabled: 0, Tue:[8,17], Tue02:[18,24], TueEnabled: 0, Wed:[8,17], Wed02:[18,24], WedEnabled: 0, Thu:[8,17], Thu02:[18,24], ThuEnabled: 0, Fri:[8,17], Fri02:[18,24], FriEnabled: 0, Sat:[8,17], Sat02:[18,24], SatEnabled: 0, Sun:[8,17], Sun02:[18,24], SunEnabled: 0});

    this.options[0] = Object.assign({}, this.genOption);
    this.options[1] = Object.assign({}, this.genOption);
    this.options[2] = Object.assign({}, this.genOption);
    this.options[3] = Object.assign({}, this.genOption);
    this.options[4] = Object.assign({}, this.genOption);
    this.options[5] = Object.assign({}, this.genOption);
    this.options[6] = Object.assign({}, this.genOption);

    this.options02[0] = Object.assign({}, this.genOption);
    this.options02[1] = Object.assign({}, this.genOption);
    this.options02[2] = Object.assign({}, this.genOption);
    this.options02[3] = Object.assign({}, this.genOption);
    this.options02[4] = Object.assign({}, this.genOption);
    this.options02[5] = Object.assign({}, this.genOption);
    this.options02[6] = Object.assign({}, this.genOption);

    this.newInterval[0] = "0";
    this.newInterval[1] = "0";
    this.newInterval[2] = "0";
    this.newInterval[3] = "0";
    this.newInterval[4] = "0";
    this.newInterval[5] = "0";
    this.newInterval[6] = "0";

    let loc = this.serviceData.filter(x => x.LocationId == event.value.split('#')[0]);
    let serv = loc[0].Services.filter(y => y.ProviderId == event.value.split('#')[1]);

    this.providerId = serv[0].ProviderId;
    this.locationId = loc[0].LocationId;

    var opeHour = JSON.parse(serv[0].OperationHours);
    this.businessForm.setValue({
      BusinessId: this.businessId,
      OperationHours: serv[0].OperationHours,
      Mon: ("MON" in opeHour ? [+opeHour.MON[0].I, +opeHour.MON[0].F] : [8, 12]),
      Mon02: ("MON" in opeHour ? (opeHour.MON.length > 1 ? [+opeHour.MON[1].I, +opeHour.MON[1].F] : [0,0]) : [0, 0]),
      MonEnabled: ("MON" in opeHour ? 1 : 0),
      Tue: ("TUE" in opeHour ? [+opeHour.TUE[0].I, +opeHour.TUE[0].F] : [8, 12]),
      Tue02: ("TUE" in opeHour ? (opeHour.TUE.length > 1 ? [+opeHour.TUE[1].I, +opeHour.TUE[1].F] : [0,0]) : [0, 0]),
      TueEnabled: ("TUE" in opeHour ? 1 : 0),
      Wed: ("WED" in opeHour ? [+opeHour.WED[0].I, +opeHour.WED[0].F] : [8, 12]),
      Wed02: ("WED" in opeHour ? (opeHour.WED.length > 1 ? [+opeHour.WED[1].I, +opeHour.WED[1].F] : [0,0]) : [0, 0]),
      WedEnabled: ("WED" in opeHour ? 1 : 0),
      Thu: ("THU" in opeHour ? [+opeHour.THU[0].I, +opeHour.THU[0].F] : [8, 12]),
      Thu02: ("THU" in opeHour ? (opeHour.THU.length > 1 ? [+opeHour.THU[1].I, +opeHour.THU[1].F] : [0,0]) : [0, 0]),
      ThuEnabled: ("THU" in opeHour ? 1 : 0),
      Fri: ("FRI" in opeHour ? [+opeHour.FRI[0].I, +opeHour.FRI[0].F] : [8, 12]),
      Fri02: ("FRI" in opeHour ? (opeHour.FRI.length > 1 ? [+opeHour.FRI[1].I, +opeHour.FRI[1].F] : [0,0]) : [0, 0]),
      FriEnabled: ("FRI" in opeHour ? 1 : 0),
      Sat: ("SAT" in opeHour ? [+opeHour.SAT[0].I, +opeHour.SAT[0].F] : [8, 12]),
      Sat02: ("SAT" in opeHour ? (opeHour.SAT.length > 1 ? [+opeHour.SAT[1].I, +opeHour.SAT[1].F] : [0,0]) : [0, 0]),
      SatEnabled: ("SAT" in opeHour ? 1 : 0),
      Sun: ("SUN" in opeHour ? [+opeHour.SUN[0].I, +opeHour.SUN[0].F] : [8, 12]),
      Sun02: ("SUN" in opeHour ? (opeHour.SUN.length > 1 ? [+opeHour.SUN[1].I, +opeHour.TUE[1].F] : [0,0]) : [0, 0]),
      SunEnabled: ("SUN" in opeHour ? 1 : 0),
    });

    if (this.businessForm.value.Mon02[0] > 0){
      this.newInterval[0] = "1";
      let iniGenOption = {
        floor: 0,
        ceil: this.businessForm.value.Mon02[0]-1,
        disabled: false,
        translate: (value: number, label: LabelType): string => {
          switch (label) {
            case LabelType.Low:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            case LabelType.High:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            default: 
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : (value).toString());
          }
        }
      };
      let locGenOption = {
        floor: this.businessForm.value.Mon02[0],
        ceil: 24,
        disabled: false,
        translate: (value: number, label: LabelType): string => {
          switch (label) {
            case LabelType.Low:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            case LabelType.High:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            default: 
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : (value).toString());
          }
        }
      };
      this.options[0] = Object.assign({}, iniGenOption, {disabled: ("MON" in opeHour ? 0 : 1)});
      this.options02[0] = Object.assign({}, locGenOption, {disabled: ("MON" in opeHour ? 0 : 1)});
    } else {
      this.options[0] = Object.assign({}, this.genOption, {disabled: ("MON" in opeHour ? 0 : 1)});
    }
    if (this.businessForm.value.Tue02[0] > 0){
      this.newInterval[1] = "1";
      let iniGenOption = {
        floor: 0,
        ceil: this.businessForm.value.Tue02[0]-1,
        disabled: false,
        translate: (value: number, label: LabelType): string => {
          switch (label) {
            case LabelType.Low:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            case LabelType.High:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            default: 
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : (value).toString());
          }
        }
      };
      let locGenOption = {
        floor: this.businessForm.value.Tue02[0],
        ceil: 24,
        disabled: false,
        translate: (value: number, label: LabelType): string => {
          switch (label) {
            case LabelType.Low:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            case LabelType.High:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            default: 
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : (value).toString());
          }
        }
      };
      this.options[1] = Object.assign({}, iniGenOption, {disabled: ("TUE" in opeHour ? 0 : 1)});
      this.options02[1] = Object.assign({}, locGenOption, {disabled: ("TUE" in opeHour ? 0 : 1)});
    } else {
      this.options[1] = Object.assign({}, this.genOption, {disabled: ("TUE" in opeHour ? 0 : 1)});
    }
    if (this.businessForm.value.Wed02[0] > 0){
      this.newInterval[2] = "1";
      let iniGenOption = {
        floor: 0,
        ceil: this.businessForm.value.Wed02[0]-1,
        disabled: false,
        translate: (value: number, label: LabelType): string => {
          switch (label) {
            case LabelType.Low:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            case LabelType.High:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            default: 
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : (value).toString());
          }
        }
      };
      let locGenOption = {
        floor: this.businessForm.value.Wed02[0],
        ceil: 24,
        disabled: false,
        translate: (value: number, label: LabelType): string => {
          switch (label) {
            case LabelType.Low:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            case LabelType.High:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            default: 
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : (value).toString());
          }
        }
      };
      this.options[2] = Object.assign({}, iniGenOption, {disabled: ("WED" in opeHour ? 0 : 1)});
      this.options02[2] = Object.assign({}, locGenOption, {disabled: ("WED" in opeHour ? 0 : 1)});
    } else {
      this.options[2] = Object.assign({}, this.genOption, {disabled: ("WED" in opeHour ? 0 : 1)});
    }
    if (this.businessForm.value.Thu02[0] > 0){
      this.newInterval[3] = "1";
      let iniGenOption = {
        floor: 0,
        ceil: this.businessForm.value.Thu02[0]-1,
        disabled: false,
        translate: (value: number, label: LabelType): string => {
          switch (label) {
            case LabelType.Low:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            case LabelType.High:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            default: 
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : (value).toString());
          }
        }
      };
      let locGenOption = {
        floor: this.businessForm.value.Thu02[0],
        ceil: 24,
        disabled: false,
        translate: (value: number, label: LabelType): string => {
          switch (label) {
            case LabelType.Low:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            case LabelType.High:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            default: 
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : (value).toString());
          }
        }
      };
      this.options[3] = Object.assign({}, iniGenOption, {disabled: ("THU" in opeHour ? 0 : 1)});
      this.options02[3] = Object.assign({}, locGenOption, {disabled: ("THU" in opeHour ? 0 : 1)});
    } else {
      this.options[3] = Object.assign({}, this.genOption, {disabled: ("THU" in opeHour ? 0 : 1)});
    }
    if (this.businessForm.value.Fri02[0] > 0){
      this.newInterval[4] = "1";
      let iniGenOption = {
        floor: 0,
        ceil: this.businessForm.value.Fri02[0]-1,
        disabled: false,
        translate: (value: number, label: LabelType): string => {
          switch (label) {
            case LabelType.Low:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            case LabelType.High:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            default: 
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : (value).toString());
          }
        }
      };
      let locGenOption = {
        floor: this.businessForm.value.Fri02[0],
        ceil: 24,
        disabled: false,
        translate: (value: number, label: LabelType): string => {
          switch (label) {
            case LabelType.Low:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            case LabelType.High:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            default: 
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : (value).toString());
          }
        }
      };
      this.options[4] = Object.assign({}, iniGenOption, {disabled: ("FRI" in opeHour ? 0 : 1)});
      this.options02[4] = Object.assign({}, locGenOption, {disabled: ("FRI" in opeHour ? 0 : 1)});
    } else {
      this.options[4] = Object.assign({}, this.genOption, {disabled: ("FRI" in opeHour ? 0 : 1)});
    }
    if (this.businessForm.value.Sat02[0] > 0){
      this.newInterval[5] = "1";
      let iniGenOption = {
        floor: 0,
        ceil: this.businessForm.value.Sat02[0]-1,
        disabled: false,
        translate: (value: number, label: LabelType): string => {
          switch (label) {
            case LabelType.Low:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            case LabelType.High:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            default: 
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : (value).toString());
          }
        }
      };
      let locGenOption = {
        floor: this.businessForm.value.Sat02[0],
        ceil: 24,
        disabled: false,
        translate: (value: number, label: LabelType): string => {
          switch (label) {
            case LabelType.Low:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            case LabelType.High:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            default: 
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : (value).toString());
          }
        }
      };
      this.options[5] = Object.assign({}, iniGenOption, {disabled: ("SAT" in opeHour ? 0 : 1)});
      this.options02[5] = Object.assign({}, locGenOption, {disabled: ("SAT" in opeHour ? 0 : 1)});
    } else {
      this.options[5] = Object.assign({}, this.genOption, {disabled: ("SAT" in opeHour ? 0 : 1)});
    }
    if (this.businessForm.value.Sun02[0] > 0){
      this.newInterval[6] = "1";
      let iniGenOption = {
        floor: 0,
        ceil: this.businessForm.value.Sun02[0]-1,
        disabled: false,
        translate: (value: number, label: LabelType): string => {
          switch (label) {
            case LabelType.Low:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            case LabelType.High:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            default: 
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : (value).toString());
          }
        }
      };
      let locGenOption = {
        floor: this.businessForm.value.Sun02[0],
        ceil: 24,
        disabled: false,
        translate: (value: number, label: LabelType): string => {
          switch (label) {
            case LabelType.Low:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            case LabelType.High:
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
            default: 
              return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : (value).toString());
          }
        }
      };
      this.options[6] = Object.assign({}, iniGenOption, {disabled: ("SUN" in opeHour ? 0 : 1)});
      this.options02[6] = Object.assign({}, locGenOption, {disabled: ("SUN" in opeHour ? 0 : 1)});
    } else {
      this.options[6] = Object.assign({}, this.genOption, {disabled: ("SUN" in opeHour ? 0 : 1)});
    }

    this.spinnerService.stop(spinnerRef);
  }

  updateData(event, tipo){
    this.updateParentHours$ = this.businessService.updateBusinessParms(this.businessId, this.locationId, this.providerId, (event.checked == true ? 1 : 0), tipo).pipe(
      map((res: any) => {
        if (res.Code == 200){
          this.providerParentHours = (event.checked == true ? 1 : 0);
          this.openSnackBar($localize`:@@business-ope.updatedata:`,$localize`:@@business-ope.openinghours:`);
        }
      }),
      catchError(err => {
        this.providerParentHours = (!event.checked == true ? 1 : 0);
        this.openSnackBar($localize`:@@shared.wrong:`,$localize`:@@business-ope.openinghours:`);
        return err;
      })
    );
  }

  learnMore(textNumber: number){
    let message = '';
    switch(textNumber) { 
      case 10: { 
        message = $localize`:@@learnMore.LMCON10:`;
        break; 
      }
      case 11: { 
        message = $localize`:@@learnMore.LMCON11:`;
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