import { Component, OnInit, Inject, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { SpinnerService } from '../spinner.service';
import { catchError, map, tap } from 'rxjs/operators';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmValidParentMatcher } from '@app/validators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ServService, AppointmentService } from '@app/services';
import { AuthService } from '@app/core/services';
import { environment } from '@environments/environment';

export interface DialogData {   
  businessId: string;
  locationId: string;
  providerId: string;
  serviceId: string;
  appoTime: string;
  appoDate: string;
  doors: string[];
  dayData: any[];
}

@Component({
  selector: 'app-appo-dialog',
  templateUrl: './appo-dialog.component.html',
  styleUrls: ['./appo-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppoDialogComponent implements OnInit {
  newAppointment$: Observable<any>;
  services$: Observable<any[]>;
  getCustomer$: Observable<any>;

  search: number = 0;
  currEmail: string = '';
  onError: string = '';
  doors: string[];
  serviceId: string = '';
  businessId: string = '';
  locationId: string = '';
  providerId: string = '';
  newTime: string = '';
  varGuests: number = 1;
  maxGuests: number = 1;
  dayInfo: any[]=[];

  timeHr45 = [0,55,70,85,100,155,170,185,200,255,270,285,300,355,370,385,400,455,470,485,500,555,570,585,600];
  timeHr30 = [0,15,70,85,100,115,170,185,200,215,270,285,300,315,370,385,400,415,470,485,500,515,570,585,600];
  timeHr15 = [0,15,30,85,100,115,130,185,200,215,230,285,300,315,330,385,400,415,430,485,500,515,530,585,600];
  timeHr = [0,15,30,45,100,115,130,145,200,215,230,245,300,315,330,345,400,415,430,445,500,515,530,545,600];

  services: any[]=[];

  readonly countryLst = environment.countryList;
  phCountry: string = '(XXX) XXX-XXXX';
  code: string = '+1';

  get f(){
    return this.clientForm.controls;
  }

  confirmValidParentMatcher = new ConfirmValidParentMatcher();

  constructor(
    public dialogRef: MatDialogRef<AppoDialogComponent>,
    private spinnerService: SpinnerService,
    private _snackBar: MatSnackBar,
    private serviceService: ServService,
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  clientForm = this.fb.group({
    Phone: ['',[Validators.maxLength(17), Validators.minLength(7)]],
    Name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    Email: ['', [Validators.maxLength(200), Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]],
    CountryCode: ['PRI'],
    DOB: [''],
    Gender: [''],
    Door: [''],
    Preference: ['1'],
    ServiceId: ['',[Validators.required]],
    Disability: [''],
    Guests: ['1', [Validators.required, Validators.max(99), Validators.min(1)]]
  })

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
    });
  }

  ngOnInit(): void {
    this.doors = this.data.doors;
    this.serviceId = this.data.serviceId;
    this.businessId = this.data.businessId;
    this.providerId = this.data.providerId;
    this.dayInfo = this.data.dayData;

    if (this.doors.length > 0){
      const toSelect = this.doors.find(c => c == this.doors[0]);
      this.clientForm.get('Door').setValue(toSelect);
    }

    var spinnerRef = this.spinnerService.start($localize`:@@lite.loadingdata:`);
    this.services$ = this.serviceService.getServicesProvider(this.businessId, this.providerId).pipe(
      map((res: any) =>{
        this.spinnerService.stop(spinnerRef);
        if (this.serviceId == ''){
          this.services = res.services.sort((a, b) => (a.Name < b.Name ? -1 : 1)).filter(x => x.Selected === 1);
        } else {
          this.services = res.services.sort((a, b) => (a.Name < b.Name ? -1 : 1)).filter(x => x.ServiceId == this.serviceId);
        }
        return res;
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        this.openSnackBar($localize`:@@shared.wrong:`,$localize`:@@shared.error:`);
        return err;
      })
    )
  }

  onNoClick(){
    this.dialogRef.close();
  }

  addNewAppo(){
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    var currdate = yyyy+'-'+mm+'-'+dd;

    let dobClient: Date = this.clientForm.value.DOB;
    let dob: string = '';
    if (dobClient.toString() == '') {
      dob = '';
    } else {
      let month = (dobClient.getMonth()+1).toString().padStart(2, '0'); 
      let day = dobClient.getDate().toString().padStart(2, '0');
      dob = dobClient.getUTCFullYear().toString() + '-' + month + '-' + day;
    }
    
    //NEW FULL APPOINTMENT
    let phoneNumber = this.clientForm.value.Phone.replace( /\D+/g, '');
    let dateAppo = (this.data.appoTime.substring(6,8) == 'PM' ? (+this.data.appoTime.substring(0,2) == 12 ? this.data.appoTime.substring(0,2) : +this.data.appoTime.substring(0,2)+12) : this.data.appoTime.substring(0,2).padStart(2,'0'));
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
      BusinessId: this.data.businessId,
      LocationId: this.data.locationId,
      ProviderId: this.data.providerId,
      BusinessName: (this.authService.businessName().length > 27 ? this.authService.businessName().substring(0,27)+'...' : this.authService.businessName()),
      Language: this.authService.businessLanguage(),
      ServiceId: this.clientForm.value.ServiceId,
      AppoDate: this.data.appoDate,
      AppoHour: dateAppo+'-'+this.data.appoTime.substring(3,5),
      Door: this.clientForm.value.Door,
      Phone: (phoneNumber == '' ?  '00000000000' : this.code.toString().replace(/[^0-9]/g,'') + phoneNumber),
      CountryCode: this.code.toString().replace(/[^0-9]/g,''),
      Country: this.clientForm.value.CountryCode,
      Name: this.clientForm.value.Name,
      Email: (this.clientForm.value.Email == '' ? '' : this.clientForm.value.Email),
      DOB: dob,
      Gender: (this.clientForm.value.Gender == '' ? '': this.clientForm.value.Gender),
      Preference: (this.clientForm.value.Preference == '' ? '': this.clientForm.value.Preference),
      Disability: (this.clientForm.value.Disability == null ? '': this.clientForm.value.Disability),
      Guests: this.clientForm.value.Guests,
      Status: 1,
      Type: 1,
      UpdEmail: updE
    }
    var spinnerRef = this.spinnerService.start($localize`:@@host.addingappo:`);
    this.newAppointment$ = this.appointmentService.postNewAppointment(formData).pipe(
      map((res: any) => {
        let enviar = '';
        this.openSnackBar($localize`:@@appos.created:`, $localize`:@@appos.schedule:`);

        this.dialogRef.close({newAppo: 'OK', data: enviar}); 
        this.spinnerService.stop(spinnerRef);
        return res.Code;
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        if (err.Status == 404){
          this.openSnackBar($localize`:@@shared.invalidDateTime:`, $localize`:@@appos.schedule:`);
        } else {
          this.openSnackBar($localize`:@@shared.wrong:`, $localize`:@@appos.schedule:`);
        }
        this.dialogRef.close({newAppo: 'OK'});
        return err;
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
            let dateDOB = new Date(res.Customer.DOB+'T06:00:00');
            if (JSON.stringify(res.Customer) != '{}'){
              this.clientForm.patchValue(
                { Name: res.Customer.Name, 
                  Email: res.Customer.Email,
                  Preference: res.Customer.Preferences.toString(), 
                  Disability: res.Customer.Disability.toString(), 
                  Gender: res.Customer.Gender.toString(),
                  DOB: (res.Customer.DOB == '' || res.Customer.DOB == 'None' ? '' : dateDOB) }
              );
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

  getErrorMessage(component: string){
    const val200 = '200';
    const val3 = '3';
    const val100 = '100';
    const val6 = '7';
    const val14 = '14';
    const val1 = '1';
    const val2 = '2';
    const val99 = '99';
    if (component === 'Email'){
      return this.f.Email.hasError('required') ?  $localize`:@@shared.entervalue:` :
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
    if (component === 'Phone'){
      return this.f.Phone.hasError('minlength') ? $localize`:@@shared.minimun: ${val6}` :
        this.f.Phone.hasError('maxlength') ? $localize`:@@shared.maximun: ${val14}` :
          '';
    }
    if (component === 'ServiceId'){
      return this.f.ServiceId.hasError('required') ? $localize`:@@shared.invalidselectvalue:` :
        '';
    }
    if (component === 'Guests'){
      return this.f.Guests.hasError('required') ? $localize`:@@shared.entervalue:` :
      this.f.Guests.hasError('maxlength') ? $localize`:@@shared.maximun: ${val2}` :
        this.f.Guests.hasError('min') ? $localize`:@@shared.minvalue: ${val1}` :
          this.f.Guests.hasError('max') ? $localize`:@@shared.maxvalue: ${val99}` :
            '';
    }
  }

  validateService(event){
    let res = this.services.sort((a, b) => (a.Name < b.Name ? -1 : 1)).filter(x => x.ServiceId == event.value);
    let validTime: number = 0;
    let minInit = this.data.appoTime.substring(0,5).replace(':','').substring(2,4);
    let timeInit = +(this.data.appoTime.substring(0,5).replace(':',''));
    let intTime;
    let calcTime;

    if (res.length > 0) { this.maxGuests = res[0].CustomerPerBooking; }
    this.newTime = '';
    
    if (+minInit == 0){
      intTime = +this.timeHr[this.timeHr.indexOf(+res[0].TimeService)];
      calcTime = +this.timeHr[this.timeHr.indexOf(+res[0].TimeService)-1];
    } 
    if (+minInit == 15){
      intTime = +this.timeHr15[this.timeHr.indexOf(+res[0].TimeService)];
      calcTime = +this.timeHr15[this.timeHr.indexOf(+res[0].TimeService)-1];
    }
    if (+minInit == 30){
      intTime = +this.timeHr30[this.timeHr.indexOf(+res[0].TimeService)];
      calcTime = +this.timeHr30[this.timeHr.indexOf(+res[0].TimeService)-1];
    }
    if (+minInit == 45){
      intTime = +this.timeHr45[this.timeHr.indexOf(+res[0].TimeService)];
      calcTime = +this.timeHr45[this.timeHr.indexOf(+res[0].TimeService)-1];
    }
    intTime = timeInit+intTime;
    calcTime = timeInit+calcTime;
    let dateAppo = '';
    if (intTime < 1200){
      dateAppo = ' ' + this.data.appoTime.substring(6,8);
    } else {
      if (intTime > 1245){
        intTime = intTime-1200;
      }
      dateAppo = ' PM';
    }
    let dateAppoCalc = '';
    if (calcTime < 1200){
      dateAppoCalc = ' ' + this.data.appoTime.substring(6,8);
    } else {
      if (calcTime > 1245){
        calcTime = calcTime-1200;
      }
      dateAppoCalc = ' PM';
    }
    let nTime = intTime.toString().padStart(4,"0").substring(0,2)+':'+intTime.toString().padStart(4,"0").substring(2,4) + dateAppo;
    let cTime = calcTime.toString().padStart(4,"0").substring(0,2)+':'+calcTime.toString().padStart(4,"0").substring(2,4) + dateAppoCalc;
    let data = this.dayInfo.filter(x => x.Time >= this.data.appoTime.replace('-',':') && x.Time <= cTime);
    for (var _i = 0; _i < data.length-1; _i++){
      if (data[_i].Available > 0 && (data[_i].ServiceId == '' || data[_i].ServiceId == event.value)){
        this.newTime = nTime;
        validTime = 1;
      } else {
        validTime = 0;
        this.newTime = '';
        this.clientForm.patchValue({ServiceId: ''});
        this.openSnackBar($localize`:@@appos.invalidserv:`, $localize`:@@appos.schedule:`);
        break;
      }
    }
    if (data.length < 0){
      validTime = 0;
      this.newTime = '';
      this.clientForm.patchValue({ServiceId: ''});
      this.openSnackBar($localize`:@@appos.invalidserv:`, $localize`:@@appos.schedule:`);  
    }
  }

  addGuests(){
    if (this.clientForm.value.ServiceId == '') {return;}
    let data = this.services.sort((a, b) => (a.Name < b.Name ? -1 : 1)).filter(x => x.ServiceId == this.clientForm.value.ServiceId);
    let allowCustomer: number = data[0]['CustomerPerBooking'];
    this.varGuests = (this.varGuests+1 > allowCustomer ? this.varGuests : this.varGuests+1);
    this.clientForm.patchValue({Guests: this.varGuests});
  }

  remGuests(){
    this.varGuests = (this.varGuests > 1 ? this.varGuests-1 : this.varGuests);
    this.clientForm.patchValue({Guests: this.varGuests});
  }

  changeValues($event){
    this.clientForm.patchValue({CountryCode: $event.value, Phone: ''});
    this.phCountry = this.countryLst.filter(x=>x.Country === $event.value)[0].PlaceHolder;
    this.code = this.countryLst.filter(x=>x.Country === $event.value)[0].Code;
  }

}
