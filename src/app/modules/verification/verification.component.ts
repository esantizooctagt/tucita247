import { Component, OnInit } from '@angular/core';
import { AuthService } from '@app/core/services';
import { UserService } from '@app/services';
import { ConfirmValidParentMatcher } from '@app/validators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PasswordValidators } from '@app/validators';
import { SpinnerService } from '@app/shared/spinner.service';
import { catchError, tap } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from '@app/shared/dialog/dialog.component';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-verification',
  templateUrl: './verification.component.html',
  styleUrls: ['./verification.component.scss']
})
export class VerificationComponent implements OnInit {
  verifForm: FormGroup;
  public error: string = '';
  loading = false;
  hide = true;
  hideconf = true;
  userId: string = '';
  code: number = 0;
  passTemp: string = '';
  userAct$: Observable<any>;

  readonly passKey = environment.passKey;

  confirmValidParentMatcher = new ConfirmValidParentMatcher();

  constructor(
    private fb: FormBuilder,
    private usersService: UserService,
    private router: Router,
    private spinnerService: SpinnerService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private dialog: MatDialog
  ) { 
    // redirect to home if already logged in
    if (this.authService.currentUserValue) { 
      this.router.navigate(['/']);
    }
    this.verifForm = this.fb.group({
      userCode: ['', [Validators.required]],
      Passwords : this.fb.group({
        temppassword: ['', [Validators.minLength(8), Validators.maxLength(20), PasswordValidators.strong]],
        password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20), PasswordValidators.strong]],
        confpassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20), PasswordValidators.strong]]
      }, {validator: this.checkPasswords})
    });
  }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('userId');
    this.code = +this.route.snapshot.paramMap.get('code');
    console.log("prev pass temp");
    this.passTemp = this.route.snapshot.paramMap.get('password');
    if (this.passTemp != undefined && this.passTemp != ''){
      this.verifForm.get('Passwords.temppassword').patchValue(this.passTemp);
    }
    if (this.code != undefined && this.code > 0){
      this.verifForm.get('userCode').patchValue(this.code);
    }
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

  checkPasswords(fb: FormGroup) {
    let confirmPswrdCtrl = fb.get('confpassword');
    if(confirmPswrdCtrl.errors === null || 'notSame' in confirmPswrdCtrl.errors){
      if(fb.get('password').value !== confirmPswrdCtrl.value)
        confirmPswrdCtrl.setErrors({notSame:true});
      else
        confirmPswrdCtrl.setErrors(null);
    }
  }

  onSubmit(){
    if (this.code != 0){
      if (this.code != this.verifForm.value.userCode) {
        this.error = $localize`:@@verification.invalidcode:`;
        return;
      } 
      if (this.code != 0 && this.verifForm.get('Passwords.password').value == ''){
        this.error = $localize`:@@verification.enterpassword:`;
        return;
      }
      let dataForm;
      if (this.code != 0){
        // if (this.verifForm.invalid) { return; }
        var CryptoJS = require("crypto-js");
        var data = this.verifForm.get('Passwords.password').value;
        var password = this.passKey;
        var ctObj = CryptoJS.AES.encrypt(data, password);
        var ctStr = ctObj.toString();

        dataForm = {
          UserId: this.userId,
          Password: ctStr
        }
      } else {
        dataForm = '';
        return;
      }
      var spinnerRef = this.spinnerService.start($localize`:@@verification.actaccount:`);
      this.userAct$ = this.usersService.putVerifCode(this.code, dataForm).pipe(
        tap((res: any) => { 
          if (res.Code == 200){
            this.spinnerService.stop(spinnerRef);
            this.router.navigate(['/login']);
          } else {
            this.spinnerService.stop(spinnerRef);
            this.openDialog($localize`:@@reset.titleusers:`, $localize`:@@verification.erroraccount:`, false, true, false);
          }
        }),
        catchError(err => {
          this.spinnerService.stop(spinnerRef);
          this.openDialog($localize`:@@shared.error:`, err.Message, false, true, false);
          return throwError(err || err.message);
        })
      );
    } else {
      let dataForm;
      this.verifForm.patchValue({'userCode': 0});
      if (this.verifForm.invalid) { return; }
      var CryptoJS = require("crypto-js");
      var data = this.verifForm.get('Passwords.password').value;
      var password = this.passKey;
      var ctObj = CryptoJS.AES.encrypt(data, password);
      var ctStr = ctObj.toString();

      dataForm = {
        UserId: this.userId,
        Password: ctStr
      }
      var spinnerRef = this.spinnerService.start($localize`:@@verification.actaccount:`);
      this.userAct$ = this.usersService.putActivationAccount(dataForm).pipe(
        tap((res: any) => { 
          if (res.Code == 200){
            this.spinnerService.stop(spinnerRef);
            this.router.navigate(['/login']);
          } else {
            this.spinnerService.stop(spinnerRef);
            this.openDialog($localize`:@@reset.titleusers:`, $localize`:@@verification.erroraccount:`, false, true, false);
          }
        }),
        catchError(err => {
          this.spinnerService.stop(spinnerRef);
          this.openDialog($localize`:@@shared.error:`, err.Message, false, true, false);
          return throwError(err || err.message);
        })
      );
    }
  }
}
