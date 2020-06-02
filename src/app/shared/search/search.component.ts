import { Component, Output, EventEmitter, OnDestroy, Input, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { shareReplay, map } from 'rxjs/operators';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnDestroy {
  @Input() readonly placeholder: string = '';
  // @Input() setForm: string;

  @Output() setValue: EventEmitter<string> = new EventEmitter();
  @Output() view: EventEmitter<string> = new EventEmitter();

  private _searchSubject: Subject<string> = new Subject();
  public loading:boolean = false;
  public searchValue: string='';
  public contentButton: string = '+ Add';
  private changeText: boolean = true;
  
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(
    private breakpointObserver: BreakpointObserver
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

  changeView(){
    this.changeText = !this.changeText;
    if (!this.changeText) {
      this.contentButton = 'Search';
    } else {
      this.contentButton = '+ Add'
    }
    let value = '';
    if (!this.changeText){
      value = 'Add';
    } else {
      value = 'Search';
    }
    this.view.emit( value );
    console.log('search emits ' + value);
  }

  // ngOnChanges(changes: SimpleChanges) {
  //   console.log(changes.setForm.currentValue);
  //   if (changes.setForm.currentValue != undefined){
  //     this.view.emit(changes.setForm.currentValue);
  //     this.changeText = !this.changeText;
  //     if (!this.changeText) {
  //       this.contentButton = 'Search';
  //     } else {
  //       this.contentButton = '+ Add'
  //     }
  //   }
  // }
  
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
