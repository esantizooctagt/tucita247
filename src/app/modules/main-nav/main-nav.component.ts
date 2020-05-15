import { Component, OnInit, LOCALE_ID, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from '@app/shared/dialog/dialog.component';

import { User, Access } from '@app/_models';
import { AuthService } from '@core/services';
import { environment } from '@environments/environment';
import { RolesService } from '@app/services';

@Component({
  selector: 'app-main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.scss']
})
export class MainNavComponent implements OnInit {
  public online: boolean = true;
  businessId: string='';
  userId: string='';
  avatar: string='';
  roleId: string='';
  language: string='';
  isAdmin: boolean=false;
  collapse: boolean=false;
  dispHome: boolean=true;

  apps$: Observable<Access[]>;

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
    if (this.router.url != '/'){
      this.dispHome = false;
    }
    this.businessId = this.authService.businessId();
    this.roleId = this.authService.roleId();
    this.userId = this.authService.userId();
    this.isAdmin = this.authService.isAdmin();
    if (this.authService.avatar() != '') {
      this.avatar = this.imgPath + this.authService.avatar();
    }
    this.loadAccess();
  }

  loadAccess(){
    this.apps$ = this.roleService.getApplications((this.roleId != '' ? this.roleId : 0), this.businessId);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  OnCollapse(){
    this.collapse = !this.collapse;
  }

  displayHome(event){
    if (event != '') {
      this.dispHome = false;
    }
  }

}
