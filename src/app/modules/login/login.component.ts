import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ConfirmValidParentMatcher } from '@app/validators';
import { AuthService } from '@core/services';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  error = '';
  showAuth: boolean =false;

  confirmValidParentMatcher = new ConfirmValidParentMatcher();

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) { 
    // redirect to home if already logged in
    if (this.authService.currentUserValue) { 
      this.router.navigate(['/']);
    }
  }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
      authcode: ['',[Validators.max(999999), Validators.min(1), Validators.maxLength(6), Validators.minLength(6)]]
    });

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.loginForm.invalid) {
        return;
    }
    this.loading = true;

    var CryptoJS = require("crypto-js");
    var data = this.f.password.value;
    var password = "K968G66S4dC1Y5tNA5zKGT5KIjeMcpc8";
    var ctObj = CryptoJS.AES.encrypt(data, password);
    var ctStr = ctObj.toString();

    this.authService.login(this.f.email.value, ctStr, this.f.authcode.value)
      .pipe(first())
      .subscribe(
          data => {
            this.loading = false;
            if (data.Code == 100){
              // window.location.href = window.location.origin + '/' + this.returnUrl;
              // return;
              this.router.navigate([this.returnUrl]);
              return;
            }
            if (data.Code == 300){
              this.showAuth = true;
              this.error = '';
              return;
            } else {
              this.error = data.Message;
              return;
            }
          },
          error => {
            this.error = error.Message;
            this.loading = false;
          });
  }

  getErrorMessage(component: string) {
    if (component === 'Email'){
      return this.f.email.hasError('required') ? 'You must enter an email' :
        '';
    }
    if (component === 'Password'){
      return this.f.password.hasError('required') ? 'You must enter a password' :
        '';
    }
  }

}
