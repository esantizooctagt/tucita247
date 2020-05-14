import { Component, OnInit } from '@angular/core';
import { Category } from '@app/_models';
import { AuthService } from '@core/services';
import { CategoryService, RolesService } from "@app/services";
import { ConfirmValidParentMatcher } from '@app/validators';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable, throwError, Subscription } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from '@app/shared/dialog/dialog.component';
import { Router } from '@angular/router';
import { SpinnerService } from '@app/shared/spinner.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {
  get f(){
    return this.categoryForm.controls;
  }

  businessId: string='';
  displayForm: boolean =true;
  categories$: Observable<Category[]>;
  category$: Observable<Category>;
  categorySave$: Observable<any>;
  deleteCategory$: Observable<any>;
  access: Subscription;
  
  loading: boolean=false;
  savingCategory: boolean=false;
  displayYesNo: boolean=false;
  deleted: boolean = false;
  deletingCategory: boolean = false;

  confirmValidParentMatcher = new ConfirmValidParentMatcher();
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private dialog: MatDialog,
    private categoryService: CategoryService,
    private spinnerService: SpinnerService,
    private roleService: RolesService,
    private router: Router
  ) { }

  categoryForm = this.fb.group({
    CategoryId: [''],
    businessId: [''],
    Description: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(70)]],
    Status: [1]
  })

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
  let isAdmin = this.authService.isAdmin();
    let roleId = this.authService.roleId();
    if (roleId != '' && isAdmin != 1){
      this.access = this.roleService.getAccess(roleId, 'Categories').subscribe(res => {
        if (res != null){
          if (res.Value === 0){
            this.router.navigate(['/']);
          } else {
            this.initData();
          }
        }
      });
    } else {
      this.initData();
    }
  }

  initData(){
    var spinnerRef = this.spinnerService.start("Loading Categories...");
    this.businessId = this.authService.businessId();
    this.categories$ = this.categoryService.getCategories(this.businessId);
    this.spinnerService.stop(spinnerRef);
  }

  getErrorMessage(component: string) {
    if (component === 'Description'){
      return this.categoryForm.controls.Description.hasError('required') ? 'You must enter a value' :
        this.categoryForm.controls.Description.hasError('maxlength') ? 'Maximun length 70' :
          this.categoryForm.controls.Description.hasError('minlength') ? 'Minimun length 3' :
              '';
    }
  }

  onSelect(value: string){
    if (value != undefined) {
      var spinnerRef = this.spinnerService.start("Loading Category...");
      this.categoryForm.reset({ CategoryId: "", businessId: this.businessId, Description: "", Status: 1 });
      this.category$ = this.categoryService.getCategory(value).pipe(
        tap(res => {
          if (res != null) {
            this.categoryForm.setValue({
              CategoryId: res.Category_Id,
              businessId: res.Company_Id,
              Description: res.Description,
              Status: res.Status
            });
          }
          this.spinnerService.stop(spinnerRef);
        }),
        catchError(err => {
          this.spinnerService.stop(spinnerRef);
          this.openDialog('Error !', err.Message, false, true, false);
          return throwError(err || err.message);
        })
      );
    } else {
      this.categoryForm.reset({ CategoryId: "", businessId: this.businessId, Description: "", Status: 1 });
    }
  }

  onDelete(value: string){
    if (value != undefined){
      this.displayYesNo = true;

      const dialogConfig = new MatDialogConfig();
      dialogConfig.autoFocus = false;
      dialogConfig.data = {
        header: 'Category', 
        message: 'Are you sure to delete this Category?', 
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
          var spinnerRef = this.spinnerService.start("Deleting Category...");
          this.deleted = result;
          if (this.deleted){
            this.loading = true;
            this.deleted = false; 
            this.deleteCategory$ = this.categoryService.deleteCategory(value).pipe(
              tap(res => {
                this.spinnerService.stop(spinnerRef);
                this.displayYesNo = false;
                this.deletingCategory = true;
                this.categories$ = this.categoryService.getCategories(this.businessId);
                this.openDialog('Category', 'Category deleted successful', true, false, false);
                window.scroll(0,0);
              }),
              catchError(err => {
                this.spinnerService.stop(spinnerRef);
                this.displayYesNo = false;
                this.deletingCategory = false;
                this.openDialog('Error ! ', err.Message, false, true, false);
                return throwError (err || err.message);
              })
            );
          }
        }
      });
    }
  }

  onCancel(){
    this.categoryForm.reset({ CategoryId: "", businessId: this.businessId, Description: "", Status: 1 });
  }

  onSubmit(){
    if (this.categoryForm.invalid){
      return;
    }
    if (this.categoryForm.touched){
      let catId = this.categoryForm.value.CategoryId;
      var spinnerRef = this.spinnerService.start("Saving Category...");
      let userId = this.authService.userId();
      if (catId !== '' && catId !== null) {
        let dataForm =  { 
          "Description": this.categoryForm.value.Description,
          "businessId": this.businessId,
          "UserId": userId,
          "Status": this.categoryForm.value.Status
        }
        this.categorySave$ = this.categoryService.updateCategory(catId, dataForm).pipe(
          tap(res => { 
            this.savingCategory = true;
            this.spinnerService.stop(spinnerRef);
            this.categoryForm.reset({ CategoryId: "", businessId: this.businessId, Description: "", Status: 1 });
            this.categories$ = this.categoryService.getCategories(this.businessId);
            this.openDialog('Categories', 'Category updated successful', true, false, false);
          }),
          catchError(err => {
            this.spinnerService.stop(spinnerRef);
            this.savingCategory = false;
            this.openDialog('Error !', err.Message, false, true, false);
            return throwError(err || err.message);
          })
        );
      } else {
        let dataForm =  { 
          "Description": this.categoryForm.value.Description,
          "businessId": this.businessId,
          "UserId": userId,
          "Status": this.categoryForm.value.Status
        }
        this.categorySave$ = this.categoryService.postCategory(dataForm).pipe(
          tap(res => { 
            this.savingCategory = true;
            this.spinnerService.stop(spinnerRef);
            this.categoryForm.reset({ CategoryId: "", businessId: this.businessId, Description: "", Status: 1 });
            this.categories$ = this.categoryService.getCategories(this.businessId);
            this.openDialog('Categories', 'Category created successful', true, false, false);
          }),
          catchError(err => {
            this.spinnerService.stop(spinnerRef);
            this.savingCategory = false;
            this.openDialog('Error !', err.Message, false, true, false);
            return throwError(err || err.message);
          })
        );
      }
    }
  }

  trackById(index: number, item: Category) {
    return item.Category_Id;
  }
  
  ngOnDestroy() {
    if (this.access != undefined){
      this.access.unsubscribe();
    }
  }

}
