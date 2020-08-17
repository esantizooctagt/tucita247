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
import { map, catchError } from 'rxjs/operators';
import { LocationService } from '@app/services';

@Component({
  selector: 'app-location-list',
  templateUrl: './location-list.component.html',
  styleUrls: ['./location-list.component.scss']
})
export class LocationListComponent implements OnInit {
  @Input() filterValue: string;
  @ViewChild(MatTable) locationTable :MatTable<any>;
  
  locations$: Observable<any[]>;
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
  locationData: any;

  get fLocations(){
    return this.locationForm.get('Locations') as FormArray;
  }

  locationForm = this.fb.group({
    Locations: this.fb.array([this.addLocations()])
  });

  addLocations(): FormGroup{
    return this.fb.group({
      LocationId: [''],
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
    private locationService: LocationService,
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
    this._currentPage.push({page: this._page, locationId: ''});
    this.loadLocations(
      this._currentPage[0].page, this.pageSize, this._currentSearchValue, this._currentPage[0].locationId
    );

    this.data.handleMessage.subscribe(res => this.changeData = res);
    this.data.objectMessage.subscribe(res => this.locationData = res);
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
      this._currentPage.push({page: this._page, locationId: ''});
      this.loadLocations(
        this._currentPage[0].page, this.pageSize, this._currentSearchValue, this._currentPage[0].locationId
      );
    }
  }

  loadLocations(crPage, crItems, crSearch, crlastItem) {
    this.onError = '';
    var spinnerRef = this.spinnerService.start($localize`:@@locations.loadlocations:`);
    let data = this.businessId + "/" + crItems + (crSearch === '' ? '/_' : '/' + crSearch) + (crlastItem === '' ? '/_' : '/' +  crlastItem);

    this.locations$ = this.locationService.getLocationsData(data).pipe(
      map((res: any) => {
        if (res != null) {
          if (res.lastItem != ''){
            this.length = (this.pageSize*this._page)+1;
            this._currentPage.push({page: this._page+1, locationId: res.lastItem});
          }
        }
        this.locationForm.setControl('Locations', this.setExistingServices(res.locations));
        this.spinnerService.stop(spinnerRef);
        return res.locations;
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
          LocationId: res.LocationId,
          Name: res.Name,
          Status: res.Status
        })
      );
      this.locationTable.renderRows();
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
    this.loadLocations(
      this._currentPage[this._page-1].page,
      this.pageSize,
      this._currentSearchValue,
      this._currentPage[this._page-1].locationId
    );
  }

  onSelect(location: any){
    this.data.setData(location);
    this.data.handleData('Add');
  }

  trackRow(index: number, item: any) {
    return item.LocationId;
  }

}
