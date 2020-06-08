import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmValidParentMatcher } from '@app/validators';
import { UserService } from "@app/services";
import { map, catchError, tap } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { AuthService } from '@core/services';
import { SpinnerService } from '@app/shared/spinner.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from '@app/shared/dialog/dialog.component';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-reset',
  templateUrl: './reset.component.html',
  styleUrls: ['./reset.component.scss']
})
export class ResetComponent implements OnInit {
  resetForm: FormGroup;

  userReset$:Observable<any>;
  resetId:string = '';
  userId:string = '';
  code:string = '';
  loading = false;
  hide = true;
  hideconf = true;
  error = '';

  confirmValidParentMatcher = new ConfirmValidParentMatcher();

  readonly passKey = environment.passKey;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private spinnerService: SpinnerService,
    private route: ActivatedRoute,
    private usersService: UserService,
    private router: Router,
    private dialog: MatDialog
  ) {
    if (this.authService.currentUserValue) { 
      this.router.navigate(['/']);
    }

    this.resetForm = this.fb.group({
      Passwords : this.fb.group({
        password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20), Validators.pattern("(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9]{8,}")]],
        confpassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20), Validators.pattern("(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9]{8,}")]]
      }, {validator: this.checkPasswords})
    });
  }

  get f() { return this.resetForm.controls; }

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
    this.userId = this.route.snapshot.paramMap.get('user');
    this.code = this.route.snapshot.paramMap.get('code');
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

  onSubmit() {
    if (this.resetForm.invalid) {
        return;
    }
    if (this.resetForm.touched){
      var spinnerRef = this.spinnerService.start("Reseting Password...");
      if (this.userId !== '') {  
        var CryptoJS = require("crypto-js");
        var data = this.resetForm.get('Passwords.password').value;
        var password = this.passKey;
        var ctObj = CryptoJS.AES.encrypt(data, password);
        var ctStr = ctObj.toString();

        let dataForm =  {
          Password: ctStr
        }
        this.userReset$ = this.usersService.putResetPass(this.userId, this.code, dataForm).pipe(
          tap((res: any) => { 
            if (res.Code == 200){
              this.spinnerService.stop(spinnerRef);
              this.openDialog('Users', 'Password reset successful', true, false, false);
              this.router.navigate(['/login']);
            } else {
              this.spinnerService.stop(spinnerRef);
              this.openDialog('Users', 'The new password must be different', false, true, false);
            }
          }),
          catchError(err => {
            this.spinnerService.stop(spinnerRef);
            this.openDialog('Error !', err.Message, false, true, false);
            return throwError(err || err.message);
          })
        );
      }
    }
  }

}
