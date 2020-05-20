import { Component, OnInit } from '@angular/core';
import { User } from '@app/_models';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
// import { NgxImageCompressService } from 'ngx-image-compress';
import { UserService } from "@app/services";
import { AuthService } from '@core/services';
import { DialogComponent } from '@app/shared/dialog/dialog.component';
import { ConfirmValidParentMatcher } from '@app/validators';
import { environment } from '@environments/environment';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { SpinnerService } from '@app/shared/spinner.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user$: Observable<User>;
  userUpdate$: Observable<any>;
  imgAvatar$: Observable<any>;

  businessId: string = '';
  userId: string = '';
  fileName: string= '';
  fileString: any;
  displayForm: boolean=true;

  readonly imgPath = environment.bucket;
  public qrCode: string = null;

  get f(){
    return this.profileForm.controls;
  }

  confirmValidParentMatcher = new ConfirmValidParentMatcher();
  
  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private authService: AuthService,
    private spinnerService: SpinnerService,
    private usersService: UserService,
    // private imageCompress: NgxImageCompressService
  ) { }

  profileForm = this.fb.group({
    Email: [''],
    First_Name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    Last_Name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    Avatar: [''],
    Phone: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(15)]],
    Language: [''],
    MFact_Auth: ['']
  })

  avatarForm = this.fb.group({
    Avatar: [null, Validators.required]
  });

  ngOnInit(): void {
    this.businessId = this.authService.businessId();
    this.userId = this.authService.userId();
    var spinnerRef = this.spinnerService.start("Loading Profile...");
    this.profileForm.reset({Email:'', First_Name: '', Last_Name: '', Avatar: '', Phone: '', Language: '', MFact_Auth: ''});
    this.user$ = this.usersService.getUser(this.userId, this.businessId).pipe(
      tap(res => {
        this.profileForm.setValue({
          Email: res.Email,
          First_Name: res.First_Name,
          Last_Name: res.Last_Name,
          Avatar: res.Avatar,
          Phone: res.Phone,
          Language: res.Language,
          MFact_Auth: res.MFact_Auth,
        });
        this.spinnerService.stop(spinnerRef);
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        this.openDialog('Error !', err.Message, false, true, false);
        return throwError(err || err.message);
      })
    );
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
    if (component === 'Phone'){
      return this.f.Phone.hasError('minlength') ? 'Minimun length 6' :
            this.f.Phone.hasError('maxlength') ? 'Maximun length 15' :
              '';
    }
  }

  onClick(){
    const fileUpload = document.getElementById('fileUpload') as HTMLInputElement;
    fileUpload.onchange = () => {
      const file = fileUpload.files[0];
      if (file === undefined) {return;}
      this.fileName = file['name'];
      if (file['type'] != "image/png" && file['type'] != "image/jpg" && file['type'] != "image/jpeg") { 
        this.openDialog('User', 'File extension not allowed', false, true, false);
        return; 
      }
      
      const reader: FileReader = new FileReader();
      reader.onload = (event: Event) => {
        let dimX = 75;
        let dimY = 75;
        if (file['size'] > 60000){
          this.openDialog('User', 'File exced maximun allowed', false, true, false);
          return;
        }
        // this.imageCompress.compressFile(reader.result, -1, dimX, dimY).then(
        //   compress => {
        //     this.fileString = compress;
        //     this.onSubmitAvatar();
        //   }
        // );
      }
      reader.readAsDataURL(fileUpload.files[0]);
    };
    fileUpload.click();
  }

  dataURItoBlob(dataURI, dataType) {
    const byteString = window.atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: dataType });    
    return blob;
  }
  
  loadCropImage($event){
    this.fileString = $event;
  }

  onSubmit(){
    if (this.profileForm.invalid){
      return;
    }
    var spinnerRef = this.spinnerService.start("Saving Profile...");
    let dataForm =  { 
      "Email": this.profileForm.value.Email,
      "First_Name": this.profileForm.value.First_Name,
      "Last_Name": this.profileForm.value.Last_Name,
      "Phone": this.profileForm.value.Phone,
      "MFact_Auth": (this.profileForm.value.MFact_Auth ? 1 : 0),
      "Language": this.profileForm.value.Language,
      "BusinessId": this.businessId
    }
    this.userUpdate$ = this.usersService.updateProfile(this.userId, dataForm).pipe(
      tap(res =>  {
        this.spinnerService.stop(spinnerRef);
        this.openDialog('User', 'User updated successful', true, false, false);
      }),
      catchError(err => { 
        this.spinnerService.stop(spinnerRef);
        this.openDialog('Error !', err.Message, false, true, false);
        return throwError(err || err.message);
      })
    );
  }

  onSubmitAvatar() {
    const formData: FormData = new FormData();
    var spinnerRef = this.spinnerService.start("Loading Profile Image...");
    formData.append('Image', this.fileString);
    let type: string ='';
    if (this.fileString.toString().indexOf('data:image/') >= 0){
      type = this.fileString.toString().substring(11,15);
    }
    if (type === 'jpeg' || type === 'jpg;'){
      type = '.jpg';
    }
    if (type === 'png;'){
      type = '.png';
    }
    this.imgAvatar$ = this.usersService.uploadImage(this.userId, formData).pipe(
      tap(response =>  {
          this.spinnerService.stop(spinnerRef);
          this.profileForm.patchValue({'Avatar': this.businessId+'/img/avatars/'+this.userId+type});
          this.authService.setUserAvatar(this.businessId+'/img/avatars/'+this.userId+type);
          this.avatarForm.reset({'Avatar':null});
          this.fileString = null;
          this.openDialog('User', 'Avatar uploaded successful', true, false, false);
        }
      ),
      catchError(err => { 
        this.spinnerService.stop(spinnerRef);
        this.openDialog('Error !', err.Message, false, true, false);
        return throwError(err || err.message);
      })
    );
  }

}
