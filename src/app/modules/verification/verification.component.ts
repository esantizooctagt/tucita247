import { Component, OnInit } from '@angular/core';
import { AuthService } from '@app/core/services';
import { UserService } from '@app/services';
import { ConfirmValidParentMatcher } from '@app/validators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
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
  code: string = '';
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
        password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20), Validators.pattern("(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9]{8,}")]],
        confpassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20), Validators.pattern("(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9]{8,}")]]
      }, {validator: this.checkPasswords})
    });
  }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('userId');
    this.code = this.route.snapshot.paramMap.get('code');
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
    if (this.code != this.verifForm.value.userCode) {
      this.error = "Invalid Code";
      return;
    } 
    if (this.code != '0' && this.verifForm.get('Passwords.password').value == ''){
      this.error = "You must enter a valid password";
      return;
    }
    let dataForm;
    if (this.code != '0'){
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
    } else {
      dataForm = '';
      return;
    }
    var spinnerRef = this.spinnerService.start("Activating account...");
    this.userAct$ = this.usersService.putVerifCode(this.code, dataForm).pipe(
      tap((res: any) => { 
        if (res.Code == 200){
          this.spinnerService.stop(spinnerRef);
          this.router.navigate(['/login']);
        } else {
          this.spinnerService.stop(spinnerRef);
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

}
