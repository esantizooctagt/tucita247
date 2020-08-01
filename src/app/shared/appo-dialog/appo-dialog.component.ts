import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { SpinnerService } from '../spinner.service';
import { catchError, map } from 'rxjs/operators';
import { AppointmentService } from '@app/services/appointment.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmValidParentMatcher } from '@app/validators';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface DialogData {
  businessId: string;
  locationId: string;
  providerId: string;
  appoTime: string;
  appoDate: string;
  doors: string[];
}

@Component({
  selector: 'app-appo-dialog',
  templateUrl: './appo-dialog.component.html',
  styleUrls: ['./appo-dialog.component.scss']
})
export class AppoDialogComponent implements OnInit {
  newAppointment$: Observable<any>;
  purpose$: Observable<any[]>;
  doors: string[];

  get f(){
    return this.clientForm.controls;
  }

  confirmValidParentMatcher = new ConfirmValidParentMatcher();
  
  constructor(
    public dialogRef: MatDialogRef<AppoDialogComponent>,
    private spinnerService: SpinnerService,
    private _snackBar: MatSnackBar,
    private appointmentService: AppointmentService,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) { }

  clientForm = this.fb.group({
    Phone: ['',[Validators.maxLength(17)]],
    Name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    Email: ['', [Validators.maxLength(200), Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]],
    DOB: [''],
    Gender: [''],
    Door: [''],
    Preference: [''],
    Purpose: [''],
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
    var spinnerRef = this.spinnerService.start("Loading Data...");
    this.purpose$ = this.appointmentService.getPurpose(this.data.businessId).pipe(
      map((res: any) => {
        this.spinnerService.stop(spinnerRef);
        return res.Purpose;
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        return err;
      })
    );
  }

  onNoClick(){
    this.dialogRef.close();
  }

  addNewAppo(){
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
    let formData = {
      BusinessId: this.data.businessId,
      LocationId: this.data.locationId,
      ProviderId: this.data.providerId,
      AppoDate: this.data.appoDate,
      AppoHour: this.data.appoTime.replace('-',':'),
      Door: this.clientForm.value.Door,
      Phone: (phoneNumber == '' ?  '00000000000' : (phoneNumber.length <= 10 ? '1' + phoneNumber : phoneNumber)),
      Name: this.clientForm.value.Name,
      Email: (this.clientForm.value.Email == '' ? '' : this.clientForm.value.Email),
      DOB: dob,
      Gender: (this.clientForm.value.Gender == '' ? '': this.clientForm.value.Gender),
      Preference: (this.clientForm.value.Preference == '' ? '': this.clientForm.value.Preference),
      Disability: (this.clientForm.value.Disability == null ? '': this.clientForm.value.Disability),
      Purpose: this.clientForm.value.Purpose.toString(),
      Guests: this.clientForm.value.Guests,
      Status: 1,
      Type: 1
    }
    var spinnerRef = this.spinnerService.start("Adding Appointment...");
    this.newAppointment$ = this.appointmentService.postNewAppointment(formData).pipe(
      map((res: any) => {
        this.spinnerService.stop(spinnerRef);
        this.openSnackBar("Appointment created succesfully","Schedule");
        this.dialogRef.close();
        return res.Code;
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        this.openSnackBar("Error on created appointment, try again","Schedule");
        return err;
      })
    );
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
    if (component === 'Guests'){
      return this.f.Guests.hasError('required') ? 'You must enter a value' :
      this.f.Guests.hasError('maxlength') ? 'Maximun length 2' :
        this.f.Guests.hasError('min') ? 'Minimun value 1' :
          this.f.Guests.hasError('max') ? 'Maximun value 99' :
            '';
    }
  }

}
