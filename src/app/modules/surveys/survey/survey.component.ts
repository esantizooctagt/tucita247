import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormArray } from '@angular/forms';
import { ConfirmValidParentMatcher } from '@app/validators';
import { LocationService, SurveysService } from '@app/services';
import { AuthService } from '@app/core/services';
import { catchError, map } from 'rxjs/operators';
import { SpinnerService } from '@app/shared/spinner.service';
import { throwError, Observable } from 'rxjs';
import { ArrayValidators } from '@app/validators';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '@app/shared/dialog/dialog.component';
import { Survey, Question } from '@app/_models';
import { MonitorService } from '@app/shared/monitor.service';

@Component({
  selector: 'app-survey',
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.scss']
})
export class SurveyComponent implements OnInit {
  minDate: Date = new Date();
  businessId: string = '';
  locs$: Observable<any[]>;
  survey$: Observable<Survey>;
  saveSurvey$: Observable<any>; 
  surveyDataList: Survey;
  displayRes: boolean = false;

  fDescription: string = '';
  fHappy: string = '';
  fNeutral: string = '';
  fAngry: string = '';

  confirmValidParentMatcher = new ConfirmValidParentMatcher();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private spinnerService: SpinnerService,
    private surveyService: SurveysService,
    private dialog: MatDialog,
    private data: MonitorService,
    private locationService: LocationService
  ) { }

  get fQuestions(){
    return this.surveyForm.get('Questions') as FormArray;
  }

  get f(){
    return this.surveyForm.controls;
  }

  surveyForm = this.fb.group({
    SurveyId: [''],
    Name: ['', [Validators.required, Validators.maxLength(100), Validators.minLength(3)]],
    LocationId: ['', [Validators.required]],
    DateSurvey: [this.minDate, Validators.required],
    Status: [true],
    Questions : this.fb.array([this.addQuestion()], ArrayValidators.minLength(1))
  });

  addQuestion(): FormGroup {
    return this.fb.group({
      QuestionId: [''],
      Description: ['', [Validators.required, Validators.maxLength(100), Validators.minLength(3)]],
      Happy: [0],
      Neutral: [0],
      Angry: [0],
      Status: [1]
    });
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
    var spinnerRef = this.spinnerService.start("Loading Survey...");
    this.businessId = this.authService.businessId();

    this.locs$ = this.locationService.getLocationsCode(this.businessId).pipe(
      map((res: any) => {
        if (res != null){
          this.spinnerService.stop(spinnerRef);
          return res.locs;
        }
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        return throwError(err || err.message);
      })
    );

    this.data.objectMessage.subscribe(res => this.surveyDataList = res);
    this.onDisplay();
  }

  onDisplay(){
    if (this.surveyDataList != undefined){
      var spinnerRef = this.spinnerService.start("Loading Survey...");
      this.surveyForm.reset({ SurveyId: '', Name: '', LocationId: '', DateSurvey: '', Status: true});
      this.fQuestions.clear();
      this.survey$ = this.surveyService.getSurvey(this.surveyDataList).pipe(
        map(survey => {
          let dateP = new Date(survey.DateSurvey+'T06:00:00');
          this.surveyForm.setValue({
            SurveyId: survey.SurveyId,
            Name: survey.Name,
            LocationId: survey.LocationId,
            DateSurvey: dateP,
            Status: (survey.Status == 1 ? true : false),
            Questions: []
          });
          this.surveyForm.setControl('Questions', this.setExistingSurveys(survey.Questions));
          this.spinnerService.stop(spinnerRef);
          return survey;
        }),
        catchError(err => {
          this.spinnerService.stop(spinnerRef);
          this.openDialog('Error !', err.Message, false, true, false);
          return throwError(err || err.Message);
        })
      );
    }
  }

  setExistingSurveys(quest: Question[]): FormArray{
    const formArray = new FormArray([]);
    quest.forEach(res => {
      formArray.push(this.fb.group({
          QuestionId: res.QuestionId,
          Description: res.Description,
          Status: res.Status,
          Happy: res.Happy,
          Neutral: res.Neutral,
          Angry: res.Angry
        })
      );
    });
    return formArray;
  }

  getErrorMessage(component: string, index: number =0){
    if (component === 'Name'){
      return this.f.Name.hasError('required') ? 'You must enter a value' :
        this.f.Name.hasError('minlength') ? 'Minimun length 3':
          this.f.Name.hasError('maxlength') ? 'Maximun length 100' :
            '';
    }
    if (component === 'LocationId'){
      return this.f.LocationId.hasError('required') ? 'You must select a value' :
        '';
    }
    if (component === 'DateSurvey'){
      return this.f.DateSurvey.hasError('required') ? 'You must enter a value' :
        '';
    }
    if (component === 'QDescription'){
      let sDescription = (<FormArray>this.surveyForm.get('Questions')).controls[index].get('Description');
      return sDescription.hasError('required') ? 'You must enter a Description' :
        sDescription.hasError('minlength') ? 'Minimun length 3':
          sDescription.hasError('maxlength') ? 'Maximun length 100' :
            '';
    }
  }

  onAddQuestion(): void{
    (<FormArray>this.surveyForm.get('Questions')).push(this.addQuestion());
  }

  onCancel(){
    this.surveyForm.reset({ SurveyId: '', Name: '', LocationId: '', DateSurvey: this.minDate, Status: true});
    this.fQuestions.clear();
    (<FormArray>this.surveyForm.get('Questions')).push(this.addQuestion());
  }

  onSubmit(){
    if (this.surveyForm.invalid) { return; }
    let dateVal = new Date(this.surveyForm.value.DateSurvey);
    let dataForm = {
      SurveyId: this.surveyForm.value.SurveyId,
      BusinessId: this.businessId,
      LocationId: this.surveyForm.value.LocationId,
      DateSurvey: dateVal.getFullYear().toString() + '-' + (dateVal.getMonth()+1).toString().padStart(2,'0') + '-' + dateVal.getDate().toString().padStart(2, '0'),
      Name: this.surveyForm.value.Name,
      Status: 1,
      Questions: this.surveyForm.value.Questions
    }
    var spinnerRef = this.spinnerService.start("Saving Survey...");
    this.saveSurvey$ =  this.surveyService.postSurveys(dataForm).pipe(
      map((res:any) => {
        if (res != null){
          if (res.Code == 200){
            this.spinnerService.stop(spinnerRef);
            this.surveyForm.reset({ SurveyId: '', Name: '', LocationId: '', DateSurvey: '', Status: true});
            this.fQuestions.clear();
            (<FormArray>this.surveyForm.get('Questions')).push(this.addQuestion());
            this.openDialog('Surveys', 'Saving successfully', true, false, false);
          } else {
            this.spinnerService.stop(spinnerRef);
            this.openDialog('Error ! ', 'Something goes wrong, try again', false, true, false);
          }
        } else {
          this.spinnerService.stop(spinnerRef);
          this.openDialog('Error ! ', 'Something goes wrong, try again', false, true, false);
        }
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        this.openDialog('Error ! ', err.Message, false, true, false);
        return throwError (err || err.message);
      })
    );

  }

  onRemoveQuestion(index: number){
    let quest =  this.surveyForm.get('Questions') as FormArray;
    let item = quest.at(index);
    if (item.value.QuestionId == ''){
      quest.removeAt(index);
    } else {
      item.patchValue({Status: 0});
    }
  }

  showScore(item){
    this.fDescription = item.value.Description;
    this.fHappy =  item.value.Happy;
    this.fNeutral = item.value.Neutral;
    this.fAngry = item.value.Angry;
  }

}
