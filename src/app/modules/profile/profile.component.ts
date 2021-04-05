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
  imgValue: any;

  businessId: string = '';
  userId: string = '';
  fileName: string= '';
  fileString: any;
  displayForm: boolean=true;

  readonly imgPath = environment.bucket;

  readonly countryLst = environment.countryList;
  phCountry: string = '(XXX) XXX-XXXX';
  code: string = '+1';
  
  get f(){
    return this.profileForm.controls;
  }

  confirmValidParentMatcher = new ConfirmValidParentMatcher();
  
  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private authService: AuthService,
    private spinnerService: SpinnerService,
    private usersService: UserService
    // private imageCompress: NgxImageCompressService
  ) { }

  profileForm = this.fb.group({
    Email: [''],
    First_Name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    Last_Name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    Avatar: [''],
    Phone: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(17)]],
    CountryCode: ['PRI'],
    Language: ['']
  })

  avatarForm = this.fb.group({
    Avatar: [null, Validators.required]
  });

  ngOnInit(): void {
    this.businessId = this.authService.businessId();
    this.userId = this.authService.userId();

    var spinnerRef = this.spinnerService.start($localize`:@@profile.loading:`);
    this.profileForm.reset({Email:'', First_Name: '', Last_Name: '', Avatar: '', Phone: '', CountryCode: '', Language: ''});
    this.user$ = this.usersService.getUser(this.userId, this.businessId).pipe(
      tap(res => {
        if (res.CountryCode != '' && res.CountryCode != undefined){
          let codCountry = this.countryLst.filter(x => x.Country == res.CountryCode)[0];
          this.phCountry = codCountry.PlaceHolder;
          this.code = codCountry.Code;
        }
        this.profileForm.setValue({
          Email: res.Email,
          First_Name: res.First_Name,
          Last_Name: res.Last_Name,
          Avatar: res.Avatar,
          CountryCode: res.CountryCode,
          Phone: res.Phone.replace(this.code.replace(/[^0-9]/g,''), ''),
          Language: res.Language
        });
        this.spinnerService.stop(spinnerRef);
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        this.openDialog($localize`:@@shared.error:`, err.Message, false, true, false);
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
    const val3 = '3';
    const val6 = '7';
    const val17 = '17';
    const val100 = '100';
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
      return this.f.Phone.hasError('minlength') ? $localize`:@@shared.minimun: ${val6}` :
            this.f.Phone.hasError('maxlength') ? $localize`:@@shared.maximun: ${val17}` :
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
        this.openDialog($localize`:@@shared.userpopup:`, $localize`:@@profile.fileextension:`, false, true, false);
        return; 
      }
      
      const reader: FileReader = new FileReader();
      reader.onload = (event: Event) => {
        let dimX = 75;
        let dimY = 75;
        if (file['size'] > 60000){
          this.openDialog($localize`:@@shared.userpopup:`, $localize`:@@profile.filemaximun:`, false, true, false);
          return;
        }
        this.fileString = reader.result;
        this.onSubmitAvatar();
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
    var spinnerRef = this.spinnerService.start($localize`:@@profile.saving:`);
    let dataForm =  { 
      "Email": this.profileForm.value.Email,
      "First_Name": this.profileForm.value.First_Name,
      "Last_Name": this.profileForm.value.Last_Name,
      "Phone": this.code.toString().replace(/\D/g, '') + this.profileForm.value.Phone.replace(/\D/g, ''),
      "CountryCode": this.profileForm.value.CountryCode,
      "Language": this.profileForm.value.Language,
      "BusinessId": this.businessId
    }
    this.userUpdate$ = this.usersService.updateProfile(this.userId, dataForm).pipe(
      tap(res =>  {
        this.spinnerService.stop(spinnerRef);
        this.openDialog($localize`:@@shared.userpopup:`, $localize`:@@profile.updated:`, true, false, false);
      }),
      catchError(err => { 
        this.spinnerService.stop(spinnerRef);
        this.openDialog($localize`:@@shared.error:`, err.Message, false, true, false);
        return throwError(err || err.message);
      })
    );
  }

  onSubmitAvatar() {
    const formData: FormData = new FormData();
    var spinnerRef = this.spinnerService.start($localize`:@@profile.loadprof:`);
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
    this.imgAvatar$ = this.usersService.uploadImage(this.userId, this.businessId, formData).pipe(
      tap(response =>  {
          this.spinnerService.stop(spinnerRef);
          this.profileForm.patchValue({'Avatar': "/"+this.businessId+'/img/avatars/'+this.userId+type});
          this.authService.setUserAvatar("/"+this.businessId+'/img/avatars/'+this.userId+type);
          this.avatarForm.reset({'Avatar':null});
          this.fileString = null;
          this.openDialog($localize`:@@shared.userpopup:`, $localize`:@@profile.uploadsuccess:`, true, false, false);
        }
      ),
      catchError(err => { 
        this.spinnerService.stop(spinnerRef);
        this.openDialog($localize`:@@shared.error:`, err.Message, false, true, false);
        return throwError(err || err.message);
      })
    );
  }

  changeValues($event){
    this.profileForm.patchValue({CountryCode: $event.value, Phone: ''});
    this.phCountry = this.countryLst.filter(x=>x.Country === $event.value)[0].PlaceHolder;
    this.code = this.countryLst.filter(x=>x.Country === $event.value)[0].Code;
  }
}
