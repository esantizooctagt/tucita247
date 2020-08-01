import { Component, OnInit, ViewChild, Input, SimpleChanges } from '@angular/core';
import { MatTable } from '@angular/material/table';
import { Observable } from 'rxjs/internal/Observable';
import { FormArray, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { AuthService } from '@app/core/services';
import { MonitorService } from '@app/shared/monitor.service';
import { SpinnerService } from '@app/shared/spinner.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DialogComponent } from '@app/shared/dialog/dialog.component';
import { map, catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ServService } from '@app/services';

@Component({
  selector: 'app-service-list',
  templateUrl: './service-list.component.html',
  styleUrls: ['./service-list.component.scss']
})
export class ServiceListComponent implements OnInit {
  @Input() filterValue: string;
  @ViewChild(MatTable) serviceTable :MatTable<any>;
  
  deleteService$: Observable<any>;
  services$: Observable<any[]>;
  public onError: string='';

  public length: number = 0;
  public pageSize: number = 10;
  public _page: number;
  private _currentPage: any[] = [];
  private _currentSearchValue: string = '';

  displayYesNo: boolean = false;

  displayedColumns = ['Name', 'Actions'];
  businessId: string = '';
  changeData: string;
  serviceData: any;

  get fServices(){
    return this.serviceForm.get('Services') as FormArray;
  }

  serviceForm = this.fb.group({
    Services: this.fb.array([this.addServices()])
  });

  addServices(): FormGroup{
    return this.fb.group({
      ServiceId: [''],
      Name: ['', [Validators.required, Validators.maxLength(100), Validators.minLength(3)]],
      Status: []
    });
  }

  constructor(
    private fb: FormBuilder,
    private domSanitizer: DomSanitizer,
    private authService: AuthService,
    private data: MonitorService,
    private spinnerService: SpinnerService,
    private dialog: MatDialog,
    private serviceService: ServService,
    private matIconRegistry: MatIconRegistry
  ) { 
    this.matIconRegistry.addSvgIcon('edit',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/edit.svg'));
    this.matIconRegistry.addSvgIcon('delete',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/delete.svg'));
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

  ngOnInit(): void {
    this.businessId = this.authService.businessId();
    this._page = 1;
    this._currentPage.push({page: this._page, serviceId: ''});
    this.loadServices(
      this._currentPage[0].page, this.pageSize, this._currentSearchValue, this._currentPage[0].serviceId
    );

    this.data.handleMessage.subscribe(res => this.changeData = res);
    this.data.objectMessage.subscribe(res => this.serviceData = res);
    this.data.setData(undefined);
  }

  ngAfterViewChecked() {
    //change style page number
    const list = document.getElementsByClassName('mat-paginator-range-label');
    list[0].innerHTML = this._page.toString();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.filterValue.currentValue != undefined){
      this._currentSearchValue = changes.filterValue.currentValue;
      this._currentPage = [];
      this._page = 1;
      this._currentPage.push({page: this._page, serviceId: ''});
      this.loadServices(
        this._currentPage[0].page, this.pageSize, this._currentSearchValue, this._currentPage[0].serviceId
      );
    }
  }

  loadServices(crPage, crItems, crSearch, crlastItem) {
    this.onError = '';
    var spinnerRef = this.spinnerService.start("Loading Services...");
    let data = this.businessId + "/" + crItems + (crSearch === '' ? '/_' : '/' + crSearch) + (crlastItem === '' ? '/_' : '/' +  crlastItem);

    this.services$ = this.serviceService.getServices(data).pipe(
      map((res: any) => {
        if (res != null) {
          if (res.lastItem != ''){
            this.length = (this.pageSize*this._page)+1;
            this._currentPage.push({page: this._page+1, serviceId: res.lastItem});
          }
        }
        this.serviceForm.setControl('Services', this.setExistingServices(res.services));
        this.spinnerService.stop(spinnerRef);
        return res.services;
      }),
      catchError(err => {
        this.onError = err.Message;
        this.spinnerService.stop(spinnerRef);
        return this.onError;
      })
    );
  }

  setExistingServices(services: any[]): FormArray{
    const formArray = new FormArray([]);
    services.forEach(res => {
      formArray.push(this.fb.group({
          ServiceId: res.ServiceId,
          Name: res.Name,
          Status: res.Status
        })
      );
      this.serviceTable.renderRows();
    });
    return formArray;
  }

  public goToPage(page: number, elements: number): void {
    if (this.pageSize != elements){
      this.pageSize = elements;
      this._page = 1;
    } else {
      this._page = page+1;
    }
    this.loadServices(
      this._currentPage[this._page-1].page,
      this.pageSize,
      this._currentSearchValue,
      this._currentPage[this._page-1].serviceId
    );
  }

  onSelect(service: any){
    this.data.setData(service);
    this.data.handleData('Add');
  }

  onDelete(service: any){
    this.displayYesNo = true;
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      header: 'Service', 
      message: 'Are you sure to delete this Service?', 
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
        var spinnerRef = this.spinnerService.start("Deleting Service...");
        if (result){ 
          this.deleteService$ = this.serviceService.deleteService(this.businessId, service.value.ServiceId).pipe(
            tap(res => {
              this.spinnerService.stop(spinnerRef);
              this.displayYesNo = false;
              this.loadServices(
                this._currentPage[0].page, this.pageSize, this._currentSearchValue, this._currentPage[0].serviceId
              );
              this.openDialog('Service', 'Service deleted successfully', true, false, false);
            }),
            catchError(err => {
              this.spinnerService.stop(spinnerRef);
              this.displayYesNo = false;
              this.openDialog('Error ! ', err.Message, false, true, false);
              return throwError (err || err.message);
            })
          );
        }
      }
    });
  }

  trackRow(index: number, item: any) {
    return item.ServiceId;
  }

}
