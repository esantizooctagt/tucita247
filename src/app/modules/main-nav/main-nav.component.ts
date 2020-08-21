import { Component, OnInit, LOCALE_ID, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay, catchError } from 'rxjs/operators';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from '@app/shared/dialog/dialog.component';

import { User, Access } from '@app/_models';
import { AuthService } from '@core/services';
import { environment } from '@environments/environment';
import { RolesService, UserService } from '@app/services';

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
  apps$: Observable<Access[]>;

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
    private router: Router
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
    this.loadAccess();

    setInterval(() => { 
      this.refreshToken();
    }, 1800000);
      //}, 2700000);
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

}
