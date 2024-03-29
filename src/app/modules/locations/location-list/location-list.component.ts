import { Component, OnInit, ViewChild, Input, SimpleChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { Observable } from 'rxjs/internal/Observable';
import { DomSanitizer } from '@angular/platform-browser';
import { AuthService } from '@app/core/services';
import { MonitorService } from '@app/shared/monitor.service';
import { SpinnerService } from '@app/shared/spinner.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DialogComponent } from '@app/shared/dialog/dialog.component';
import { map, catchError } from 'rxjs/operators';
import { LocationService } from '@app/services';
import { Router } from '@angular/router';
import { LearnDialogComponent } from '@app/shared/learn-dialog/learn-dialog.component';

@Component({
  selector: 'app-location-list',
  templateUrl: './location-list.component.html',
  styleUrls: ['./location-list.component.scss']
})
export class LocationListComponent implements OnInit {
  @Input() filterValue: string;
  @ViewChild(MatSort) sort: MatSort;
  
  locations$: Observable<any[]>;
  locations: any[]=[];
  public onError: string='';

  public length: number = 0;
  public pageSize: number = 25;
  public _page: number;
  private _currentPage: any[] = [];
  private _currentSearchValue: string = '';

  displayYesNo: boolean = false;

  displayedColumns = ['Name', 'Actions'];
  dataSource = new MatTableDataSource<any>(this.locations);
  businessId: string = '';
  changeData: string;
  locationData: any;

  constructor(
    private domSanitizer: DomSanitizer,
    private authService: AuthService,
    private data: MonitorService,
    private spinnerService: SpinnerService,
    private dialog: MatDialog,
    private learnmore: MatDialog,
    private locationService: LocationService,
    private matIconRegistry: MatIconRegistry,
    private router: Router
  ) { 
    this.matIconRegistry.addSvgIcon('edit',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/edit.svg'));
    this.matIconRegistry.addSvgIcon('delete',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/delete.svg'));
  }

  openLearnMore(message: string): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      message: message
    };
    this.learnmore.open(LearnDialogComponent, dialogConfig);
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
        this.locations = res.locations.sort((a, b) => (a.Name < b.Name ? -1 : 1));
        this.dataSource.data = this.locations;
        this.dataSource.sort = this.sort;
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
    this.router.navigate(['/location/'+location]);
  }

  trackRow(index: number, item: any) {
    return item.LocationId;
  }

  learnMore(textNumber: number){
    let message = '';
    switch(textNumber) { 
      case 12: { 
        message = $localize`:@@learnMore.LMCON12:`;
        break; 
      }
      default: { 
        message = ''; 
        break; 
      } 
    } 
    this.openLearnMore(message);
  }

}
