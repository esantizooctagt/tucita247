import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SurveysService } from '@app/services';
import { Observable } from 'rxjs';
import { Survey, Question } from '@app/_models';
import { SpinnerService } from '@app/shared/spinner.service';
import { map, catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormArray } from '@angular/forms';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-survey-resp',
  templateUrl: './survey-resp.component.html',
  styleUrls: ['./survey-resp.component.scss']
})
export class SurveyRespComponent implements OnInit {
  surveyId: string = '';
  custId: string = '';
  noItems: number = 0;
  saveSurvey: boolean = false;

  saveSurvey$: Observable<any>;
  surveyData$: Observable<any>;

  constructor(
    private domSanitizer: DomSanitizer,
    private matIconRegistry: MatIconRegistry,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private surveyService: SurveysService,
    private _snackBar: MatSnackBar,
    private spinnerService: SpinnerService
  ) {
    this.matIconRegistry.addSvgIcon('happy',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/happy.svg'));
    this.matIconRegistry.addSvgIcon('neutral',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/neutral.svg'));
    this.matIconRegistry.addSvgIcon('angry',this.domSanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/angry.svg'));
   }

  get fQuestions(){
    return this.surveyForm.get('Questions') as FormArray;
  }

  get f(){
    return this.surveyForm.controls;
  }

  surveyForm = this.fb.group({
    SurveyId: [''],
    Name: [''],
    LocationId: [''],
    DateSurvey: [''],
    Status: [true],
    Questions : this.fb.array([])
  });

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
    });
  }

  ngOnInit(): void {
    this.surveyId = this.route.snapshot.paramMap.get('surveyId');
    this.custId = this.route.snapshot.paramMap.get('custId');

    var spinnerRef = this.spinnerService.start($localize`:@@survey.loadingsurv:`);
    this.surveyData$ = this.surveyService.getSurvey(this.surveyId).pipe(
      map((survey: any) => {
        this.surveyForm.setValue({
          SurveyId: survey.SurveyId,
          Name: survey.Name,
          LocationId: survey.LocationId,
          DateSurvey: '',
          Status: (survey.Status == 1 ? true : false),
          Questions: []
        });
        this.surveyForm.setControl('Questions', this.setExistingSurveys(survey.Questions));
        this.spinnerService.stop(spinnerRef);
        return '';
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        this.openSnackBar($localize`:@@shared.wrong:`,$localize`:@@shared.error:`);
        return err.message;
      })
    );
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
          Angry: res.Angry,
          Result: 0
        })
      );
      this.noItems = this.noItems +1;
    });
    return formArray;
  }
  
  onSubmit(){
    let items = this.surveyForm.value.Questions;
    let detail = [];
    items.forEach(ele => {
      detail.push({QuestionId: ele.QuestionId, Happy: (ele.Result == 1 ? 1 : 0), Neutral: (ele.Result == 2 ? 1 : 0), Angry: (ele.Result == 3 ? 1 : 0)});
    })
    let formData = {
      SurveyId: this.surveyForm.value.SurveyId,
      CustomerId: this.custId,
      LocationId: this.surveyForm.value.LocationId,
      Questions: detail
    }
    this.saveSurvey = false;
    var spinnerRef = this.spinnerService.start($localize`:@@survey.savingsurvey:`);
    this.saveSurvey$ =  this.surveyService.postSurveyUser(formData).pipe(
      map((res:any) => {
        if (res != null){
          if (res.Code == 200){
            this.spinnerService.stop(spinnerRef);
            this.saveSurvey = true
          } else {
            this.spinnerService.stop(spinnerRef);
            this.openSnackBar($localize`:@@shared.wrong:`,$localize`:@@shared.error:`);
          }
        } else {
          this.spinnerService.stop(spinnerRef);
          this.openSnackBar($localize`:@@shared.wrong:`,$localize`:@@shared.error:`);
        }
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        this.openSnackBar($localize`:@@shared.wrong:`,$localize`:@@shared.error:`);
        return err.message;
      })
    );
  }

}
