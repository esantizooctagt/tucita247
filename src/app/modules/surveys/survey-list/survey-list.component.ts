import { Component, OnInit, Input, SimpleChanges, ViewChild } from '@angular/core';
import { Survey } from '@app/_models';
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
import { SurveysService } from '@app/services';
import { MatTable } from '@angular/material/table';

@Component({
  selector: 'app-survey-list',
  templateUrl: './survey-list.component.html',
  styleUrls: ['./survey-list.component.scss']
})
export class SurveyListComponent implements OnInit {
  @Input() filterValue: string;
  @ViewChild(MatTable) surveyTable :MatTable<any>;
  
  deleteSurvey$: Observable<any>;
  surveys$: Observable<Survey[]>;
  public onError: string='';

  public length: number = 0;
  public pageSize: number = 10;
  public _page: number;
  private _currentPage: any[] = [];
  private _currentSearchValue: string = '';

  displayYesNo: boolean = false;

  displayedColumns = ['Name', 'DateSurvey', 'Actions'];
  businessId: string = '';
  changeData: string;
  surveyData: Survey;

  get fSurveys(){
    return this.surveyForm.get('Surveys') as FormArray;
  }

  surveyForm = this.fb.group({
    Surveys: this.fb.array([this.addSurveys()])
  });

  addSurveys(): FormGroup{
    return this.fb.group({
      SurveyId: [''],
      Name: ['', [Validators.required, Validators.maxLength(100), Validators.minLength(3)]],
      DateSurvey: ['', Validators.required]
    });
  }

  constructor(
    private fb: FormBuilder,
    private domSanitizer: DomSanitizer,
    private authService: AuthService,
    private data: MonitorService,
    private spinnerService: SpinnerService,
    private dialog: MatDialog,
    private surveyService: SurveysService,
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
    this._currentPage.push({page: this._page, surveyId: ''});
    this.loadSurveys(
      this._currentPage[0].page, this.pageSize, this._currentSearchValue, this._currentPage[0].surveyId
    );

    this.data.handleMessage.subscribe(res => this.changeData = res);
    this.data.objectMessage.subscribe(res => this.surveyData = res);
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
      this._currentPage.push({page: this._page, surveyId: ''});
      this.loadSurveys(
        this._currentPage[0].page, this.pageSize, this._currentSearchValue, this._currentPage[0].surveyId
      );
    }
  }

  loadSurveys(crPage, crItems, crSearch, crlastItem) {
    this.onError = '';
    var spinnerRef = this.spinnerService.start("Loading Surveys...");
    let data = this.businessId + "/" + crItems + (crSearch === '' ? '/_' : '/' + crSearch) + (crlastItem === '' ? '/_' : '/' +  crlastItem);

    this.surveys$ = this.surveyService.getSurveys(data).pipe(
      map((res: any) => {
        if (res != null) {
          if (res.lastItem != ''){
            this.length = (this.pageSize*this._page)+1;
            this._currentPage.push({page: this._page+1, surveyId: res.lastItem});
          }
        }
        this.surveyForm.setControl('Surveys', this.setExistingSurveys(res.surveys));
        this.spinnerService.stop(spinnerRef);
        return res.surveys;
      }),
      catchError(err => {
        this.onError = err.Message;
        this.spinnerService.stop(spinnerRef);
        return this.onError;
      })
    );
  }

  setExistingSurveys(surveys: Survey[]): FormArray{
    const formArray = new FormArray([]);
    surveys.forEach(res => {
      formArray.push(this.fb.group({
          SurveyId: res.SurveyId,
          Name: res.Name,
          DateSurvey: res.DateSurvey
        })
      );
      this.surveyTable.renderRows();
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
    this.loadSurveys(
      this._currentPage[this._page-1].page,
      this.pageSize,
      this._currentSearchValue,
      this._currentPage[this._page-1].surveyId
    );
  }

  onSelect(survey: any){
    this.data.setData(survey);
    this.data.handleData('Add');
  }

  onDelete(survey: any){
    this.displayYesNo = true;
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      header: 'Survey', 
      message: 'Are you sure to delete this Survey?', 
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
        var spinnerRef = this.spinnerService.start("Deleting Survey...");
        if (result){ 
          this.deleteSurvey$ = this.surveyService.deleteSurvey(survey.value.SurveyId, this.businessId, survey.value.DateSurvey).pipe(
            tap(res => {
              this.spinnerService.stop(spinnerRef);
              this.displayYesNo = false;
              this.loadSurveys(
                this._currentPage[0].page, this.pageSize, this._currentSearchValue, this._currentPage[0].surveyId
              );
              this.openDialog('Surveys', 'Survey deleted successful', true, false, false);
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

  trackRow(index: number, item: Survey) {
    return item.SurveyId;
  }

}
