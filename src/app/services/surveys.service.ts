import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { catchError } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';
import { Survey } from '@app/_models';

@Injectable({
  providedIn: 'root'
})
export class SurveysService {
  readonly apiURL = environment.apiUrl;
  constructor(private http: HttpClient) { }

  getSurvey(surveyId): Observable<Survey>{
    return this.http.get<Survey>(this.apiURL + '/survey/' + surveyId)
                    .pipe(catchError(this.errorHandler));
  }

  getSurveys(queryStr): Observable<Survey[]> {
    return this.http.get<Survey[]>(this.apiURL + '/surveys/' + queryStr)
                    .pipe(catchError(this.errorHandler));
  }

  postSurveys(formData) {
    return this.http.post(this.apiURL + '/survey', formData)
                    .pipe(catchError(this.errorHandler));
  }

  postSurveyUser(formData) {
    return this.http.post(this.apiURL + '/survey/user', formData)
                    .pipe(catchError(this.errorHandler));
  }

  deleteSurvey(surveyId, businessId, dateSurvey) {
    return this.http.delete(this.apiURL + '/survey/' + surveyId + '/' + businessId + '/' + dateSurvey)
                    .pipe(catchError(this.errorHandler));
  }

  errorHandler(error) {
    return throwError(error || 'Server Error');
  }
}
