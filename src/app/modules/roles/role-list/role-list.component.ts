import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { MonitorService } from "@shared/monitor.service";
import { Role } from '@app/_models';
import { Observable, throwError } from 'rxjs';
import { RolesService } from "@app/services";
import { AuthService } from '@core/services';
import { delay, map, catchError, tap } from 'rxjs/operators';
import { SpinnerService } from '@app/shared/spinner.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from '@app/shared/dialog/dialog.component';

@Component({
  selector: 'app-role-list',
  templateUrl: './role-list.component.html',
  styleUrls: ['./role-list.component.scss']
})
export class RoleListComponent implements OnInit {
  @Output() roleSelected = new EventEmitter<Role>();
  
  public onError: string='';
  
  companyId: string = '';
  message: string = '';
  lastRole: Role;
  deletingRole: boolean = false;
  deleted: boolean = false;
  displayYesNo: boolean = false;
  
  deleteRole$: Observable<any>;
  message$: Observable<string>;
  roles$: Observable<Role[]>;

  constructor(
    private authService: AuthService,
    private data: MonitorService,
    private spinnerService: SpinnerService,
    private rolesService: RolesService,
    private dialog: MatDialog
  ) { }

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
    this.companyId = this.authService.companyId();
    this.loadRoles();
    this.message$ = this.data.monitorMessage.pipe(
      map(res => {
        this.message = 'init';
        if (res === 'roles') {
          this.message = res;
          this.loadRoles();
        }
        return this.message;
      })
    );
  }

  loadRoles(){
    var spinnerRef = this.spinnerService.start("Loading Roles...");
    this.roles$ = this.rolesService.getRoles(this.companyId).pipe(
      map((res: any) => {
        if (res != null) {
          this.spinnerService.stop(spinnerRef);
        }
        return res;
      }),
      catchError(err => {
        this.onError = err.Message;
        this.spinnerService.stop(spinnerRef);
        return this.onError;
      })
    );
  }

  onSelect(role: Role) {
    if (this.lastRole != role){
      this.roleSelected.emit(role);
      this.lastRole = role;
    } else {
      let defRole: Role;
      (async () => {
        this.roleSelected.emit(defRole);
        await delay(40);
        this.roleSelected.emit(role);
      })();
    }
    window.scroll(0,0);
  }

  onDelete(role: Role){
    this.displayYesNo = true;

    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      header: 'Role', 
      message: 'Are you sure to delete this Role?', 
      success: false, 
      error: false, 
      warn: false,
      ask: this.displayYesNo
    };
    dialogConfig.width ='280px';
    dialogConfig.minWidth = '280px';
    dialogConfig.maxWidth = '280px';

    const dialogRef = this.dialog.open(DialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if(result != undefined){
        this.deleted = result;
        var spinnerRef = this.spinnerService.start("Deleting Role...");
        if (this.deleted){
          let delRole: Role;
          this.deleted = false; 
          this.deleteRole$ = this.rolesService.deleteRole(role.Role_Id).pipe(
            tap(res => {
              this.roleSelected.emit(delRole);
              this.spinnerService.stop(spinnerRef);
              this.displayYesNo = false;
              this.deletingRole = true;
              this.loadRoles();
              this.openDialog('Role', 'Role deleted successful', true, false, false);
              window.scroll(0,0);
            }),
            catchError(err => {
              this.deletingRole = false;
              this.spinnerService.stop(spinnerRef);
              this.displayYesNo = false;
              this.openDialog('Error ! ', err.Message, false, true, false);
              return throwError (err || err.message);
            })
          );
        }
      }
    });
  }

  trackById(index: number, item: Role) {
    return item.Role_Id;
  }

}
