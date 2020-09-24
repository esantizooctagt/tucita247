import { Component, OnInit, LOCALE_ID, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, throwError } from 'rxjs';
import { map, shareReplay, catchError, startWith } from 'rxjs/operators';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from '@app/shared/dialog/dialog.component';

import { User, Access } from '@app/_models';
import { AuthService } from '@core/services';
import { environment } from '@environments/environment';
import { RolesService, UserService, BusinessService } from '@app/services';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';

@Component({
  selector: 'app-main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.scss']
})
export class MainNavComponent implements OnInit {
  public online: boolean = true;
  businessId: string='';  
  businessName: string = '';
  userId: string='';
  avatar: string='';
  roleId: string='';
  language: string='';
  languageInit: string='EN';
  isAdmin: boolean=false;
  resetToken$: Observable<any>;
  business$: Observable<any>;
  filteredBusiness$: Observable<any[]>;
  allBusiness: []=[];
  apps$: Observable<Access[]>;
  superAdmin: number=0;
  md5Admin = 'c4ca4238a0b923820dcc509a6f75849b';
  frmBusiness = new FormControl();

  opened = true;
  over = 'side';
  expandHeight = '42px';
  collapseHeight = '42px';
  displayMode = 'flat';
  
  readonly imgPath = environment.bucket;

  users: User[] = [];

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(
    @Inject(LOCALE_ID) protected localeId: string,
    private breakpointObserver: BreakpointObserver,
    public authService: AuthService,
    private roleService: RolesService,
    private dialog: MatDialog,
    private userService: UserService,
    private router: Router,
    private businessService: BusinessService
    ) {
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

  ngOnInit(){
    if (this.authService.superAdmin() == 'c4ca4238a0b923820dcc509a6f75849b'){
      this.superAdmin = 1;
    }
    this.businessId = this.authService.businessId();
    this.businessName = this.authService.businessName();
    this.roleId = this.authService.roleId();
    this.userId = this.authService.userId();
    this.isAdmin = this.authService.isAdmin();
    if (this.authService.language() != ''){
      this.language = this.authService.language() == "EN" ? "assets/images/icon/EN.svg" : "assets/images/icon/ES.svg";
    }
    this.languageInit = this.authService.language() == "" ? "EN" : this.authService.language();
    if (this.authService.avatar() != '') {
      this.avatar = this.imgPath + this.authService.avatar();
    }

    this.filteredBusiness$ = this.frmBusiness.valueChanges
      .pipe(
        startWith(null),
        map((business: any | null) => business ? this._filterBusiness(business) : this.allBusiness.slice())
      );

    this.loadAccess();

    this.business$ = this.businessService.getBusinessAdmin().pipe(
      map((res: any) => {
        this.allBusiness = res.Business;
        }
      ),
      catchError(err => {
        return throwError(err || err.message);
      })
    );

    setInterval(() => { 
      this.refreshToken();
    }, 1800000);

    setInterval(() => {
      if (this.authService.getUserProfile() == null){
        this.authService.logout();
        this.router.navigate(['/login']);
      }
    }, 10000);
      //}, 2700000);
  }

  selectedBusiness(event: MatAutocompleteSelectedEvent): void{
    let userData = JSON.parse(sessionStorage.getItem('TC247_USS'));
    userData.Business_Id = event.option.value.BusinessId;
    userData.Business_Name = event.option.value.Name;
    userData.User_Id = event.option.value.UserId;
    userData.Email = event.option.value.Email;
    sessionStorage.setItem('TC247_USS', JSON.stringify(userData));
    window.location.reload();
  }

  refreshToken(){
      let token = this.authService.currentRefreshToken();
      let userName = this.authService.cognitoUser();
      let formData = {
          RefreshTkn: token,
          Email: userName
      };
      this.resetToken$ =  this.userService.updateToken(formData).pipe(
        map((res: any) => {
          if (res.Code == 200){
              sessionStorage.setItem('TC247_TKN', JSON.stringify(res.token));
              sessionStorage.setItem('TC247_ACT', JSON.stringify(res.access));
          }
      }),
      catchError(res => {
        return res;
      })
    );
  }

  loadAccess(){
    this.apps$ = this.roleService.getApplications((this.roleId != '' ? this.roleId : 1), this.businessId, this.languageInit).pipe(
      map(res => res.sort(function (a, b) {
        if (a.OrderApp > b.OrderApp) {
          return 1;
        }
        if (a.OrderApp < b.OrderApp) {
          return -1;
        }
        return 0;
        })
      )
    );
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  compareFn = (a, b) => {
    if (a.OrderApp < b.OrderApp)
      return -1;
    if (a.OrderApp > b.OrderApp)
      return 1;
    return 0;
  };

  displayFn(business?: any): string | undefined {
    return business ? business.Name : undefined;
  }

  private _filterBusiness(value: any): any[] {
    const filterValue = value.toString().toLowerCase();
    return (filterValue != undefined ? this.allBusiness.filter((business: any) => business.Name.toLowerCase().indexOf(filterValue) === 0) : this.allBusiness);
  }

}
