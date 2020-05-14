import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { User, Role } from '@app/_models';
import { FormBuilder, Validators } from '@angular/forms';
import { UserService, LocationsService, RolesService } from "@app/services";
import { AuthService } from '@core/services';
import { Router } from '@angular/router';
import { MonitorService } from "@shared/monitor.service";
import { ConfirmValidParentMatcher } from '@app/validators';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from '@app/shared/dialog/dialog.component';
import { Subscription, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { SpinnerService } from '@app/shared/spinner.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  @Input() user: User;

  get f(){
    return this.userForm.controls;
  }

  userData: string = '';
  statTemp: number = 0;
  message$: Observable<string>;
  userAct$: Observable<any>;
  companyId: string='';
  changesUser: Subscription;
  locations$: Observable<any[]>; //StoreDocto
  roles$: Observable<Role[]>;
  displayForm: boolean = true;
  availability$: Observable<any>;
  userSave$: Observable<any>;
  user$: Observable<User>;
  hide = true;
  emailValidated: boolean = false;
  loadingUser: boolean = false;
  savingUser: boolean = false;

  //variable to handle errors on inputs components
  confirmValidParentMatcher = new ConfirmValidParentMatcher();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private usersService: UserService,
    private rolesService: RolesService,
    private locationService: LocationsService,
    private spinnerService: SpinnerService,
    private router: Router,
    private data: MonitorService,
    private dialog: MatDialog
  ) { }
  
  userForm = this.fb.group({
    UserId: [''],
    CompanyId: [''],
    Email: ['', [Validators.required, Validators.maxLength(200), Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]],
    First_Name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    Last_Name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    Password: ['',[Validators.minLength(8), Validators.maxLength(20), Validators.pattern("(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!#$%&?])[a-zA-Z0-9!#$%&?]{8,}")]],
    Avatar: [''],
    LocationId: [''],
    RoleId: ['', [Validators.required]],
    MFact_Auth: [''],
    Is_Admin: [{value: 0, disabled: true}],
    Status: [1]
  })

  ngOnInit(): void {
    this.companyId = this.authService.companyId();
    this.message$ = this.data.monitorMessage;
    this.loadStores();
    this.loadRoles();
    this.onValueChanges();
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
    if (component === 'Email'){
      return this.f.Email.hasError('required') ? 'You must enter an Email' :
        this.f.Email.hasError('maxlength') ? 'Maximun length 200' :
          this.f.Email.hasError('pattern') ? 'Invalid Email' :
          '';
    }
    if (component === 'First_Name'){
      return this.f.First_Name.hasError('required') ? 'You must enter a value' :
          this.f.First_Name.hasError('minlength') ? 'Minimun length 3' :
            this.f.First_Name.hasError('maxlength') ? 'Maximun length 100' :
              '';
    }
    if (component === 'Last_Name'){
      return this.f.Last_Name.hasError('required') ? 'You must enter a value' :
          this.f.Last_Name.hasError('minlength') ? 'Minimun length 3' :
            this.f.Last_Name.hasError('maxlength') ? 'Maximun length 100' :
              '';
    }
    if (component === 'RoleId'){
      return this.f.RoleId.hasError('required') ? 'You must select a value' :
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
      if (val.Is_Admin === true) {
        this.userForm.controls["Is_Admin"].setValue(1);
      }
      if (val.Is_Admin === false){
        this.userForm.controls["Is_Admin"].setValue(0);
      }
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    // changes.prop contains the old and the new value...
    if (changes.user.currentValue != undefined) {
      this.userData = '';
      this.statTemp = 0;
      var spinnerRef = this.spinnerService.start("Loading User...");
      let userResult = changes.user.currentValue;
      this.userForm.reset({UserId:'', CompanyId: '', Email: '', First_Name: '', Last_Name: '', Password: '', Avatar: '', LocationId: '', RoleId: 'None', MFact_Auth: '', Is_Admin: 0, Status: 1});
      this.user$ = this.usersService.getUser(userResult.User_Id).
        pipe(
          tap(user => { 
            this.userForm.controls.UserName.disable();
            if (user.Is_Admin === 1){
              this.userForm.controls['RoleId'].clearValidators();
            } else {
              this.userForm.controls['RoleId'].setValidators([Validators.required]);
            }
            this.userForm.setValue({
              UserId: user.User_Id,
              CompanyId: user.Company_Id,
              Email: user.Email,
              First_Name: user.First_Name,
              Last_Name: user.Last_Name,
              Password: '',
              Avatar: '',
              MFact_Auth: user.MFact_Auth,
              LocationId: user.Location_Id,
              RoleId: (user.Is_Admin === 1 ? 'None' : user.Role_Id),
              Is_Admin: user.Is_Admin,
              Status: user.Status
            });
            this.userData = user.User_Name;
            this.statTemp = user.Status;
            this.spinnerService.stop(spinnerRef);
          }),
          catchError(err => {
            this.spinnerService.stop(spinnerRef);
            this.openDialog('Error !', err.Message, false, true, false);
            return throwError(err || err.Message);
          })
        );
    } else {
      this.userData = '';
      this.statTemp = 0;
      this.userForm.reset({UserId:'', CompanyId: '', Email: '', First_Name: '', Last_Name: '', Password: '', Avatar: '', LocationId: '', RoleId: 'None', MFact_Auth: '', Is_Admin: 0, Status: 1});
    }
  }
  
  loadStores(){
    // this.stores$ = this.storeService.getStoresDoctos(this.companyId);
  }

  loadRoles(){
    this.roles$ = this.rolesService.getRoles(this.companyId);
  }

  onSubmit(){
    if (this.userForm.invalid) {
      return;
    }
    if (this.userForm.touched){
      let userId = this.userForm.value.UserId;
      var spinnerRef = this.spinnerService.start("Saving User...");
      if (userId !== '' && userId !== null) {  
        let userLoggedId = this.authService.userId();
        let dataForm =  {
          "Email": this.userForm.value.Email,
          "First_Name": this.userForm.value.First_Name,
          "Last_Name": this.userForm.value.Last_Name,
          "Password": '', //this.userForm.value.Password,
          "LocationId": this.userForm.value.LocationId,
          "UserLogId": userLoggedId,
          "RoleId": this.userForm.value.RoleId,
          "MFact_Auth": this.userForm.value.MFact_Auth,
          "Status": (this.statTemp === 3 ? 3 : this.userForm.value.Status),
          "LanguageId": ''
        }
        this.userSave$ = this.usersService.updateUser(userId, dataForm).pipe(
          tap(res => { 
            this.savingUser = true;
            this.spinnerService.stop(spinnerRef);
            this.emailValidated = false;
            this.userForm.controls.UserName.enable();
            this.userData = '';
            this.statTemp = 0;
            this.userForm.reset({UserId:'', CompanyId: '', Email: '', First_Name: '', Last_Name: '', Password: '', Avatar: '', LocationId: '', RoleId: 'None', MFact_Auth: '', Is_Admin: 0, Status: 1});
            this.data.changeData('users');
            this.openDialog('Users', 'User updated successful', true, false, false);
          }),
          catchError(err => {
            this.spinnerService.stop(spinnerRef);
            this.savingUser = false;
            this.openDialog('Error !', err.Message, false, true, false);
            return throwError(err || err.message);
          })
        );
      } else {
        let userLoggedId = this.authService.userId();
        var CryptoJS = require("crypto-js");
        var data = this.userForm.value.Password;
        var password = "K968G66S4dC1Y5tNA5zKGT5KIjeMcpc8";
        var ctObj = CryptoJS.AES.encrypt(data, password);
        var ctStr = ctObj.toString();
        let dataForm = { 
          "CompanyId": this.companyId,
          "Email": this.userForm.value.Email,
          "First_Name": this.userForm.value.First_Name,
          "Last_Name": this.userForm.value.Last_Name,
          "Password": ctStr,
          "LocationId": this.userForm.value.LocationId,
          "RoleId": this.userForm.value.RoleId,
          "MFact_Auth": this.userForm.value.MFact_Auth,
          "UserLogId": userLoggedId,
          "LanguageId": ''
        }
        this.userSave$ = this.usersService.postUser(dataForm).pipe(
          tap(res => { 
            this.savingUser = true;
            this.spinnerService.stop(spinnerRef);
            this.emailValidated = false;
            this.userForm.controls.UserName.enable();
            this.userData = '';
            this.statTemp = 0;
            this.userForm.reset({UserId:'', CompanyId: '', Email: '', First_Name: '', Last_Name: '', Password: '', Avatar: '', LocationId: '', RoleId: 'None', MFact_Auth: '', Is_Admin: 0, Status: 1});
            this.data.changeData('users');
            this.openDialog('Users', 'User created successful', true, false, false);
          }),
          catchError(err => {
            this.spinnerService.stop(spinnerRef);
            this.savingUser = false;
            this.openDialog('Error !', err.Message, false, true, false);
            return throwError(err || err.message);
          })
        );
      }
    }
  }

  onCancel(){
    this.userForm.controls['RoleId'].setValidators([Validators.required]);
    this.emailValidated = false;
    this.userData = '';
    this.statTemp = 0;
    this.userForm.controls.UserName.enable();
    this.userForm.reset({UserId:'', CompanyId: '', Email: '', First_Name: '', Last_Name: '', Password: '', Avatar: '', LocationId: '', RoleId: 'None', MFact_Auth: '', Is_Admin: 0, Status: 1});
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

  onSendCode(){
    let userId = this.userForm.value.UserId;
    let userName = this.userData;
    if (userName == '' && userId == '') {
      return;
    }
    
    var spinnerRef = this.spinnerService.start("Sending activation code...");
    this.userAct$ = this.usersService.putVerifCode(userName, '0', '').pipe(
      tap((res: any) => { 
        this.spinnerService.stop(spinnerRef);
        if (res.Code == 200){
          this.openDialog('Users', 'Code send successfully', true, false, false);
        } else {
          this.openDialog('Users', 'Error activating account try again', false, true, false);
        }
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        this.openDialog('Error !', err.Message, false, true, false);
        return throwError(err || err.message);
      })
    );
  }

  checkEmailAvailability(data) { 
    this.emailValidated = false;
    if (data.target.value != ''){
      this.loadingUser = true;
      this.availability$ = this.usersService.validateEmail(data.target.value).pipe(
        tap((result: any) => { 
          this.emailValidated = true;
          if (result.Available == 0){
            this.userForm.controls.UserName.setErrors({notUnique: true});
          }
          this.loadingUser = false;
          return result; 
        })
      );
    }
  }

}
