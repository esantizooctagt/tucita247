import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormGroup, FormBuilder } from '@angular/forms';
import { UserService, LocationService } from '@app/services';
import { AuthService } from '@app/core/services';
import { map, catchError, mergeMap, switchMap } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { SpinnerService } from '@app/shared/spinner.service';
import { MatTable } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from '@app/_models';

@Component({
  selector: 'app-userloc',
  templateUrl: './userloc.component.html',
  styleUrls: ['./userloc.component.scss']
})
export class UserlocComponent implements OnInit {
  @ViewChild(MatTable) userTable: MatTable<any>;

  businessId: string = '';
  locs$: Observable<any>;
  users$: Observable<any[]>;
  saveUser$: Observable<any[]>;

  public length: number = 0;
  public pageSize: number = 10;
  public _page: number;
  private _currentPage: any[] = [];

  door = [];
  locations = [];

  displayedColumns = ['Name', 'Email', 'Location', 'Door', 'Actions'];

  get fUsers() {
    return this.usersForm.get('users') as FormArray;
  }

  usersForm = this.fb.group({
    users: this.fb.array([this.addUserLoc()])
  });

  addUserLoc(): FormGroup {
    const items = this.fb.group({
      UserId: [''],
      Name: [''],
      Email: [''],
      LocationId: [''],
      Door: ['']
    })
    return items;
  }

  constructor(
    private fb: FormBuilder,
    private _snackBar: MatSnackBar,
    private userService: UserService,
    private locationService: LocationService,
    private spinnerService: SpinnerService,
    private authService: AuthService
  ) { }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
    });
  }

  ngOnInit(): void {
    var spinnerRef = this.spinnerService.start($localize`:@@userloc.loadinguser:`);
    this.businessId = this.authService.businessId();
    this._page = 1;
    this._currentPage.push({ page: this._page, userId: '' });
    this.locs$ = this.locationService.getLocationsCode(this.businessId).pipe(
      map((res: any) => {
        if (res != null) {
          this.locations = res.locs;
          return res.locs;
        }
      }),
      switchMap(v => 
        this.userService.getUsersLoc(this.businessId + "/10/_").pipe(
          map((res: any) => {
            if (res != null){
              if (res.lastItem != '') {
                this.length = (this.pageSize * this._page) + 1;
                this._currentPage.push({ page: this._page + 1, userId: res.lastItem });
              }
              this.spinnerService.stop(spinnerRef);
              this.usersForm.setControl('users', this.setUsers(res.users));
              return res.users;
            }
          })
        )
      ),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        return throwError(err || err.message);
      })
    );
  }

  ngAfterViewChecked() {
    //change style page number
    const list = document.getElementsByClassName('mat-paginator-range-label');
    list[0].innerHTML = this._page.toString();
  }

  setUsers(usrs: any[]) {
    const formArray = new FormArray([]);
    var spinnerRef = this.spinnerService.start($localize`:@@userloc.loadinguser:`);
    let i: number = 0;
    usrs.forEach((res: any) => {
      if (res.LocationId != "") {
        this.door[i] = this.locations.filter(x => x.LocationId == res.LocationId)[0].Door;
      } else {
        this.door[i] = [];
      }
      formArray.push(
        this.fb.group({
          UserId: res.UserId,
          Name: res.First_Name + ' ' + res.Last_Name,
          Email: res.Email,
          LocationId: res.LocationId,
          Door: res.Door,
          Actions: ''
        })
      );
      this.userTable.renderRows();
      i = i + 1;
    });
    this.spinnerService.stop(spinnerRef);
    return formArray;
  }

  changeLocation(event: any, i: number) {
    const item = this.usersForm.controls.users as FormArray;
    item.at(i).patchValue({
      Door: ''
    });
    this.door[i] = this.locations.filter(x => x.LocationId == event.value)[0].Door;
  }

  changeData(i: number, element: any) {
    if (element.value.Door == "") { return; }
    if (element.value.LocationId == "") { return; }

    let formData = {
      UserId: element.value.UserId,
      LocationId: element.value.LocationId,
      Door: element.value.Door
    }
    this.saveUser$ = this.userService.updateUsersLocs(this.businessId, formData).pipe(
      map((res: any) => {
        if (res != null) {
          this.openSnackBar($localize`:@@userloc.userupdated:`, $localize`:@@userloc.subtitle:`);
          return res.locs;
        }
      }),
      catchError(err => {
        this.openSnackBar($localize`:@@shared.wrong:`, $localize`:@@userloc.subtitle:`);
        return throwError(err || err.message);
      })
    );
  }

  public goToPage(page: number, elements: number): void {
    if (this.pageSize != elements) {
      this.pageSize = elements;
      this._page = 1;
    } else {
      this._page = page + 1;
    }
    this.loadUsers(
      this.pageSize,
      this._currentPage[this._page - 1].userId
    );
  }

  loadUsers(crNumber: number, crItem: string) {
    var spinnerRef = this.spinnerService.start($localize`:@@userloc.loadinguser:`);
    let data = this.businessId + "/" + crNumber + (crItem === '' ? '/_' : '/' + crItem);

    this.users$ = this.userService.getUsersLoc(data).pipe(
      map((res: any) => {
        this.spinnerService.stop(spinnerRef);
        if (res.lastItem != '') {
          this.length = (this.pageSize * this._page) + 1;
          this._currentPage.push({ page: this._page + 1, userId: res.lastItem });
        }
        this.usersForm.setControl('users', this.setUsers(res.users));
        return res.users;
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        return throwError(err || err.message);
      })
    );
  }

  trackRow(index: number, item: any) {
    return item.UserId;
  }
}
