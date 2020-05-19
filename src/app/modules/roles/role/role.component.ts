import { Component, OnInit, SimpleChanges, Input, ViewChild } from '@angular/core';
import { Observable, Subscription, throwError } from 'rxjs';
import { Access, Role } from '@app/_models';
import { RolesService } from '@app/services';
import { ConfirmValidParentMatcher } from '@app/validators';
import { FormBuilder, Validators, FormGroup, FormArray } from '@angular/forms';
import { AuthService } from '@app/core/services';
import { MonitorService } from '@app/shared/monitor.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from '@app/shared/dialog/dialog.component';
import { tap, catchError } from 'rxjs/operators';
import { MatListOption, MatSelectionList } from '@angular/material/list';
import { SpinnerService } from '@app/shared/spinner.service';

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
  displayForm: boolean = true;
  savingRole: boolean=false;

  role$: Observable<Role>;
  roleSave$: Observable<any>;
  apps$: Observable<Access[]>;
  message$: Observable<string>;
  subsRoles: Subscription;

  //variable to handle errors on inputs components
  confirmValidParentMatcher = new ConfirmValidParentMatcher();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private data: MonitorService,
    private roleService: RolesService,
    private spinnerService: SpinnerService,
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
      Level_Access: [0, [Validators.required]]
      // Active: [0]
    });
    return access;
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
    this.businessId = this.authService.businessId();
    this.message$ = this.data.monitorMessage;
    this.onValueChanges();
    this.loadAccess();
  }

  onCancel(){
    this.roleForm.patchValue({RoleId:''});
    this.loadAccess();
    this.roleForm.reset({RoleId: '', BusinessId: '', Name: '', Status:1, Access: this.apps$});
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
      var spinnerRef = this.spinnerService.start("Saving Role...");
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
          tap(res => { 
            this.savingRole = true;
            this.spinnerService.stop(spinnerRef);
            this.roleForm.patchValue({RoleId: ''});
            this.loadAccess();
            this.roleForm.reset({RoleId: '', BusinessId: this.businessId, Name: '', Status:1, Access: this.apps$});
            this.data.changeData('roles');
            this.openDialog('Roles', 'Role updated successful', true, false, false);
          }),
          catchError(err => {
            this.spinnerService.stop(spinnerRef);
            this.savingRole = false;
            this.openDialog('Error !', err.Message, false, true, false);
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
          tap(res => { 
            this.savingRole = true;
            this.spinnerService.stop(spinnerRef);
            this.roleForm.patchValue({RoleId: ''});
            this.loadAccess();
            this.roleForm.reset({RoleId: '', BusinessId: this.businessId, Name: '', Status:1, Access: this.apps$});
            this.data.changeData('roles');
            this.openDialog('Roles', 'Role created successful', true, false, false);
          }),
          catchError(err => {
            this.spinnerService.stop(spinnerRef);
            this.savingRole = false;
            this.openDialog('Error !', err.Message, false, true, false);
            return throwError(err || err.message);
          })
        );
      }
    }
  }

  loadAccess(){
    this.apps$ = this.roleService.getApplications(this.roleForm.get('RoleId').value, this.businessId);
    this.roleForm.setControl('Access', this.setExistingApps(this.apps$));
  }

  setExistingApps(apps: Observable<Access[]>){
    const formArray = new FormArray([]);
    apps.forEach(res => {
      res.forEach(access => {
        formArray.push(
          this.fb.group({
            ApplicationId: access.ApplicationId,
            Name: access.Name,
            Level_Access: access.Level_Access
            // Active: (access.Active === 1 ? true : false)
          }));
      })
    });
    return formArray;
  }

  // changeValue(option: MatListOption) {
  //   console.log(option);
  //   return;
  //   const item = this.roleForm.controls.Access as FormArray;    
  //   item.at(option.value).patchValue({'Level_Access': option.value});
  //   item.markAsDirty();
  //   item.markAsTouched();
  // }

  getErrorMessage(component: string) {
    if (component === 'Name'){
      return this.f.Name.hasError('required') ? 'You must enter a value' :
        this.f.Name.hasError('minlength') ? 'Minimun length 3' :
          this.f.Name.hasError('maxlength') ? 'Maximun length 50' :
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

  ngOnChanges(changes: SimpleChanges) {
    // changes.prop contains the old and the new value...
    if (changes.role.currentValue != undefined) {
      var spinnerRef = this.spinnerService.start("Loading Role...");
      let roleResult = changes.role.currentValue;
      this.roleForm.reset({RoleId: '', BusinessId: '', Level_Access: '', Name: '', Status: 1});
      this.g.clear();
      this.role$ = this.roleService.getRole(roleResult.Role_Id, this.businessId).pipe(
        tap(res => {
          if (res != null) {
            this.roleForm.setValue({
              RoleId: res.Role_Id,
              Name: res.Name,
              BusinessId: res.Company_Id,
              Status: res.Status,
              Access: []
            });
            this.loadAccess();
            this.roleForm.patchValue({Access: this.apps$});
          }
          this.spinnerService.stop(spinnerRef);
        }),
        catchError(err => {
          this.spinnerService.stop(spinnerRef);
          this.openDialog('Error !', err.Message, false, true, false);
          return throwError(err || err.message);
        })
      );
    } else {
      this.roleForm.reset({RoleId: '', BusinessId: '', Name: '', Status: 1});
      this.g.clear();
      this.loadAccess();
    }
  }

  ngOnDestroy() {
    this.subsRoles.unsubscribe();
  }

}
