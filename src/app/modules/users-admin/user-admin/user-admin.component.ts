import { Component, OnInit, Input } from '@angular/core';
import { User, Role } from '@app/_models';
import { FormBuilder, Validators } from '@angular/forms';
import { AdminService } from "@app/services";
import { AuthService } from '@core/services';
import { Router, ActivatedRoute } from '@angular/router';
import { MonitorService } from "@shared/monitor.service";
import { ConfirmValidParentMatcher } from '@app/validators';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from '@app/shared/dialog/dialog.component';
import { Subscription, Observable, throwError } from 'rxjs';
import { tap, catchError, map, switchMap } from 'rxjs/operators';
import { SpinnerService } from '@app/shared/spinner.service';
import { environment } from '@environments/environment';
import { PasswordValidators } from '@app/validators';

@Component({
  selector: 'app-user-admin',
  templateUrl: './user-admin.component.html',
  styleUrls: ['./user-admin.component.scss']
})
export class UserAdminComponent implements OnInit {

  get f(){
    return this.userForm.controls;
  }

  userData: string = '';
  statTemp: number = 0;
  invalid: number = 0;
  userAct$: Observable<any>;
  businessId: string='';
  changesUser: Subscription;
  roles$: Observable<Role[]>;
  availability$: Observable<any>;
  userSave$: Observable<any>;
  user$: Observable<User>;
  hide = true;
  emailValidated: boolean = false;
  loadingUser: boolean = false;
  savingUser: boolean = false;
  userDataList: string="";
  textStatus: string ="";

  readonly passKey = environment.passKey;

  readonly countryLst = environment.countryList;
  phCountry: string = '(XXX) XXX-XXXX';
  code: string = '+1';
  //variable to handle errors on inputs components
  confirmValidParentMatcher = new ConfirmValidParentMatcher();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private adminService: AdminService,
    private spinnerService: SpinnerService,
    private route: ActivatedRoute,
    private router: Router,
    private data: MonitorService,
    private dialog: MatDialog
  ) { }
  // (?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!#$%&?])[a-zA-Z0-9!#$%&?]{8,}
  userForm = this.fb.group({
    UserId: [''],
    BusinessId: [''],
    Email: ['', [Validators.required, Validators.maxLength(200), Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]],
    First_Name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    Last_Name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    Password: ['',[Validators.required, Validators.minLength(8), Validators.maxLength(20), PasswordValidators.strong]],
    Avatar: [''],
    Phone: ['', [Validators.maxLength(17), Validators.minLength(7)]],
    CountryCode: ['PRI'],
    RoleId: ['', [Validators.required]],
    Status: [1]
  })

  ngOnInit(): void {
    this.data.handleData('Add');
    this.userDataList = this.route.snapshot.paramMap.get('userId');

    var spinnerRef = this.spinnerService.start($localize`:@@userloc.loadingusersingle:`);
    this.businessId = this.authService.businessId();

    this.roles$ = this.adminService.getRoles(this.businessId + '/10/_/_').pipe(
      map((res: any) => {
        if (res != null) {
          this.spinnerService.stop(spinnerRef);
          return res.roles;
        }
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        this.openDialog($localize`:@@shared.error:`, err.Message, false, true, false);
        return throwError(err || err.Message);
      })
    );
    
    this.onValueChanges();
    this.onDisplay();
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

  getErrorMessage(component: string) {
    const val200 = '200';
    const val3 = '3';
    const val100 = '100';
    const val7 = '7';
    const val17 = '17';
    if (component === 'Email'){
      return this.f.Email.hasError('required') ? $localize`:@@login.error:` :
        this.f.Email.hasError('notUnique') ? $localize`:@@shared.emailregis:`:
          this.f.Email.hasError('maxlength') ? $localize`:@@shared.maximun: ${val200}` :
            this.f.Email.hasError('pattern') ? $localize`:@@forgot.emailformat:` :
            '';
    }
    if (component === 'First_Name'){
      return this.f.First_Name.hasError('required') ? $localize`:@@shared.entervalue:` :
          this.f.First_Name.hasError('minlength') ? $localize`:@@shared.minimun: ${val3}` :
            this.f.First_Name.hasError('maxlength') ? $localize`:@@shared.maximun: ${val100}` :
              '';
    }
    if (component === 'Last_Name'){
      return this.f.Last_Name.hasError('required') ? $localize`:@@shared.entervalue:` :
          this.f.Last_Name.hasError('minlength') ? $localize`:@@shared.minimun: ${val3}` :
            this.f.Last_Name.hasError('maxlength') ? $localize`:@@shared.maximun: ${val100}` :
              '';
    }
    if (component === 'Phone'){
      return this.f.Phone.hasError('minlength') ? $localize`:@@shared.minimun: ${val7}` :
            this.f.Phone.hasError('maxlength') ? $localize`:@@shared.maximun: ${val17}` :
              '';
    }
    if (component === 'RoleId'){
      return this.f.RoleId.hasError('required') ? $localize`:@@shared.invalidselectvalue:` :
        '';
    }
  }

  onValueChanges(): void {
    this.changesUser = this.userForm.valueChanges.subscribe(val=>{
      if (val.Status === true) {
        this.userForm.controls["Status"].setValue(1);
      }
      if (val.Status === false){
        this.userForm.controls["Status"].setValue(0);
      }
    })
  }

  onDisplay(){
    if (this.userDataList != undefined && this.userDataList != "0"){
      if (this.businessId == ''){
        this.businessId = this.authService.businessId();
      }
      this.statTemp = 0;
      var spinnerRef = this.spinnerService.start($localize`:@@userloc.loadingusersingle:`);
      this.userForm.reset({UserId:'', BusinessId: '', Email: '', First_Name: '', Last_Name: '', Password: '', Avatar: '', Phone: '', CountryCode: '', RoleId: 'None', Status: 1});
      this.user$ = this.adminService.getUser(this.userDataList, this.businessId).pipe(
        tap(user => {
          if (user.User_Id != undefined){
            this.userForm.controls.Email.disable();
            if (user.CountryCode != '' && user.CountryCode != undefined){
              let codCountry = this.countryLst.filter(x => x.Country == user.CountryCode)[0];
              this.phCountry = codCountry.PlaceHolder;
              this.code = codCountry.Code;
            }
            this.userForm.setValue({
              UserId: user.User_Id,
              BusinessId: user.Business_Id,
              Email: user.Email,
              First_Name: user.First_Name,
              Last_Name: user.Last_Name,
              Password: '',
              Avatar: '',
              CountryCode: user.CountryCode,
              Phone: user.Phone.replace(this.code.replace(/[^0-9]/g,''), ''),
              RoleId: user.Role_Id,
              // Is_Admin: user.Is_Admin,
              Status: user.Status
            });
            this.userForm.get('Email').clearValidators();
            this.userForm.get('Email').updateValueAndValidity();
            this.userForm.get('Password').clearValidators();
            this.userForm.get('Password').updateValueAndValidity();
            this.textStatus = (user.Status == 0 ? $localize`:@@shared.disabled:` : $localize`:@@shared.enabled:`);
          } else {
            this.invalid = 1;
          }
          this.statTemp = user.Status;
          this.spinnerService.stop(spinnerRef);
          return user;   
        }),
        catchError(err => {
          this.spinnerService.stop(spinnerRef);
          this.openDialog($localize`:@@shared.error:`, err.Message, false, true, false);
          return throwError(err || err.Message);
        })
      );
    }
  }

  onSubmit(){
    if (this.userForm.invalid) {
      return;
    }
    if (this.userForm.touched){
      let userId = this.userForm.value.UserId;
      var spinnerRef = this.spinnerService.start($localize`:@@users.savinguser:`);
      if (userId !== '' && userId !== null) {  
        let dataForm =  {
          "UserId": userId,
          "BusinessId": this.businessId,
          "Email": this.userForm.value.Email,
          "First_Name": this.userForm.value.First_Name,
          "Last_Name": this.userForm.value.Last_Name,
          "Password": '', //this.userForm.value.Password,
          "Phone": this.code.toString().replace(/\D/g, '') + this.userForm.value.Phone.replace(/\D/g, ''),
          "CountryCode": this.userForm.value.CountryCode,
          "RoleId": this.userForm.value.RoleId,
          "Status": (this.statTemp === 3 ? 3 : this.userForm.value.Status)
        }
        this.userSave$ = this.adminService.updateUser(dataForm).pipe(
          tap(res => { 
            this.savingUser = true;
            this.spinnerService.stop(spinnerRef);
            this.emailValidated = false;
            this.userForm.controls.Email.enable();
            this.userData = '';
            this.statTemp = 0;
            this.userForm.reset({UserId:'', BusinessId: '', Email: '', First_Name: '', Last_Name: '', Password: '', Avatar: '', Phone: '', CountryCode: '', RoleId: 'None', Status: 1});
            this.data.changeData('users-admin');
            this.openDialog($localize`:@@users.usertexts:`, $localize`:@@userloc.userupdated:`, true, false, false);
            this.router.navigate(['/users-admin']);
          }),
          catchError(err => {
            this.spinnerService.stop(spinnerRef);
            this.savingUser = false;
            this.openDialog($localize`:@@shared.error:`, err.Message, false, true, false);
            return throwError(err || err.message);
          })
        );
      } else {
        let userLoggedId = this.authService.userId();
        var CryptoJS = require("crypto-js");
        var data = this.userForm.value.Password;
        var password = this.passKey;
        var ctObj = CryptoJS.AES.encrypt(data, password);
        var ctStr = ctObj.toString();
        let dataForm = { 
          "BusinessId": this.businessId,
          "Email": this.userForm.value.Email,
          "First_Name": this.userForm.value.First_Name,
          "Last_Name": this.userForm.value.Last_Name,
          "Password": ctStr,
          "Phone": this.code.toString().replace(/\D/g, '') + this.userForm.value.Phone.replace(/\D/g, ''),
          "CountryCode": this.userForm.value.CountryCode,
          "RoleId": this.userForm.value.RoleId
        }
        this.userSave$ = this.adminService.postUser(dataForm).pipe(
          tap(res => { 
            this.savingUser = true;
            this.spinnerService.stop(spinnerRef);
            this.emailValidated = false;
            this.userForm.controls.Email.enable();
            this.userData = '';
            this.statTemp = 0;
            this.userForm.reset({UserId:'', BusinessId: '', Email: '', First_Name: '', Last_Name: '', Password: '', Avatar: '', Phone: '', CountryCode: '', RoleId: 'None', Status: 1});
            this.data.changeData('users-admin');
            this.openDialog($localize`:@@users.usertexts:`, $localize`:@@userloc.usercreated:`, true, false, false);
          }),
          catchError(err => {
            this.spinnerService.stop(spinnerRef);
            this.savingUser = false;
            this.openDialog($localize`:@@shared.error:`, err.Message, false, true, false);
            return throwError(err || err.message);
          })
        );
      }
    }
  }

  onCancel(){
    this.router.navigate(['/users-admin']);
  }

  // allow only digits and dot
  onKeyPress(event, value): boolean { 
    const charCode = (event.which) ? event.which : event.keyCode;
    let perc: string = value.toString();
    var count = (perc.match(/[.]/g) || []).length;
    if (count  == 1) {
      if (charCode == 46) return false;
    }
    if (charCode == 46) return true;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  ngOnDestroy() {
    this.changesUser.unsubscribe();
  }

  changeValues($event){
    this.userForm.patchValue({CountryCode: $event.value, Phone: ''});
    this.phCountry = this.countryLst.filter(x=>x.Country === $event.value)[0].PlaceHolder;
    this.code = this.countryLst.filter(x=>x.Country === $event.value)[0].Code;
  }

}
