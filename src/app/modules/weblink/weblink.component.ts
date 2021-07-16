import { Component, OnInit, Inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { empty, Observable } from 'rxjs';
import { AppointmentService, ServService } from '@app/services';
import { AuthService } from '@app/core/services';
import { SpinnerService } from '@app/shared/spinner.service';
import { map, catchError } from 'rxjs/operators';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { ConfirmValidParentMatcher } from '@app/validators';
import { DialogComponent } from '@app/shared/dialog/dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { environment } from '@environments/environment';

export interface DialogData {
  timeZone: string;
  business: any;
  businessId: string;
  locationId: string;
}

@Component({
  selector: 'app-weblink',
  templateUrl: './weblink.component.html',
  styleUrls: ['./weblink.component.scss']
})
export class WeblinkComponent implements OnInit {
  base: DialogData;
  maxGuests: number = 1;
  TimeZone: string = '';
  business: any;
  businessId: string = '';
  locationId: string = '';
  providerId: string = '';
  serviceId: string = '';
  doorId: string = '';
  onError: string = '';

  locations: any[]=[];
  providers: any[]=[];
  services: any[]=[];
  hours: any[]=[];

  locId: string = '';
  provId: string = '';
  servId: string = '';

  numGuests: number = 0;
  search: number = 0;
  currEmail: string = '';

  now = new Date();
  plusYear = new Date();
  dateAppo: any;

  currHour: number = 0;
  bucketInterval: number = 0;

  enabledCustomG: boolean = false;

  newAppointment$: Observable<any>;
  hours$: Observable<any>;
  getLocInfo$: Observable<any>;
  getCustomer$: Observable<any>;

  readonly countryLst = environment.countryList;
  phCountry: string = '(XXX) XXX-XXXX';
  code: string = '+1';

  displayHours: number = 0;
  loadingData: number = 0;

  get f(){
    return this.clientForm.controls;
  }

  confirmValidParentMatcher = new ConfirmValidParentMatcher();

  constructor(
    private spinnerService: SpinnerService,
    private _snackBar: MatSnackBar,
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private serviceService: ServService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<WeblinkComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {}

  clientForm = this.fb.group({
    Phone: ['',[Validators.maxLength(17), Validators.minLength(7)]],
    Name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    LocationId: [''],
    ProviderId: [''],
    ServiceId: [''],
    Hour: ['', [Validators.required]],
    Email: ['', [Validators.maxLength(200), Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]],
    CountryCode: ['PRI'],
    DOB: [''],
    Gender: [''],
    Preference: ['1'],
    Disability: [''],
    Comments: [''],
    Custom: [''],
    Guests: ['1', [Validators.required, (control: AbstractControl) => Validators.max(this.maxGuests)(control), Validators.min(1)]]
  })

  ngOnInit(): void {
    this.plusYear.setMonth(this.now.getMonth() + 12);

    this.business = this.data.business;
    this.businessId = this.data.businessId;
    this.locationId = this.data.locationId;
    this.providerId = "0";
    this.serviceId = "0";
    this.TimeZone = this.data.timeZone;

    this.dateAppo = "";
    this.clientForm.patchValue({LocationId: this.locationId, ProviderId: this.providerId, ServiceId: this.serviceId});
    this.locations = this.business.Locs;
    let locSel = this.locations.filter(x=> x.LocationId == this.locationId);
    this.providers = locSel[0].Provs.sort((a, b) => (a.Name < b.Name ? -1 : 1));
    this.services = this.business.Services.sort((a, b) => (a.Name < b.Name ? -1 : 1)); 
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

  addAppointment(){
    if (this.locId == '' && this.provId == '' && this.servId == '') {return;}
    if (!this.clientForm.valid) {return;}
    //AGREGAR WALK IN Y APPOINTMENT
    let phoneNumber = this.clientForm.value.Phone.toString().replace(/[^0-9]/g,'');
    let dobClient: Date = this.clientForm.value.DOB;
    let dob: string = '';
    if (dobClient.toString() == '') {
      dob = '';
    } else {
      let month = (dobClient.getMonth()+1).toString().padStart(2, '0'); 
      let day = dobClient.getDate().toString().padStart(2, '0');
      dob = dobClient.getUTCFullYear().toString() + '-' + month + '-' + day;
    }
    let dateApp: Date = this.dateAppo;
    let month = (dateApp.getMonth()+1).toString().padStart(2, '0'); 
    let day = dateApp.getDate().toString().padStart(2, '0');
    let dateAppointment = dateApp.getUTCFullYear().toString() + '-' + month + '-' + day;
    
    let updE: number;
    if (this.currEmail != ''){
      if (this.currEmail != this.clientForm.value.Email){
        updE = 1;
      } else {
        updE = 0;
      }
    } else {
      if (this.clientForm.value.Email != ''){
        updE = 1;
      } else {
        updE = 0;
      }
    }
    let formData = {
      BusinessId: this.businessId,
      LocationId: this.locId,
      ProviderId: this.provId,
      ServiceId: this.servId,
      BusinessName: this.business.Name,
      Language: 'es',
      Door: this.doorId,
      Phone: (phoneNumber == '' ?  '00000000000' : this.code.toString().replace(/[^0-9]/g,'') + phoneNumber),
      CountryCode: this.code.toString().replace(/[^0-9]/g,''),
      Country: this.clientForm.value.CountryCode,
      Name: this.clientForm.value.Name,
      Email: (this.clientForm.value.Email == '' ? '' : this.clientForm.value.Email),
      DOB: dob,
      Gender: (this.clientForm.value.Gender == '' ? '': this.clientForm.value.Gender),
      Custom: this.clientForm.value.Custom,
      Preference: (this.clientForm.value.Preference == '' ? '': this.clientForm.value.Preference),
      Disability: (this.clientForm.value.Disability == null ? '': this.clientForm.value.Disability),
      Guests: this.clientForm.value.Guests,
      AppoDate: dateAppointment,
      AppoHour: (this.clientForm.value.Hour).toString().padStart(4,'0').substring(0,2)+':'+(this.clientForm.value.Hour).toString().padStart(4,'0').substring(2,4),
      Type: 1,
      UpdEmail: updE,
      Comments: this.clientForm.value.Comments
    }
    var spinnerRef = this.spinnerService.start($localize`:@@host.addingappo:`);
    this.newAppointment$ = this.appointmentService.postNewAppointment(formData).pipe(
      map((res: any) => {
        if (res.Code == 200){
          this.spinnerService.stop(spinnerRef);
          this.dialogRef.close();
        } else {
          this.onError = $localize`:@@shared.wrong:`;
        }
        return res.Code;
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        this.onError = err.Message;
        if (err.Status == 404){
          this.onError = $localize`:@@shared.invalidDateTime:`;
          this.openDialog($localize`:@@shared.error:`, $localize`:@@shared.invalidDateTime:`, false, true, false);
        } else {
          this.onError = $localize`:@@shared.wrong:`;
          this.openDialog($localize`:@@shared.error:`, $localize`:@@shared.wrong:`, false, true, false);
        }
        return this.onError;
      })
    );
  }

  loadCustomer(){
    let phoneNumber = this.clientForm.value.Phone.toString().replace(/[^0-9]/g,'');
    let cCode = this.clientForm.value.CountryCode;
    let phone = (phoneNumber == '' ?  '00000000000' : this.code.toString().replace(/[^0-9]/g,'') + phoneNumber);
    if (phone != '00000000000'){
      this.search = 1;
      this.getCustomer$ = this.appointmentService.getMobile(phone, cCode).pipe(
        map((res: any) => {
          if (res.Code == 200){
            let DOB = '';
            let dateDOB = new Date();
            if (res.Customer.DOB != '' && res.Customer.DOB != 'None'){
              DOB = res.Customer.DOB.substring(6,10)+'-'+res.Customer.DOB.substring(3,5)+'-'+res.Customer.DOB.substring(0,2);
              dateDOB = new Date(DOB+'T06:00:00');
            }
            if (JSON.stringify(res.Customer) != '{}'){
              this.clientForm.patchValue(
                { Name: res.Customer.Name, 
                  Email: res.Customer.Email,
                  Preference: res.Customer.Preferences.toString(), 
                  Disability: res.Customer.Disability.toString(), 
                  Gender: res.Customer.Gender.toString(),
                  Custom: res.Customer.CUSTOM.toString(),
                  DOB: (res.Customer.DOB == '' || res.Customer.DOB == 'None' ? '' : dateDOB) }
              );
              if (res.Customer.Gender.toString() == 'C'){
                this.enabledCustomG = true;
              }
              this.currEmail = res.Customer.Email;
            }
            this.search = 0;
          }
          return res.Code;
        }),
        catchError(err => {
          this.onError = err.Message;
          this.search = 0;
          return this.onError;
        })
      );
    }
  }

  addGuests(){
    if (this.numGuests < this.maxGuests) {
      this.numGuests = this.numGuests+1;
    } else {
      this.numGuests = this.numGuests;
    }
    this.clientForm.patchValue({'Guests': this.numGuests});
  }

  remGuests(){
    if (this.numGuests > 1) {
      this.numGuests=this.numGuests-1;
     } else {
      this.numGuests = this.numGuests;
     }
     this.clientForm.patchValue({'Guests': this.numGuests});
  }

  onLocChange(event){
    this.locationId = event.value;
    this.providerId = "0";
    this.serviceId = "0";
    this.hours$ = empty();
    this.dateAppo = undefined;
    if (this.locationId != "0"){
      let locSel = this.locations.filter(x=> x.LocationId == this.locationId);
      if (locSel.length > 0){
        this.providers = locSel[0].Provs.sort((a, b) => (a.Name < b.Name ? -1 : 1));
        this.services = this.business.Services.sort((a, b) => (a.Name < b.Name ? -1 : 1)); 
      }
    } else {
      let ProvArr = [];
      this.providers = [];
      for (let i=0; i<=this.business.Locs.length-1; i++){
        for (let j=0; j<=this.business.Locs[i].Provs.length-1; j++){
          let result = ProvArr.filter(x => x.ProviderId == this.business.Locs[i].Provs[j].ProviderId);
          if (result.length == 0){
            ProvArr.push({ProviderId: this.business.Locs[i].Provs[j].ProviderId, Name: this.business.Locs[i].Provs[j].Name});
          }
        }
      }
      this.providers = ProvArr.sort((a, b) => (a.Name < b.Name ? -1 : 1));
      if (this.providers.length == 1){
        this.providerId = this.providers[0].ProviderId;
      }
    }
    if (this.providers.length == 1){
      this.clientForm.patchValue({ProviderId: this.providerId, ServiceId: '0'});
    } else {
      this.clientForm.patchValue({ProviderId: '0', ServiceId: '0'});
    }
  }

  onProvChange(event){
    this.services = [];
    this.providerId = event.value;
    this.serviceId = "0";
    this.hours$ = empty();
    this.dateAppo = undefined;
    if (event.value != "0" && this.locationId != "0"){
      let locSel = this.locations.filter(x=> x.LocationId == this.locationId);
      let provSel = locSel[0].Provs.filter(x=>x.ProviderId = this.providerId);
      this.services = provSel[0].Services.sort((a,b) => (a.Name < b.Name ? -1 : 1));
    } else {
      this.services = this.business.Services.sort((a, b) => (a.Name < b.Name ? -1 : 1));
      if (this.services.length == 1){
        this.serviceId = this.services[0].ServiceId;
      }
    }
    if (this.services.length == 1) {
      this.clientForm.patchValue({ServiceId: this.serviceId});
    } else {
      this.clientForm.patchValue({ServiceId: '0'});
    }
  }

  onServChange(event){
    this.serviceId = event.value;
    this.hours$ = empty();
    this.dateAppo = undefined;
  }

  getErrorMessage(component: string){
    const val200 = '200';
    const val3 = '3';
    const val2 = '2';
    const val1 = '1';
    const val6 = '7';
    const val14 = '14';
    const val99 = '99';
    const val100 = '100';
    const maxVal = this.maxGuests;

    if (component === 'Email'){
      return this.f.Email.hasError('required') ? $localize`:@@shared.entervalue:` :
        this.f.Email.hasError('maxlength') ? $localize`:@@shared.maximun: ${val200}` :
          this.f.Email.hasError('pattern') ? $localize`:@@forgot.emailformat:` :
          '';
    }
    if (component === 'Name'){
      return this.f.Name.hasError('required') ? $localize`:@@shared.entervalue:` :
        this.f.Name.hasError('minlength') ? $localize`:@@shared.minimun: ${val3}` :
          this.f.Name.hasError('maxlength') ? $localize`:@@shared.maximun: ${val100}` :
            '';
    }
    if (component === 'LocationId'){
      return this.f.LocationId.hasError('required') ? $localize`:@@shared.invalidselectvalue:` :
        '';
    }
    if (component === 'ProviderId'){
      return this.f.ProviderId.hasError('required') ? $localize`:@@shared.invalidselectvalue:` :
        '';
    }
    if (component === 'ServiceId'){
      return this.f.ServiceId.hasError('required') ? $localize`:@@shared.invalidselectvalue:` :
        '';
    }
    if (component === 'Hour'){
      return this.f.Hour.hasError('required') ? $localize`:@@shared.invalidselectvalue:` :
        '';
    }
    if (component === 'Phone'){
      return this.f.Phone.hasError('minlength') ? $localize`:@@shared.minimun: ${val6}` :
        this.f.Phone.hasError('maxlength') ? $localize`:@@shared.maximun: ${val14}` :
          '';
    }
    if (component === 'Guests'){
      return this.f.Guests.hasError('required') ? $localize`:@@shared.entervalue:` :
      this.f.Guests.hasError('maxlength') ? $localize`:@@shared.maximun: ${val2}` :
        this.f.Guests.hasError('min') ? $localize`:@@shared.minvalue: ${val1}` :
          this.f.Guests.hasError('max') ? $localize`:@@shared.maxvalue: ${maxVal}` :
            '';
    }
  }

  onNoClick(){
    this.dialogRef.close();
  }

  changeValues($event){
    this.clientForm.patchValue({CountryCode: $event.value, Phone: ''});
    this.phCountry = this.countryLst.filter(x=>x.Country === $event.value)[0].PlaceHolder;
    this.code = this.countryLst.filter(x=>x.Country === $event.value)[0].Code;
  }

  isSelected = (event: any) => {
    return (this.dateAppo == event) ? "selected" : null;
  }

  onSelect(event: any) {
    if (this.locationId == '0' && this.providerId == '0' && this.serviceId == '0') {return;}
    this.dateAppo = event;
    let dateApp: Date = event;
    let month = (dateApp.getMonth()+1).toString().padStart(2, '0'); 
    let day = dateApp.getDate().toString().padStart(2, '0');
    let dateAppointment =  month + '-' + day + '-' + dateApp.getUTCFullYear().toString();
    this.displayHours = 1;
    this.hours = [];
    this.clientForm.patchValue({Hour: ''});
    this.loadingData = 1;
    this.hours$ = this.appointmentService.getAvailabityLink(this.businessId, this.clientForm.value.LocationId, this.clientForm.value.ProviderId, this.clientForm.value.ServiceId, dateAppointment).pipe(
      map((res: any) => {
        if (res.Code == 200){
          this.hours = res.Hours;
          this.loadingData = 0;
          if (this.locationId != '0'){
            return this.nestGroupsBy(res.Hours, ['ProviderId', 'ServiceId']);
          }
          if (this.locationId == '0' && this.providerId != '0'){
            return this.nestGroupsBy(res.Hours, ['LocationId', 'ServiceId']);
          }
          if (this.locationId == '0' && this.providerId == '0' && this.serviceId != '0'){
            return this.nestGroupsBy(res.Hours, ['LocationId', 'ProviderId']);
          }
        }
      }),
      catchError(err => {
        this.onError = err.Message;
        console.log("error " + this.onError);
        this.openSnackBar($localize`:@@shared.wrong:`, $localize`:@@shared.error:`);
        return this.onError;
      })
    );
  }

  enableDisableRule(loId, proId, serId, hour24){
    for (let i = 0; i <= this.hours.length-1; i++){
      this.hours[i].Toggle = '0';
    }
    let findToggle = this.hours.filter(x => x.LocationId == loId && x.ProviderId == proId && x.ServiceId == serId && x.Time24 == hour24);
    if (findToggle.length > 0){
      findToggle[0].Toggle = '1';
    }
    this.locId = loId;
    this.provId = proId;
    this.servId = serId;
    this.clientForm.patchValue({Hour: hour24});
  }

  findColorToggle(provId, servId, hour24){
    let findToggle = this.hours.filter(x => x.ProviderId == provId && x.ServiceId == servId && x.Time24 == hour24);
    if (findToggle.length > 0){
      return findToggle[0].Toggle.toString() == '1' ? true : false;
    }
  }

  nestGroupsBy(arr, properties) {
    properties = Array.from(properties);
    if (properties.length === 1) {
      return this.groupBy(arr, properties[0]);
    }
    const property = properties.shift();
    var grouped = this.groupBy(arr, property);
    for (let key in grouped) {
      grouped[key] = this.nestGroupsBy(grouped[key], Array.from(properties));
    }
    return grouped;
  }

  groupBy(conversions, property) {
    return conversions.reduce((acc, obj) => {
      let key = obj[property];
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(obj);
      return acc;
    }, {});
  }

  selectGender(event){
    if (event.value == "C"){
      this.enabledCustomG = true;
    } else {
      this.enabledCustomG = false;
    }
    this.clientForm.patchValue({'Custom':''});
  }

  getTimeAppo(): string{
    let options = {
      timeZone: this.TimeZone,
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    } as const;
    let formatter = new Intl.DateTimeFormat([], options);
    var actual = formatter.format(new Date());
    var actualTime = '';
    var a = new Date();
    var hour: number = +actual.substring(0,2);
    var min: number = 0;
    var actTime: number = 0;
    var newMin;
    if (+actual.substring(3,5) < 15){
      newMin = '00';
    }
    if (+actual.substring(3,5) < 30){
      newMin = '15';
    }
    if (+actual.substring(3,5) < 45){
      newMin = '30';
    }
    if (+actual.substring(3,5) < 59){
      newMin = '45';
    }
    actualTime = hour.toString().padStart(2,'0')+':'+newMin;
    return actualTime;
  }

  getYear(): string{
    let options = {
      timeZone: this.TimeZone,
      year: 'numeric'
    } as const;
    let formatter = new Intl.DateTimeFormat([], options);
    var actual = formatter.format(new Date());
    return actual;
  }

  getMonth(): string{
    let options = {
      timeZone: this.TimeZone,
      month: 'numeric'
    } as const;
    let formatter = new Intl.DateTimeFormat([], options);
    var actual = formatter.format(new Date());
    return actual.padStart(2,'0');
  }

  getDay(): string{
    let options = {
      timeZone: this.TimeZone,
      day: 'numeric'
    } as const;
    let formatter = new Intl.DateTimeFormat([], options);
    var actual = formatter.format(new Date());
    return actual.padStart(2,'0');
  }

}
