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
import { map, catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ProviderService } from '@app/services';
import { Router } from '@angular/router';
import { LearnDialogComponent } from '@app/shared/learn-dialog/learn-dialog.component';

@Component({
  selector: 'app-provider-list',
  templateUrl: './provider-list.component.html',
  styleUrls: ['./provider-list.component.scss']
})
export class ProviderListComponent implements OnInit {
  @Input() filterValue: string;
  @ViewChild(MatSort) sort: MatSort;
  
  deleteProvider$: Observable<any>;
  providers$: Observable<any[]>;
  providers: any[]=[];
  public onError: string='';

  public length: number = 0;
  public pageSize: number = 10;
  public _page: number;
  private _currentPage: any[] = [];
  private _currentSearchValue: string = '';

  displayYesNo: boolean = false;

  displayedColumns = ['Name', 'Location', 'Actions'];
  dataSource = new MatTableDataSource<any>(this.providers);
  businessId: string = '';
  changeData: string;
  providerData: any;

  constructor(
    private domSanitizer: DomSanitizer,
    private authService: AuthService,
    private data: MonitorService,
    private spinnerService: SpinnerService,
    private dialog: MatDialog,
    private learnmore: MatDialog,
    private providerService: ProviderService,
    private matIconRegistry: MatIconRegistry,
    private router: Router
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

  openLearnMore(message: string): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      message: message
    };
    this.learnmore.open(LearnDialogComponent, dialogConfig);
  }

  ngOnInit(): void {
    this.businessId = this.authService.businessId();
    this._page = 1;
    this._currentPage.push({page: this._page, providerId: ''});
    this.loadProviders(
      this._currentPage[0].page, this.pageSize, this._currentSearchValue, this._currentPage[0].providerId
    );

    this.data.handleMessage.subscribe(res => this.changeData = res);
    this.data.objectMessage.subscribe(res => this.providerData = res);
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
      this._currentPage.push({page: this._page, providerId: ''});
      this.loadProviders(
        this._currentPage[0].page, this.pageSize, this._currentSearchValue, this._currentPage[0].providerId
      );
    }
  }

  loadProviders(crPage, crItems, crSearch, crlastItem) {
    this.onError = '';
    var spinnerRef = this.spinnerService.start($localize`:@@providers.loadservice:`);
    let data = this.businessId + "/" + crItems + (crSearch === '' ? '/_' : '/' + crSearch) + (crlastItem === '' ? '/_' : '/' +  crlastItem);

    this.providers$ = this.providerService.getProviders(data).pipe(
      map((res: any) => {
        if (res != null) {
          if (res.lastItem != ''){
            this.length = (this.pageSize*this._page)+1;
            this._currentPage.push({page: this._page+1, providerId: res.lastItem});
          }
        }
        this.providers = res.providers.sort((a, b) => (a.Name < b.Name ? -1 : 1));
        this.dataSource.data = this.providers;
        this.dataSource.sort = this.sort;
        this.spinnerService.stop(spinnerRef);
        return res.providers;
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
    this.loadProviders(
      this._currentPage[this._page-1].page,
      this.pageSize,
      this._currentSearchValue,
      this._currentPage[this._page-1].providerId
    );
  }

  onSelect(service: any){
    this.router.navigate(['/provider/'+service]);
  }

  onDelete(service: any){
    this.displayYesNo = true;
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      header: $localize`:@@providers.servprovider:`, 
      message: $localize`:@@providers.deletemessage:`, 
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
      if(result == undefined || result == false){ return; }
      if (result){
        var spinnerRef = this.spinnerService.start($localize`:@@providers.deletingservice:`); 
        this.deleteProvider$ = this.providerService.deleteProvider(this.businessId, service.LocationId, service.ProviderId).pipe(
          tap(res => {
            this.spinnerService.stop(spinnerRef);
            this.displayYesNo = false;
            this.loadProviders(
              this._currentPage[0].page, this.pageSize, this._currentSearchValue, this._currentPage[0].providerId
            );
            this.openDialog($localize`:@@providers.servprovider:`, $localize`:@@providers.deletedsuccess:`, true, false, false);
          }),
          catchError(err => {
            this.spinnerService.stop(spinnerRef);
            this.displayYesNo = false;
            this.openDialog($localize`:@@shared.error:`, err.Message, false, true, false);
            return throwError (err || err.message);
          })
        );
      }
    });
  }

  trackRow(index: number, item: any) {
    return item.ProviderId;
  }

  learnMore(textNumber: number){
    let message = '';
    switch(textNumber) { 
      case 18: { 
        message = $localize`:@@learnMore.LMCON18:`;
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