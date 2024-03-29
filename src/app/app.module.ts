import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { MatRippleModule } from '@angular/material/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ReactiveFormsModule } from '@angular/forms';
import { Ng5SliderModule } from 'ng5-slider';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ZXingScannerModule } from '@zxing/ngx-scanner';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'; 

// services
import { SpinnerService } from '@shared/spinner.service';

// helpers interceptors jwt, errors, cache
import { JwtInterceptor, ErrorInterceptor } from '@app/core/interceptors';

import { AppRoutingModule, routingComponents } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SpinnerComponent } from '@shared/spinner/spinner.component';
import { DialogComponent } from '@shared/dialog/dialog.component';
import { VideoDialogComponent } from '@shared/video-dialog/video-dialog.component';
import { DirDialogComponent } from '@shared/dir-dialog/dir-dialog.component';
import { ShopdialogComponent } from '@shared/shopdialog/shopdialog.component';
import { AppoDialogComponent } from '@shared/appo-dialog/appo-dialog.component';
import { ShowappoDialogComponent } from '@shared/showappo-dialog/showappo-dialog.component';

import { LayoutModule } from '@angular/cdk/layout';
import { RoleListComponent } from '@modules/roles/role-list/role-list.component';
import { UserListComponent } from '@modules/users/user-list/user-list.component';
import { SearchComponent } from '@shared/search/search.component';
import { PollListComponent } from '@modules/polls/poll-list/poll-list.component';
import { UserlocComponent } from '@modules/userloc/userloc.component';
import { SurveyComponent } from '@modules/surveys/survey/survey.component';
import { SurveyListComponent } from '@modules/surveys/survey-list/survey-list.component';

//Directives
import { PhoneMaskDirective } from '@shared/phone-mask.directive';

import { AgmCoreModule } from '@agm/core';
import { PhonePipe } from '@shared/phone.pipe';
import { HourdataPipe } from '@shared/hourdata.pipe';
import { ServcolorPipe } from '@shared/servcolor.pipe';
import { NamecodePipe } from '@shared/namecode.pipe';
import { DatePipe } from '@angular/common';
import { PhoneMaskPipe } from '@shared/phone-mask.pipe';
import { ProviderListComponent } from '@modules/providers/provider-list/provider-list.component';
import { ServiceListComponent } from '@modules/services/service-list/service-list.component';
import { LocationListComponent } from '@modules/locations/location-list/location-list.component';
import { UserListAdminComponent } from '@modules/users-admin/user-list-admin/user-list-admin.component';
import { RoleListAdminComponent } from '@modules/roles-admin/role-list-admin/role-list-admin.component';
import { LearnDialogComponent } from '@shared/learn-dialog/learn-dialog.component';
import { CancelComponent } from './modules/cancel/cancel.component';
import { StickerDialogComponent } from '@shared/sticker-dialog/sticker-dialog.component';
import { AppowiDialogComponent } from '@shared/appowi-dialog/appowi-dialog.component';
import { MessDialogComponent } from '@shared/mess-dialog/mess-dialog.component';
import { NewBusinessComponent } from './modules/new-business/new-business.component';
import { TabDirectiveDirective } from '@shared/tab-directive.directive';
import { WeblinkComponent } from './modules/weblink/weblink.component';
import { SortHoursPipe } from './shared/sort-hours.pipe';
import { ServiceDataPipe } from './shared/service-data.pipe';
import { DialogcancelComponent } from './shared/dialogcancel/dialogcancel.component';
import { MaindashComponent } from './modules/maindash/maindash.component';
import { SearchAppoDialogComponent } from './shared/search-appo-dialog/search-appo-dialog.component';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';

@NgModule({
  declarations: [
    AppComponent,
    routingComponents,
    SpinnerComponent,
    DialogComponent,
    VideoDialogComponent,
    RoleListComponent,
    UserListComponent,
    SearchComponent,
    PhoneMaskDirective,
    PhonePipe,
    DirDialogComponent,
    UserlocComponent,
    PollListComponent,
    SurveyComponent,
    SurveyListComponent,
    AppoDialogComponent,
    ShowappoDialogComponent,
    ProviderListComponent,
    ServiceListComponent,
    LocationListComponent,
    HourdataPipe,
    ServcolorPipe,
    ShopdialogComponent,
    UserListAdminComponent,
    RoleListAdminComponent,
    LearnDialogComponent,
    CancelComponent,
    StickerDialogComponent,
    AppowiDialogComponent,
    MessDialogComponent,
    NewBusinessComponent,
    TabDirectiveDirective,
    PhoneMaskPipe,
    WeblinkComponent,
    NamecodePipe,
    SortHoursPipe,
    ServiceDataPipe,
    DialogcancelComponent,
    MaindashComponent,
    SearchAppoDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatButtonModule,
    MatPaginatorModule,
    MatListModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatCardModule,
    MatSnackBarModule,
    MatSelectModule,
    MatDialogModule,
    MatAutocompleteModule,
    MatSidenavModule,
    MatToolbarModule,
    MatMenuModule,
    MatTableModule,
    MatRadioModule,
    MatStepperModule,
    MatExpansionModule,
    MatChipsModule,
    MatSortModule,
    MatSlideToggleModule,
    MatSliderModule,
    DragDropModule,
    HttpClientModule,
    FormsModule,
    Ng5SliderModule,
    MatBadgeModule,
    MatProgressBarModule,
    MatButtonToggleModule,
    MatRippleModule,
    MatTabsModule,
    InfiniteScrollModule,
    NgxChartsModule,
    ZXingScannerModule,
    NgxQRCodeModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyBdQ6vAlbIi3u_KdiMv8KILsjYExJLDUGU'
    })
  ],
  exports: [
    PhoneMaskDirective
  ],
  providers: [
    SpinnerService,
    DatePipe,
    PhonePipe,
    PhoneMaskPipe,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ],
  entryComponents: [
    SpinnerComponent,
    DialogComponent,
    ShopdialogComponent,
    DirDialogComponent,
    VideoDialogComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
