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

  doors: string[];
  serviceId: string = '';
  businessId: string = '';
  locationId: string = '';
  providerId: string = '';
  newTime: string = '';
  varGuests: number = 1;
  maxGuests: number = 1;
  dayInfo: any[]=[];

  services: any[]=[];

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
    Phone: ['',[Validators.maxLength(17)]],
    Name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    Email: ['', [Validators.maxLength(200), Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]],
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
          this.services = res.services.filter(x => x.Selected === 1);
        } else {
          this.services = res.services.filter(x => x.ServiceId == this.serviceId);
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
      Phone: (phoneNumber == '' ?  '00000000000' : (phoneNumber.length <= 10 ? '1' + phoneNumber : phoneNumber)),
      Name: this.clientForm.value.Name,
      Email: (this.clientForm.value.Email == '' ? '' : this.clientForm.value.Email),
      DOB: dob,
      Gender: (this.clientForm.value.Gender == '' ? '': this.clientForm.value.Gender),
      Preference: (this.clientForm.value.Preference == '' ? '': this.clientForm.value.Preference),
      Disability: (this.clientForm.value.Disability == null ? '': this.clientForm.value.Disability),
      Guests: this.clientForm.value.Guests,
      Status: 1,
      Type: 1
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

  getErrorMessage(component: string){
    const val200 = '200';
    const val3 = '3';
    const val100 = '100';
    const val6 = '6';
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
    let res = this.services.filter(x => x.ServiceId == event.value);
    let validTime: number = 0;
    if (res.length > 0) { this.maxGuests = res[0].CustomerPerBooking; }
    let dateAppo = (this.data.appoTime.substring(6,8) == 'PM' ? (+this.data.appoTime.substring(0,2) == 12 ? this.data.appoTime.substring(0,2) : +this.data.appoTime.substring(0,2)+12) : this.data.appoTime.substring(0,2));
    for (var _i = 0; _i < 1; _i++) {
      let data = this.dayInfo.filter(x => (x.Time.substring(6,8) == 'PM' ? (+x.Time.substring(0,2) == 12 ? +x.Time.substring(0,2) : +x.Time.substring(0,2)+12) : +x.Time.substring(0,2)) == +dateAppo+_i);
      if (data.length > 0){        
        if (data[0].Available > 0 && (data[0].ServiceId == '' || data[0].ServiceId == event.value)){
          this.newTime = +dateAppo+res[0].TimeService > 12 ? (+dateAppo+res[0].TimeService-12).toString().padStart(2,'0') + ':00 PM' : (+dateAppo+res[0].TimeService).toString().padStart(2,'0') +':00 AM';
          validTime = 1;
        } else {
          validTime = 0;
          this.clientForm.patchValue({ServiceId: ''});
          this.openSnackBar($localize`:@@appos.invalidserv:`, $localize`:@@appos.schedule:`);
          break;
        }
      } else {
        validTime = 0;
        this.clientForm.patchValue({ServiceId: ''});
        this.openSnackBar($localize`:@@appos.invalidserv:`, $localize`:@@appos.schedule:`);
        break;
      }
    }
  }

  addGuests(){
    if (this.clientForm.value.ServiceId == '') {return;}
    let data = this.services.filter(x => x.ServiceId == this.clientForm.value.ServiceId);
    let allowCustomer: number = data[0]['CustomerPerBooking'];
    this.varGuests = (this.varGuests+1 > allowCustomer ? this.varGuests : this.varGuests+1);
    this.clientForm.patchValue({Guests: this.varGuests});
  }

  remGuests(){
    this.varGuests = (this.varGuests > 1 ? this.varGuests-1 : this.varGuests);
    this.clientForm.patchValue({Guests: this.varGuests});
  }

}
