import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '@modules/authentication/guards/auth.guard';

/**Main Components**/
import { MainNavComponent, NotFoundComponent, LoginComponent, UsersComponent, ClientsComponent, DashboardComponent, ServicesComponent, ProfileComponent, BusinessComponent, CategoriesComponent, ReportsComponent, RolesComponent, HelpComponent, ResetComponent, VerificationComponent, ForgotpassComponent, HomeComponent, HostComponent, UserlocComponent, PollsComponent, PollRespComponent, QuickCheckinComponent, SurveysComponent, SurveyRespComponent, LandingComponent, ScheduleComponent, TimeComponent, CompanyOpeHoursComponent, CompanySpecDaysComponent, LocationOpeHoursComponent, LocationSpecDaysComponent, ProviderOpeHoursComponent, ProviderSpecDaysComponent } from '@modules/index';

const routes: Routes = [
  {
    path: '', component: MainNavComponent, canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full'},
      { path: 'users', component: UsersComponent, canActivate: [AuthGuard] },
      { path: 'clients', component: ClientsComponent, canActivate: [AuthGuard] },
      { path: 'userloc', component: UserlocComponent, canActivate: [AuthGuard] },
      { path: 'polls', component: PollsComponent, canActivate: [AuthGuard] },
      { path: 'surveys', component: SurveysComponent, canActivate: [AuthGuard] },
      { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
      { path: 'host', component: HostComponent, canActivate: [AuthGuard] },
      { path: 'quick-checkin', component: QuickCheckinComponent, canActivate: [AuthGuard] },
      { path: 'services', component: ServicesComponent, canActivate: [AuthGuard] },
      { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
      { path: 'company', component: BusinessComponent, canActivate: [AuthGuard] },
      { path: 'categories', component: CategoriesComponent, canActivate: [AuthGuard] },
      { path: 'reports', component: ReportsComponent, canActivate: [AuthGuard] },
      { path: 'roles', component: RolesComponent, canActivate: [AuthGuard] },
      { path: 'schedule', component: ScheduleComponent, canActivate: [AuthGuard] },
      { path: 'time', component: TimeComponent, canActivate: [AuthGuard] },
      { path: 'company-ope-hours', component: CompanyOpeHoursComponent, canActivate: [AuthGuard] },
      { path: 'company-spec-days', component: CompanySpecDaysComponent, canActivate: [AuthGuard] },
      { path: 'location-ope-hours', component: LocationOpeHoursComponent, canActivate: [AuthGuard] },
      { path: 'location-spec-days', component: LocationSpecDaysComponent, canActivate: [AuthGuard] },
      { path: 'provider-ope-hours', component: ProviderOpeHoursComponent, canActivate: [AuthGuard] },
      { path: 'provider-spec-days', component: ProviderSpecDaysComponent, canActivate: [AuthGuard] },
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
    path: 'verification/:userId/:code',
    component: VerificationComponent
  },
  {
    path: 'poll-response/:pollId/:custId',
    component: PollRespComponent
  },
  {
    path: 'survey-response/:surveyId/:custId',
    component: SurveyRespComponent
  },
  {
    path: ':landing',
    component: LandingComponent
  },
  {
    path: '**',
    component: NotFoundComponent,
    redirectTo: '' 
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
  PollRespComponent,
  SurveyRespComponent,
  SurveysComponent,
  LandingComponent,
  RolesComponent,
  HelpComponent,
  HomeComponent,
  HostComponent,
  TimeComponent,
  ScheduleComponent,
  QuickCheckinComponent
]