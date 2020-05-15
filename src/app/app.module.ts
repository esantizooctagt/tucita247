import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

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
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ReactiveFormsModule } from '@angular/forms';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'; 

// services
import { SpinnerService } from '@shared/spinner.service';

// helpers interceptors jwt, errors, cache
import { JwtInterceptor, ErrorInterceptor } from '@app/core/interceptors';

import { AppRoutingModule, routingComponents } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SpinnerComponent } from '@shared/spinner/spinner.component';
import { DialogComponent } from './shared/dialog/dialog.component';

import { LayoutModule } from '@angular/cdk/layout';
import { RoleComponent } from './modules/roles/role/role.component';
import { RoleListComponent } from './modules/roles/role-list/role-list.component';
import { UserListComponent } from './modules/users/user-list/user-list.component';
import { UserComponent } from './modules/users/user/user.component';
import { SearchComponent } from './shared/search/search.component';

@NgModule({
  declarations: [
    AppComponent,
    routingComponents,
    SpinnerComponent,
    DialogComponent,
    RoleComponent,
    RoleListComponent,
    UserListComponent,
    UserComponent,
    SearchComponent
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
    DragDropModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [
    SpinnerService,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ],
  entryComponents: [
    SpinnerComponent,
    DialogComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
