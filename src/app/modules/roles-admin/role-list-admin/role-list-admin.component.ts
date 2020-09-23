import { Component, OnInit, Input, ViewChild, SimpleChanges } from '@angular/core';
import { MonitorService } from "@shared/monitor.service";
import { Role } from '@app/_models';
import { Observable, throwError } from 'rxjs';
import { AdminService } from "@app/services";
import { AuthService } from '@core/services';
import { delay, map, catchError, tap } from 'rxjs/operators';
import { SpinnerService } from '@app/shared/spinner.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from '@app/shared/dialog/dialog.component';
import { MatTable } from '@angular/material/table';
import { FormArray, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-role-list-admin',
  templateUrl: './role-list-admin.component.html',
  styleUrls: ['./role-list-admin.component.scss']
})
export class RoleListAdminComponent implements OnInit {
  @Input() filterValue: string;
  @ViewChild(MatTable) pollTable :MatTable<any>;
  
  deleteRole$: Observable<any>;
  roles$: Observable<Role[]>;
  public onError: string='';
  
  public length: number = 0;
  public pageSize: number = 10;
  public _page: number;
  private _currentPage: any[] = [];
  private _currentSearchValue: string = '';

  displayYesNo: boolean = false;
  
  displayedColumns = ['Name', 'Actions'];
  businessId: string = '';
  changeData: string;
  roleData: Role;
  
  get fRoles(){
    return this.roleForm.get('Roles') as FormArray;
  }

  roleForm = this.fb.group({
    Roles: this.fb.array([this.addRoles()])
  });

  addRoles(): FormGroup{
    return this.fb.group({
      RoleId: [''],
      Name: ['', [Validators.required, Validators.maxLength(100), Validators.minLength(3)]]
    });
  }

  constructor(
    private fb: FormBuilder,
    private domSanitizer: DomSanitizer,
    private authService: AuthService,
    private data: MonitorService,
    private spinnerService: SpinnerService,
    private dialog: MatDialog,
    private adminService: AdminService,
    private matIconRegistry: MatIconRegistry,
    private router: Router
  ) {
    this.matIconRegistry.addSvgIcon('edit',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/edit.svg'));
    this.matIconRegistry.addSvgIcon('delete',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/delete.svg'));
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
    this._page = 1;
    this._currentPage.push({page: this._page, roleId: ''});
    this.loadRoles(
      this._currentPage[0].page, this.pageSize, this._currentSearchValue, this._currentPage[0].roleId
    );

    this.data.handleMessage.subscribe(res => this.changeData = res);
    this.data.objectMessage.subscribe(res => this.roleData = res);
    this.data.setData(undefined);
  }

  ngAfterViewChecked() {
    //change style page number
    const list = document.getElementsByClassName('mat-paginator-range-label');
    list[0].innerHTML = this._page.toString();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.filterValue.currentValue != undefined){
      this._currentSearchValue = changes.filterValue.currentValue;
      this._currentPage = [];
      this._page = 1;
      this._currentPage.push({page: this._page, pollId: ''});
      this.loadRoles(
        this._currentPage[0].page, this.pageSize, this._currentSearchValue, this._currentPage[0].roleId
      );
    }
  }

  loadRoles(crPage, crItems, crSearch, crlastItem) {
    this.onError = '';
    var spinnerRef = this.spinnerService.start($localize`:@@roles.loadingrole:`);
    let data = this.businessId + "/" + crItems + (crSearch === '' ? '/_' : '/' + crSearch) + (crlastItem === '' ? '/_' : '/' +  crlastItem);

    this.roles$ = this.adminService.getRoles(data).pipe(
      map((res: any) => {
        if (res != null) {
          if (res.lastItem != ''){
            this.length = (this.pageSize*this._page)+1;
            this._currentPage.push({page: this._page+1, roleId: res.lastItem});
          }
        }
        this.roleForm.setControl('Roles', this.setExistingRoles(res.roles));
        this.spinnerService.stop(spinnerRef);
        return res.polls;
      }),
      catchError(err => {
        this.onError = err.Message;
        this.spinnerService.stop(spinnerRef);
        return this.onError;
      })
    );
  }

  setExistingRoles(roles: Role[]): FormArray{
    const formArray = new FormArray([]);
    roles.forEach(res => {
      formArray.push(this.fb.group({
          RoleId: res.Role_Id,
          Name: res.Name
        })
      );
      this.pollTable.renderRows();
    });
    return formArray;
  }

  public goToPage(page: number, elements: number): void {
    if (this.pageSize != elements){
      this.pageSize = elements;
      this._page = 1;
    } else {
      this._page = page+1;
    }
    this.loadRoles(
      this._currentPage[this._page-1].page,
      this.pageSize,
      this._currentSearchValue,
      this._currentPage[this._page-1].roleId
    );
  }

  onSelect(role: any){
    this.router.navigate(['/role-admin/'+role]);
  }

  onDelete(role: any){
    this.displayYesNo = true;
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      header: $localize`:@@roles.rolepop:`, 
      message: $localize`:@@roles.deletemessage:`, 
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
        var spinnerRef = this.spinnerService.start($localize`:@@roles.deletingrole:`);
        if (result){
          this.deleteRole$ = this.adminService.deleteRole(role, this.businessId).pipe(
            tap(res => {
              this.spinnerService.stop(spinnerRef);
              this.displayYesNo = false;
              this.loadRoles(
                this._currentPage[0].page, this.pageSize, this._currentSearchValue, this._currentPage[0].roleId
              );
              this.openDialog($localize`:@@roles.rolepop:`, $localize`:@@roles.roledeleted:`, true, false, false);
            }),
            catchError(err => {
              this.spinnerService.stop(spinnerRef);
              this.displayYesNo = false;
              this.openDialog($localize`:@@shared.error:`, err.Message, false, true, false);
              return throwError (err || err.message);
            })
          );
        }
      }
    });
  }

  trackRow(index: number, item: Role) {
    return item.Role_Id;
  }

}
