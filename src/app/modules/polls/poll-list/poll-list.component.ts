import { Component, OnInit, Input, SimpleChanges, ViewChild } from '@angular/core';
import { Poll } from '@app/_models';
import { FormBuilder, Validators, FormGroup, FormArray } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { AuthService } from '@app/core/services';
import { MonitorService } from '@app/shared/monitor.service';
import { SpinnerService } from '@app/shared/spinner.service';
import { MatIconRegistry } from '@angular/material/icon';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from '@app/shared/dialog/dialog.component';
import { catchError, tap, map } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';
import { PollsService } from '@app/services';
import { MatTable } from '@angular/material/table';

@Component({
  selector: 'app-poll-list',
  templateUrl: './poll-list.component.html',
  styleUrls: ['./poll-list.component.scss']
})
export class PollListComponent implements OnInit {
  @Input() filterValue: string;
  @ViewChild(MatTable) pollTable :MatTable<any>;
  
  deletePoll$: Observable<any>;
  polls$: Observable<Poll[]>;
  public onError: string='';

  public length: number = 0;
  public pageSize: number = 10;
  public _page: number;
  private _currentPage: any[] = [];
  private _currentSearchValue: string = '';

  displayYesNo: boolean = false;

  displayedColumns = ['Name', 'DatePoll', 'DateFinPoll', 'Actions'];
  businessId: string = '';
  changeData: string;
  pollData: Poll;

  get fPolls(){
    return this.pollForm.get('Polls') as FormArray;
  }

  pollForm = this.fb.group({
    Polls: this.fb.array([this.addPolls()])
  });

  addPolls(): FormGroup{
    return this.fb.group({
      PollId: [''],
      Name: ['', [Validators.required, Validators.maxLength(100), Validators.minLength(3)]],
      DatePoll: ['', Validators.required]
    });
  }

  constructor(
    private fb: FormBuilder,
    private domSanitizer: DomSanitizer,
    private authService: AuthService,
    private data: MonitorService,
    private spinnerService: SpinnerService,
    private dialog: MatDialog,
    private pollService: PollsService,
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
    this._currentPage.push({page: this._page, pollId: ''});
    this.loadPolls(
      this._currentPage[0].page, this.pageSize, this._currentSearchValue, this._currentPage[0].pollId
    );

    this.data.handleMessage.subscribe(res => this.changeData = res);
    this.data.objectMessage.subscribe(res => this.pollData = res);
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
      this._currentPage.push({page: this._page, pollId: ''});
      this.loadPolls(
        this._currentPage[0].page, this.pageSize, this._currentSearchValue, this._currentPage[0].pollId
      );
    }
  }

  loadPolls(crPage, crItems, crSearch, crlastItem) {
    this.onError = '';
    var spinnerRef = this.spinnerService.start($localize`:@@polls.loadingpolls:`);
    let data = this.businessId + "/" + crItems + (crSearch === '' ? '/_' : '/' + crSearch) + (crlastItem === '' ? '/_' : '/' +  crlastItem);

    this.polls$ = this.pollService.getPolls(data).pipe(
      map((res: any) => {
        if (res != null) {
          if (res.lastItem != ''){
            this.length = (this.pageSize*this._page)+1;
            this._currentPage.push({page: this._page+1, pollId: res.lastItem});
          }
        }
        this.pollForm.setControl('Polls', this.setExistingPolls(res.polls));
        this.spinnerService.stop(spinnerRef);
        return res.polls;
      }),
      catchError(err => {
        this.onError = err.Message;
        this.spinnerService.stop(spinnerRef);
        return this.onError;
      })
    );
  }

  setExistingPolls(polls: Poll[]): FormArray{
    const formArray = new FormArray([]);
    polls.forEach(res => {
      formArray.push(this.fb.group({
          PollId: res.PollId,
          Name: res.Name,
          DatePoll: res.DatePoll,
          DateFinPoll: res.DateFinPoll
        })
      );
      this.pollTable.renderRows();
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
    this.loadPolls(
      this._currentPage[this._page-1].page,
      this.pageSize,
      this._currentSearchValue,
      this._currentPage[this._page-1].pollId
    );
  }

  onSelect(poll: any){
    this.data.setData(poll);
    this.data.handleData('Add');
  }

  onDelete(poll: any){
    this.displayYesNo = true;
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      header: $localize`:@@polls.pollsing:`, 
      message: $localize`:@@polls.deletepoll:`, 
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
        var spinnerRef = this.spinnerService.start($localize`:@@polls.deletingpoll:`);
        if (result){ 
          this.deletePoll$ = this.pollService.deletePoll(poll.value.PollId, this.businessId, poll.value.DatePoll).pipe(
            tap(res => {
              this.spinnerService.stop(spinnerRef);
              this.displayYesNo = false;
              this.loadPolls(
                this._currentPage[0].page, this.pageSize, this._currentSearchValue, this._currentPage[0].pollId
              );
              this.openDialog($localize`:@@polls.pollssub:`, $localize`:@@polls.deletedsuccessful:`, true, false, false);
            }),
            catchError(err => {
              this.spinnerService.stop(spinnerRef);
              this.displayYesNo = false;
              this.openDialog($localize`:@@shared.error:`, err.Message, false, true, false);
              return throwError (err || err.message);
            })
          );
        }
      }
    });
  }

  trackRow(index: number, item: Poll) {
    return item.PollId;
  }

}
