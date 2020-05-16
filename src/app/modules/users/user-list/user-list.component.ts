import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AuthService } from '@core/services';
import { User } from '@app/_models';
import { UserService } from "@app/services";
import { MonitorService } from "@shared/monitor.service";
import { delay } from 'q';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from '@app/shared/dialog/dialog.component';
import { Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { SpinnerService } from '@app/shared/spinner.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  @Output() userSelected = new EventEmitter<User>();
  public length: number = 0;
  public pageSize: number = 10;
  public users: User[] = [];
  public listView:boolean=true;
  public onError: string='';

  public _page: number;
  private _currentPage: any[] = [];
  private _currentSearchValue: string = '';

  businessId: string = '';
  message: string;
  lastUser: User;
  deleted: boolean = false;
  displayYesNo: boolean = false;
  deletingUser: boolean = false;
  message$: Observable<string>;
  deleteUser$: Observable<any>;
  users$: Observable<User[]>;

  constructor(
    private authService: AuthService,
    private data: MonitorService,
    private userService: UserService,
    private spinnerService: SpinnerService,
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
    this.businessId = this.authService.businessId();
    this._page = 1;
    this._currentPage.push({page: this._page, userId: ''});
    this.loadUsers(this._currentPage[0].page, this.pageSize, this._currentSearchValue, this._currentPage[0].userId);
    this.message$ = this.data.monitorMessage.pipe(
      map(res => {
        this.message = 'init';
        if (res === 'users') {
          this.message = res;
          this.loadUsers(this._currentPage[0].page, this.pageSize, this._currentSearchValue, this._currentPage[0].userId);
        }
        return this.message;
      })
    );
  }

  ngAfterViewChecked() {
    const list = document.getElementsByClassName('mat-paginator-range-label');
    list[0].innerHTML = 'Page: ' + this._page.toString();
  }

  loadUsers(crPage, crNumber, crValue, crItem) {
    this.onError = '';
    var spinnerRef = this.spinnerService.start("Loading Users...");
    let data = this.businessId + "/" + crNumber + (crValue === '' ? '/_' : '/' + crValue) + (crItem === '' ? '/_' : '/' +  crItem);

    this.users$ = this.userService.getUsers(data).pipe(
      map((res: any) => {
        if (res != null) {
          if (res.lastItem != ''){
            console.log(this._currentPage);
            this.length = (this.pageSize*this._page)+1;
            this._currentPage.push({page: this._page+1, userId: res.lastItem})
            console.log(this.length);
          }
          this.spinnerService.stop(spinnerRef);
        }
        return res.users;
      }),
      catchError(err => {
        this.onError = err.Message;
        this.spinnerService.stop(spinnerRef);
        return this.onError;
      })
    );
  }

  public filterList(searchParam: string): void {
    this._currentSearchValue = searchParam;
    this._currentPage = [];
    this._page = 1;
    this._currentPage.push({page: this._page, userId: ''});
    this.loadUsers(
      this._currentPage[0].page, this.pageSize, this._currentSearchValue, this._currentPage[0].userId
    );
  }

  onSelect(user: User) {
    if (this.lastUser != user){
      this.userSelected.emit(user);
      this.lastUser = user;
    } else {
      let defUser: User;
      (async () => {
        this.userSelected.emit(defUser);
        await delay(20);
        this.userSelected.emit(user);
      })();
    }
    window.scroll(0,0);
  }

  onDelete(user: User) {
    this.displayYesNo = true;

    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      header: 'User', 
      message: 'Are you sure to delete this User?', 
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
        var spinnerRef = this.spinnerService.start("Deleting User...");
        if (this.deleted){
          let delUser: User;
          this.deleted = false; 
          this.deleteUser$ = this.userService.deleteUser(user.User_Id, this.businessId).pipe(
            tap(res => {
              this.userSelected.emit(delUser);
              this.spinnerService.stop(spinnerRef);
              this.displayYesNo = false;
              this.deletingUser = true;
              this.loadUsers(
                this._currentPage[0].page, this.pageSize, this._currentSearchValue, this._currentPage[0].userId
              );
              this.openDialog('User', 'User deleted successful', true, false, false);
              window.scroll(0,0);
            }),
            catchError(err => {
              this.deletingUser = false;
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

  public setView(value){
    if (value === 'list'){
      this.listView = true;
    } else {
      this.listView = false;
    }
  }

  trackById(index: number, item: User) {
    return item.User_Id;
  }

}
