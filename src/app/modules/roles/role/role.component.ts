import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Observable, Subscription, throwError } from 'rxjs';
import { Access, Role } from '@app/_models';
import { RolesService } from '@app/services';
import { ConfirmValidParentMatcher } from '@app/validators';
import { FormBuilder, Validators, FormGroup, FormArray } from '@angular/forms';
import { AuthService } from '@app/core/services';
import { MonitorService } from '@app/shared/monitor.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from '@app/shared/dialog/dialog.component';
import { tap, catchError, map } from 'rxjs/operators';
import { MatSelectionList } from '@angular/material/list';
import { SpinnerService } from '@app/shared/spinner.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LearnDialogComponent } from '@app/shared/learn-dialog/learn-dialog.component';

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.scss']
})
export class RoleComponent implements OnInit {
  @Input() role: Role;
  @ViewChild('lstApps') appsOption: MatSelectionList;

  get f(){
    return this.roleForm.controls;
  }
  
  get g(): FormArray {
    return this.roleForm.get('Access') as FormArray;
  }

  businessId: string = '';
  languageInit: string = '';
  displayForm: boolean = true;
  roleDataList: string = '';
  textStatus: string = '';
  invalid: number = 0;
  
  role$: Observable<Role>;
  roleSave$: Observable<any>;
  apps$: Observable<Access[]>;
  subsRoles: Subscription;

  //variable to handle errors on inputs components
  confirmValidParentMatcher = new ConfirmValidParentMatcher();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private data: MonitorService,
    private roleService: RolesService,
    private route: ActivatedRoute,
    private router: Router,
    private spinnerService: SpinnerService,
    private learnmore: MatDialog,
    private dialog: MatDialog
  ) { }

  get fAccess(){
    return this.roleForm.get('Access') as FormArray;
  }
  
  roleForm = this.fb.group({
    RoleId: [''],
    BusinessId: [''],
    Name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    Access: this.fb.array([this.createAccess()]),
    Status: [1]
  })

  createAccess(): FormGroup {
    const access = this.fb.group({
      ApplicationId: [''],
      Name: [''],
      Level_Access: ['0', [Validators.required]]
    });
    return access;
  }

  openLearnMore(message: string): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      message: message
    };
    this.learnmore.open(LearnDialogComponent, dialogConfig);
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

  ngOnInit(): void {
    this.data.handleData('Add');
    this.roleDataList = this.route.snapshot.paramMap.get('roleId');

    this.businessId = this.authService.businessId();
    this.languageInit = this.authService.language() == "" ? "EN" : this.authService.language();
    this.onValueChanges();

    this.onDisplay();
  }

  onDisplay(){
    // changes.prop contains the old and the new value...
    if (this.roleDataList != undefined && this.roleDataList != "0") {
      var spinnerRef = this.spinnerService.start($localize`:@@roles.loadingrolesingle:`);
      this.roleForm.reset({RoleId: '', BusinessId: '', Name: '', Status: 1});
      this.g.clear();
      this.role$ = this.roleService.getRole(this.roleDataList, this.businessId).pipe(
        tap(res => {
          if (res != null) {
            if (res.Role_Id != undefined){
              this.roleForm.setValue({
                RoleId: res.Role_Id,
                Name: res.Name,
                BusinessId: res.Business_Id,
                Status: res.Status,
                Access: []
              });
              this.textStatus = (res.Status == 0 ? $localize`:@@shared.disabled:` : $localize`:@@shared.enabled:`);
              this.loadAccess();
              this.roleForm.patchValue({Access: this.apps$});
            } else {
              this.invalid = 1;
            }
          }
          this.spinnerService.stop(spinnerRef);
        }),
        catchError(err => {
          this.spinnerService.stop(spinnerRef);
          this.openDialog($localize`:@@shared.error:`, err.Message, false, true, false);
          return throwError(err || err.message);
        })
      );
    } else {
      this.roleForm.reset({RoleId: '', BusinessId: '', Name: '', Status: 1});
      this.g.clear();
      this.loadAccess();
    }
  }

  onCancel(){
    this.router.navigate(['/roles']);
  }

  onSubmit(){
    if (this.roleForm.invalid) {
      return;
    }
    let numberRecords = this.roleForm.value.Access.filter((s: any)=> s.Level_Access > 0);
    if (numberRecords[0] == undefined) {
      return;
    }
    if (this.roleForm.touched){
      let roleId = this.roleForm.value.RoleId;
      var spinnerRef = this.spinnerService.start($localize`:@@roles.savingrole:`);
      if (roleId !== '' && roleId !== null) {
        let dataForm =  { 
          "RoleId": this.roleForm.value.RoleId,
          "BusinessId": this.businessId,
          "Name": this.roleForm.value.Name,
          "Status": this.roleForm.value.Status,
          "Access": []
        }
        let lines = this.roleForm.value.Access;
        dataForm['Access'] = lines.filter((s: any)=> s.Level_Access > 0);
        this.roleSave$ = this.roleService.updateRole(dataForm).pipe(
          map(res => { 
            this.spinnerService.stop(spinnerRef);
            // this.data.changeData('roles');
            this.openDialog($localize`:@@roles.rolestext:`, $localize`:@@roles.roleupdated:`, true, false, false);
            this.router.navigate(['/roles']);
          }),
          catchError(err => {
            this.spinnerService.stop(spinnerRef);
            this.openDialog($localize`:@@shared.error:`, err.Message, false, true, false);
            return throwError(err || err.message);
          })
        );
      } else {
        let dataForm = { 
          "BusinessId": this.businessId,
          "Name": this.roleForm.value.Name,
          "Status": 1,
          "Access": []
        }
        let lines = this.roleForm.value.Access;
        dataForm['Access'] = lines.filter((s: any)=> s.Level_Access > 0);
        this.roleSave$ = this.roleService.postRole(dataForm).pipe(
          map(res => { 
            this.spinnerService.stop(spinnerRef);
            // this.data.changeData('roles');
            this.openDialog($localize`:@@roles.rolestext:`, $localize`:@@roles.rolecreated:`, true, false, false);
            this.router.navigate(['/roles']);
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

  loadAccess(){
    let rolId = (this.roleForm.get('RoleId').value == '' ? '0' : this.roleForm.get('RoleId').value);
    this.apps$ = this.roleService.getApplications(rolId, this.businessId, this.languageInit).pipe(
      map((res: any)=>{
        if (res != null){
          this.roleForm.setControl('Access', this.setExistingApps(res));
        }
        return res;
      }),
      catchError(err => {
        return err;
      })
    );
    
  }

  setExistingApps(apps: Access[]){
    const formArray = new FormArray([]);
    apps.forEach(access => {
      formArray.push(
        this.fb.group({
          ApplicationId: access.ApplicationId,
          Name: access.Name,
          Level_Access: access.Level_Access
        }));
    })
    return formArray;
  }

  getErrorMessage(component: string) {
    const val3 ='3';
    const val50='50';
    if (component === 'Name'){
      return this.f.Name.hasError('required') ? $localize`:@@shared.entervalue:` :
        this.f.Name.hasError('minlength') ? $localize`:@@shared.minimun: ${val3}` :
          this.f.Name.hasError('maxlength') ? $localize`:@@shared.maximun: ${val50}` :
            '';
    }
  }

  onValueChanges(): void {
    this.subsRoles = this.roleForm.valueChanges.subscribe(val=>{
      if (val.Status === true) {
        this.roleForm.controls["Status"].setValue(1);
      }
      if (val.Status === false){
        this.roleForm.controls["Status"].setValue(0);
      }
    });
  }

  ngOnDestroy() {
    this.subsRoles.unsubscribe();
  }

  learnMore(textNumber: number){
    let message = '';
    switch(textNumber) { 
      case 32: { 
        message = $localize`:@@learnMore.LMCON32:`;
        break; 
      } 
      case 33: { 
        message = $localize`:@@learnMore.LMCON33:`;
        break; 
      }
      case 34: { 
        message = $localize`:@@learnMore.LMCON34:`; 
        break; 
      }
      default: { 
        message = ''; 
        break; 
      } 
    } 
    this.openLearnMore(message);
  }
  
}
