import { Component, OnInit, Inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { AppointmentService, ServService } from '@app/services';
import { AuthService } from '@app/core/services';
import { SpinnerService } from '@app/shared/spinner.service';
import { map, catchError } from 'rxjs/operators';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { ConfirmValidParentMatcher } from '@app/validators';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface DialogData {
  timeZone: string;
  businessId: string;
  locationId: string;
  providerId: string;
  door: string;
  services: any[];
  buckets: [];
  hours: any[];
  providers: any[];
}

@Component({
  selector: 'app-appowi-dialog',
  templateUrl: './appowi-dialog.component.html',
  styleUrls: ['./appowi-dialog.component.scss']
})
export class AppowiDialogComponent implements OnInit {
  base: DialogData;
  maxGuests: number = 1;
  TimeZone: string = '';
  businessId: string = '';
  locationId: string = '';
  providerId: string = '';
  doorId: string = '';
  onError: string = '';
  services: any[]=[];
  buckets=[];
  hours: any[]=[];
  Providers: any[]=[];
  numGuests: number = 0;
  search: number = 0;
  currEmail: string = '';

  newAppointment$: Observable<any>;
  hours$: Observable<any>;
  getLocInfo$: Observable<any>;
  getCustomer$: Observable<any>;

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
    private dialogRef: MatDialogRef<AppowiDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) { }

  clientForm = this.fb.group({
    Phone: ['',[Validators.maxLength(17)]],
    Name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    ServiceId: ['', [Validators.required]],
    Hour: ['', [Validators.required]],
    Email: ['', [Validators.maxLength(200), Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]],
    DOB: [''],
    Gender: [''],
    Preference: ['1'],
    Disability: [''],
    Guests: ['1', [Validators.required, (control: AbstractControl) => Validators.max(this.maxGuests)(control), Validators.min(1)]],
    ProviderId: ['']
  })

  ngOnInit(): void {
    this.businessId = this.data.businessId;
    this.locationId = this.data.locationId;
    this.providerId = this.data.providerId;
    this.TimeZone = this.data.timeZone;
    this.doorId = this.data.door;
    this.services = this.data.services;
    this.buckets = this.data.buckets;
    this.hours = this.data.hours;
    this.Providers = this.data.providers;
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
    });
  }

  addAppointment(){
    let timeAppo = this.getTimeAppo();
    if (!this.clientForm.valid) {return;}
    //AGREGAR WALK IN Y APPOINTMENT
    let dobClient: Date = this.clientForm.value.DOB;
    let dob: string = '';
    if (dobClient.toString() == '') {
      dob = '';
    } else {
      let month = (dobClient.getMonth()+1).toString().padStart(2, '0'); 
      let day = dobClient.getDate().toString().padStart(2, '0');
      dob = dobClient.getUTCFullYear().toString() + '-' + month + '-' + day;
    }
    let phoneNumber = this.clientForm.value.Phone.toString().replace(/[^0-9]/g,'');
    let yearCurr = this.getYear();
    let monthCurr = this.getMonth();
    let dayCurr = this.getDay();
    let dateAppo = yearCurr + '-' + monthCurr + '-' + dayCurr;
    let typeAppo = ((this.clientForm.value.Hour).toString() == "--" ? 2 : 1);
    let formData = {
      BusinessId: this.businessId,
      LocationId: this.locationId,
      ProviderId: (this.providerId != '0' ? this.providerId : this.clientForm.value.ProviderId),
      ServiceId: this.clientForm.value.ServiceId,
      BusinessName: (this.authService.businessName().length > 27 ? this.authService.businessName().substring(0,27)+'...' : this.authService.businessName()),
      Language: this.authService.businessLanguage(),
      Door: this.doorId,
      Phone: (phoneNumber == '' ?  '00000000000' : (phoneNumber.length <= 10 ? '1' + phoneNumber : phoneNumber)),
      Name: this.clientForm.value.Name,
      Email: (this.clientForm.value.Email == '' ? '' : this.clientForm.value.Email),
      DOB: dob,
      Gender: (this.clientForm.value.Gender == '' ? '': this.clientForm.value.Gender),
      Preference: (this.clientForm.value.Preference == '' ? '': this.clientForm.value.Preference),
      Disability: (this.clientForm.value.Disability == null ? '': this.clientForm.value.Disability),
      Guests: this.clientForm.value.Guests,
      AppoDate: dateAppo,
      AppoHour: ((this.clientForm.value.Hour).toString() == "--" ? timeAppo : (this.clientForm.value.Hour).toString().padStart(2,'0')+':00'),
      Type: typeAppo,
      UpdEmail: (this.currEmail != this.clientForm.value.Email && this.currEmail != '' ? 1 : 0)
    }

    let options = {
      timeZone: this.TimeZone,
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    },
    formatter = new Intl.DateTimeFormat([], options);
    var actualTime = formatter.format(new Date());
    let actTime = +actualTime.replace(':','-').substring(0,2);

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
        } else {
          this.onError = $localize`:@@shared.wrong:`;
        }
        return this.onError;
      })
    );
  }

  loadCustomer(){
    let phoneNumber = this.clientForm.value.Phone.toString().replace(/[^0-9]/g,'');
    let phone = (phoneNumber == '' ?  '00000000000' : (phoneNumber.length <= 10 ? '1' + phoneNumber : phoneNumber));
    if (phone != '00000000000'){
      this.search = 1;
      this.getCustomer$ = this.appointmentService.getMobile(phone).pipe(
        map((res: any) => {
          if (res.Code == 200){
            this.clientForm.patchValue(
              { Name: res.Customer.Name, 
                Email: res.Customer.Email,
                Preference: res.Customer.Preferences.toString(), 
                Disability: res.Customer.Disability.toString(), 
                Gender: res.Customer.Gender.toString(),
                DOB: res.Customer.DOB }
            );
            this.currEmail = res.Customer.Email;
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

  onProvChange(event){
    this.hours = [];
    this.getLocInfo$ = this.serviceService.getServicesProvider(this.businessId, event.value).pipe(
      map((res: any) =>{
        this.services = res.services.filter(x => x.Selected === 1);
        return res;
      }),
      catchError(err => {
        this.onError = err.Message;
        return '0';
      })
    );
  }

  getErrorMessage(component: string){
    const val200 = '200';
    const val3 = '3';
    const val2 = '2';
    const val1 = '1';
    const val6 = '6';
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
    if (component === 'ServiceId'){
      return this.f.ServiceId.hasError('required') ? $localize`:@@shared.invalidselectvalue:` :
            '';
    }
    if (component === 'ProviderId'){
      return this.f.ProviderId.hasError('required') ? $localize`:@@shared.invalidselectvalue:` :
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

  validateService(event){
    let res = this.services.filter(x => x.ServiceId == event.value);
    if (res.length > 0) { this.maxGuests = res[0].CustomerPerBooking; }
    this.clientForm.patchValue({'Guests': 1});

    this.hours$ = this.appointmentService.getAvailability(this.businessId, this.locationId, this.clientForm.value.ProviderId, event.value).pipe(
      map((res: any) => {
        if (res.Code == 200){
          // this.hours = res.Hours;
          return res.Hours;
          // this.openSnackBar($localize`:@@host.checkoutsuccess:`, $localize`:@@host.checkoutpop:`);
        }
      }),
      catchError(err => {
        this.onError = err.Message;
        this.openSnackBar($localize`:@@shared.wrong:`, $localize`:@@host.checkoutpop:`);
        return this.onError;
      })
    );
  }

  getTimeAppo(): string{
    let options = {
      timeZone: this.TimeZone,
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
    var min: number = 0;
    var actTime: number = 0;
    actTime = hour;
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

}
