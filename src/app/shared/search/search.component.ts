import { Component, Output, EventEmitter, OnDestroy, Input, SimpleChanges, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { shareReplay, map } from 'rxjs/operators';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MonitorService } from '../monitor.service';
import { Router } from '@angular/router';
import { BusinessService } from '@app/services';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { ShopdialogComponent } from '../shopdialog/shopdialog.component';
import { AuthService } from '@app/core/services';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {
  @Input() readonly placeholder: string = '';
  @Input() readonly newRoute: string = '';
  @Output() setValue: EventEmitter<string> = new EventEmitter();

  private _searchSubject: Subject<string> = new Subject();
  public loading:boolean = false;
  public searchValue: string='';
  public contentButton: string = '+ Add';
  businessId: string = '';
  email: string = '';
  appos$: Observable<any>;

  changeData: string = '';
  
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(
    private breakpointObserver: BreakpointObserver,
    private monitorService: MonitorService,
    private businessService: BusinessService,
    private dialog: MatDialog,
    private authService: AuthService,
    private router: Router
  ) {
    this._setSearchSubscription();
   }

  private _setSearchSubscription() {
    this._searchSubject.pipe(
      map(value => value),
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe((searchValue: string) => {
      this.setValue.emit( searchValue );
    });
  }

  openShopDialog(header: string, message: string, business: string, email: string): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      header: header,
      message: message,
      businessId: business,
      email: email
    };
    dialogConfig.width = '280px';
    dialogConfig.minWidth = '280px';
    dialogConfig.maxWidth = '280px';
    this.dialog.open(ShopdialogComponent, dialogConfig);
  }
  
  ngOnInit(){
    this.businessId = this.authService.businessId();
    this.email = this.authService.email();
    this.monitorService.handleMessage.subscribe(res => { 
      this.changeData = res;
      if (this.changeData == "Add"){
        this.contentButton = $localize`:@@search.search:`;
      } else {
        this.contentButton = $localize`:@@search.addplus:`;
      }
    });
  }

  changeView(){
    if (this.newRoute == 'location' || this.newRoute == 'service' || this.newRoute == 'provider'){
      this.appos$ = this.businessService.getBusinessAppos(this.businessId).pipe(
        map((res: any) => {
          if (res != null){
            if (res.Name.toString().toUpperCase() == 'FREE' || res.Name.toString().toUpperCase() == 'GRATIS'){
              this.openShopDialog($localize`:@@shared.shopheader:`, $localize`:@@shared.shopmessage:`, this.businessId, this.email);
              if (this.newRoute == 'service'){
                this.router.navigate(['/services']);  
              }
              if (this.newRoute == 'location'){
                this.router.navigate(['/locations']);
              }
              if (this.newRoute == 'provider'){
                this.router.navigate(['/providers']);
              }
            } else {
              this.redirectPage();
            }
            return res;
          } else {
            if (this.newRoute == 'service'){
              this.router.navigate(['/services']);  
            }
            if (this.newRoute == 'location'){
              this.router.navigate(['/locations']);
            }
            if (this.newRoute == 'provider'){
              this.router.navigate(['/providers']);
            }
          }
        }),
        catchError(err => {
          return err;
        })
      );
    } else {
      this.redirectPage();
    }
  }
  
  redirectPage(){
    this.router.navigate(['/'+this.newRoute+'/0']);
  }
  public updateSearchUp(event, searchTextValue: string) {
    this.loading = true;
    debounceTime(500);
    this._searchSubject.next( searchTextValue );
    this.loading = false;
  }

  public cleanValue(){
    this.loading = true;
    debounceTime(500);
    this._searchSubject.next( '' );
    this.loading = false;
  }

  ngOnDestroy() {
    this._searchSubject.unsubscribe();
  }

}
