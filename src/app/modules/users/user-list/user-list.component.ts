import { Component, OnInit, Input, SimpleChanges, ViewChild } from '@angular/core';
import { AuthService } from '@core/services';
import { User } from '@app/_models';
import { UserService } from "@app/services";
import { MonitorService } from "@shared/monitor.service";
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from '@app/shared/dialog/dialog.component';
import { Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { SpinnerService } from '@app/shared/spinner.service';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { MatTable } from '@angular/material/table';
import { FormArray, FormGroup, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { LearnDialogComponent } from '@app/shared/learn-dialog/learn-dialog.component';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  @Input() filterValue: string;
  @ViewChild(MatTable) pollTable :MatTable<any>;
  
  deleteUser$: Observable<any>;
  users$: Observable<User[]>;
  public onError: string='';

  public length: number = 0;
  public pageSize: number = 10;
  public _page: number;
  private _currentPage: any[] = [];
  private _currentSearchValue: string = '';

  displayYesNo: boolean = false;

  displayedColumns = ['Name', 'Email', 'Status', 'Actions'];
  businessId: string = '';
  changeData: string;

  userData: User;

  get fUsers(){
    return this.userForm.get('Users') as FormArray;
  }

  userForm = this.fb.group({
    Users: this.fb.array([this.addUsers()])
  });

  addUsers(): FormGroup{
    return this.fb.group({
      UserId: [''],
      Name: [''],
      Email: [''],
      Status: ['']
    });
  }

  constructor(
    private fb: FormBuilder,
    private domSanitizer: DomSanitizer,
    private authService: AuthService,
    private data: MonitorService,
    private spinnerService: SpinnerService,
    private dialog: MatDialog,
    private learnmore: MatDialog,
    private userService: UserService,
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

  openLearnMore(message: string): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      message: message
    };
    this.learnmore.open(LearnDialogComponent, dialogConfig);
  }

  ngOnInit(): void {
    this.businessId = this.authService.businessId();
    this._page = 1;
    this._currentPage.push({page: this._page, userId: ''});
    this.loadUsers(
      this._currentPage[0].page, this.pageSize, this._currentSearchValue, this._currentPage[0].userId
    );

    this.data.handleMessage.subscribe(res => this.changeData = res);
    this.data.objectMessage.subscribe(res => this.userData = res);
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
      this._currentPage.push({page: this._page, userId: ''});
      this.loadUsers(
        this._currentPage[0].page, this.pageSize, this._currentSearchValue, this._currentPage[0].userId
      );
    }
  }

  loadUsers(crPage, crItems, crSearch, crlastItem) {
    this.onError = '';
    var spinnerRef = this.spinnerService.start($localize`:@@userloc.loadinguser:`);
    let data = this.businessId + "/" + crItems + (crSearch === '' ? '/_' : '/' + crSearch) + (crlastItem === '' ? '/_' : '/' +  crlastItem);

    this.users$ = this.userService.getUsers(data).pipe(
      map((res: any) => {
        if (res != null) {
          if (res.lastItem != ''){
            this.length = (this.pageSize*this._page)+1;
            this._currentPage.push({page: this._page+1, userId: res.lastItem});
          }
        }
        this.userForm.setControl('Users', this.setExistingUsers(res.users));
        this.spinnerService.stop(spinnerRef);
        return res.users;
      }),
      catchError(err => {
        this.onError = err.Message;
        this.spinnerService.stop(spinnerRef);
        return this.onError;
      })
    );
  }

  setExistingUsers(users: User[]): FormArray{
    const formArray = new FormArray([]);
    users.forEach(res => {
      formArray.push(this.fb.group({
          UserId: res.User_Id,
          Name: res.First_Name + ' ' + res.Last_Name,
          Email: res.Email,
          Status: res.Status
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
    this.loadUsers(
      this._currentPage[this._page-1].page,
      this.pageSize,
      this._currentSearchValue,
      this._currentPage[this._page-1].userId
    );
  }

  onSelect(user: any) {
    this.router.navigate(['/user/'+user]);
  }

  onDelete(user: any) {
    this.displayYesNo = true;

    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      header: $localize`:@@users.usertext:`, 
      message: $localize`:@@users.deleteuserquest:`, 
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
      if(result == undefined || result == false){ return; }  
      if (result){
        var spinnerRef = this.spinnerService.start($localize`:@@users.deletinguser:`);
        this.deleteUser$ = this.userService.deleteUser(user, this.businessId).pipe(
          tap((res: any) => {
            this.spinnerService.stop(spinnerRef);
            this.displayYesNo = false;
            if (res.Code == 200){
              this.loadUsers(
                this._currentPage[0].page, this.pageSize, this._currentSearchValue, this._currentPage[0].userId
              );
              this.openDialog($localize`:@@users.usertext:`, $localize`:@@users.deletedsuccess:`, true, false, false);
            } else {
              this.loadUsers(
                this._currentPage[0].page, this.pageSize, this._currentSearchValue, this._currentPage[0].userId
              );
              this.openDialog($localize`:@@users.usertext:`, res.Message, false, true, false);
            }
          }),
          catchError(err => {
            this.spinnerService.stop(spinnerRef);
            this.displayYesNo = false;
            this.openDialog($localize`:@@shared.error:`, err.Message, false, true, false);
            return throwError (err || err.message);
          })
        );
      }
    });
  }

  trackRow(index: number, item: User) {
    return item.User_Id;
  }

  learnMore(textNumber: number){
    let message = '';
    switch(textNumber) { 
      case 29: { 
        message = $localize`:@@learnMore.LMCON29:`;
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
