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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ReactiveFormsModule } from '@angular/forms';
import { Ng5SliderModule } from 'ng5-slider';
import { NgxChartsModule } from '@swimlane/ngx-charts';

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

import { LayoutModule } from '@angular/cdk/layout';
import { RoleComponent } from '@modules/roles/role/role.component';
import { RoleListComponent } from '@modules/roles/role-list/role-list.component';
import { UserListComponent } from '@modules/users/user-list/user-list.component';
import { UserComponent } from '@modules/users/user/user.component';
import { SearchComponent } from '@shared/search/search.component';
import { PollComponent } from '@modules/polls/poll/poll.component';
import { PollListComponent } from '@modules/polls/poll-list/poll-list.component';
import { UserlocComponent } from '@modules/userloc/userloc.component';
import { SurveyComponent } from '@modules/surveys/survey/survey.component';
import { SurveyListComponent } from './modules/surveys/survey-list/survey-list.component';

//Directives
import { PhoneMaskDirective } from '@shared/phone-mask.directive';

import { AgmCoreModule } from '@agm/core';
import { PhonePipe } from '@shared/phone.pipe';
import { AppoDialogComponent } from './shared/appo-dialog/appo-dialog.component';
import { ShowappoDialogComponent } from './shared/showappo-dialog/showappo-dialog.component';
import { DatePipe } from '@angular/common';
import { ProviderComponent } from '@modules/providers/provider/provider.component';
import { ProviderListComponent } from '@modules/providers/provider-list/provider-list.component';
import { ServiceListComponent } from '@modules/services/service-list/service-list.component';
import { ServiceComponent } from '@modules/services/service/service.component';

@NgModule({
  declarations: [
    AppComponent,
    routingComponents,
    SpinnerComponent,
    DialogComponent,
    VideoDialogComponent,
    RoleComponent,
    RoleListComponent,
    UserListComponent,
    UserComponent,
    SearchComponent,
    PhoneMaskDirective,
    PhonePipe,
    DirDialogComponent,
    UserlocComponent,
    PollComponent,
    PollListComponent,
    SurveyComponent,
    SurveyListComponent,
    AppoDialogComponent,
    ShowappoDialogComponent,
    ProviderComponent,
    ProviderListComponent,
    ServiceListComponent,
    ServiceComponent
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
    MatTabsModule,
    InfiniteScrollModule,
    NgxChartsModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyCyKdLcjPnI3n5Eb2VmMJk-sgan83LEsCM'
    })
  ],
  exports: [
    PhoneMaskDirective
  ],
  providers: [
    SpinnerService,
    DatePipe,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ],
  entryComponents: [
    SpinnerComponent,
    DialogComponent,
    DirDialogComponent,
    VideoDialogComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
