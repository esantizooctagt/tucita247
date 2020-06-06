import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { Poll } from '@app/_models';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { AuthService } from '@app/core/services';
import { MonitorService } from '@app/shared/monitor.service';
import { SpinnerService } from '@app/shared/spinner.service';
import { MatIconRegistry } from '@angular/material/icon';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from '@app/shared/dialog/dialog.component';
import { catchError, tap } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';
import { PollsService } from '@app/services';

@Component({
  selector: 'app-poll-list',
  templateUrl: './poll-list.component.html',
  styleUrls: ['./poll-list.component.scss']
})
export class PollListComponent implements OnInit {
  @Input() filterValue: string;
  deletePoll$: Observable<any>;
  public onError: string='';


  public length: number = 0;
  public pageSize: number = 10;
  public _page: number;
  private _currentPage: any[] = [];
  private _currentSearchValue: string = '';

  displayYesNo: boolean = false;

  displayedColumns = ['Description', 'DatePoll', 'Happy', 'Neutral', 'Angry', 'Actions'];
  businessId: string = '';
  changeData: string;
  pollData: Poll;

  get fPolls(){
    return this.pollForm.controls;
  }

  pollForm = this.fb.group({
    PollId: [''],
    Name: ['', [Validators.required, Validators.maxLength(100), Validators.minLength(3)]],
    DatePoll: ['', Validators.required],
    Questions: this.fb.array([this.createQuestion()]),
    Status: [false]
  });

  createQuestion(): FormGroup {
    const items = this.fb.group({
        QuestionId: [''],
        Description: ['']
    })
    return items;
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
    this._currentPage.push({page: this._page, userId: ''});

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
      this._currentPage.push({page: this._page, userId: ''});
      // this.loadUsers(
      //   this._currentPage[0].page, this.pageSize, this._currentSearchValue, this._currentPage[0].userId
      // );
    }
  }

  viewDetail(poll: any){
    console.log(poll);
  }

  public goToPage(page: number, elements: number): void {
    if (this.pageSize != elements){
      this.pageSize = elements;
      this._page = 1;
    } else {
      this._page = page+1;
    }
    // this.loadUsers(
    //   this.pageSize,
    //   this._currentPage[this._page-1].userId
    // );
  }

  addQuestion(){
    this.createQuestion();
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
      header: 'User', 
      message: 'Are you sure to delete this User?', 
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
        var spinnerRef = this.spinnerService.start("Deleting User...");
        if (result){
          // let delUser: User;
          // this.deleted = false; 
          this.deletePoll$ = this.pollService.deletePoll(poll.PollId, this.businessId).pipe(
            tap(res => {
              this.spinnerService.stop(spinnerRef);
              // this.displayYesNo = false;
              // this.deletingUser = true;
              // this.loadUsers(
              //   this._currentPage[0].page, this.pageSize, this._currentSearchValue, this._currentPage[0].userId
              // );
              this.openDialog('User', 'User deleted successful', true, false, false);
              window.scroll(0,0);
            }),
            catchError(err => {
              // this.deletingUser = false;
              // this.spinnerService.stop(spinnerRef);
              // this.displayYesNo = false;
              this.openDialog('Error ! ', err.Message, false, true, false);
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
