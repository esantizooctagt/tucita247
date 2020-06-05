import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '@modules/authentication/guards/auth.guard';

/**Main Components**/
import { MainNavComponent, NotFoundComponent, LoginComponent, UsersComponent, ClientsComponent, DashboardComponent, ServicesComponent, ProfileComponent, BusinessComponent, CategoriesComponent, ReportsComponent, RolesComponent, HelpComponent, ResetComponent, VerificationComponent, ForgotpassComponent, HomeComponent, HostComponent, UserlocComponent, PollsComponent } from '@modules/index';

const routes: Routes = [
  { 
    path: '', component: MainNavComponent, canActivate: [AuthGuard],
    children: [
      { path: 'users', component: UsersComponent, canActivate: [AuthGuard] },
      { path: 'clients', component: ClientsComponent, canActivate: [AuthGuard] },
      { path: 'userloc', component: UserlocComponent, canActivate: [AuthGuard] },
      { path: 'polls', component: PollsComponent, canActivate: [AuthGuard] },
      { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
      { path: 'host', component: HostComponent, canActivate: [AuthGuard] },
      { path: 'services', component: ServicesComponent, canActivate: [AuthGuard] },
      { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
      { path: 'company', component: BusinessComponent, canActivate: [AuthGuard] },
      { path: 'categories', component: CategoriesComponent, canActivate: [AuthGuard] },
      { path: 'reports', component: ReportsComponent, canActivate: [AuthGuard] },
      { path: 'roles', component: RolesComponent, canActivate: [AuthGuard] },
      { path: 'help', component: HelpComponent, canActivate: [AuthGuard] }
    ]
  },
  { 
    path: 'login', 
    component: LoginComponent 
  },
  {
    path: 'forgotpassword',
    component: ForgotpassComponent
  },
  {
    path: 'resetpassword/:user/:code',
    component: ResetComponent
  },
  {
    path: 'verification/:user/:code',
    component: VerificationComponent
  },
  { 
    path: '**', 
    component: NotFoundComponent //redirectTo: '' 
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
export const routingComponents = [
  LoginComponent,
  MainNavComponent,
  NotFoundComponent,
  DashboardComponent,
  ProfileComponent,
  ForgotpassComponent,
  VerificationComponent,
  ResetComponent,
  ReportsComponent,
  UserlocComponent,
  UsersComponent,
  PollsComponent,
  ClientsComponent,
  ServicesComponent,
  BusinessComponent,
  CategoriesComponent,
  RolesComponent,
  HelpComponent,
  HomeComponent,
  HostComponent
]