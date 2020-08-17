import { Component, Output, EventEmitter, OnDestroy, Input, SimpleChanges, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { shareReplay, map } from 'rxjs/operators';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MonitorService } from '../monitor.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {
  @Input() readonly placeholder: string = '';
  @Output() setValue: EventEmitter<string> = new EventEmitter();

  private _searchSubject: Subject<string> = new Subject();
  public loading:boolean = false;
  public searchValue: string='';
  public contentButton: string = '+ Add';
  changeData: string = '';
  
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(
    private breakpointObserver: BreakpointObserver,
    private monitorService: MonitorService
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

  ngOnInit(){
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
    let value = '';
    if (this.changeData == 'Search'){
      value = 'Add';
    } else {
      value = 'Search';
    }
    this.monitorService.handleData(value);
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
