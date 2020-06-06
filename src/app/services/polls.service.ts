import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { catchError } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';
import { Poll } from '@app/_models';

@Injectable({
  providedIn: 'root'
})
export class PollsService {
  readonly apiURL = environment.apiUrl;
  constructor(private http: HttpClient) { }

  getPoll(pollId): Observable<Poll[]>{
    return this.http.get<Poll[]>(this.apiURL + '/poll/' + pollId)
                    .pipe(catchError(this.errorHandler));
  }

  getPolls(queryStr): Observable<Poll[]> {
      return this.http.get<Poll[]>(this.apiURL + '/polls/' + queryStr)
                      .pipe(catchError(this.errorHandler));
  }

  postPolls(formData) {
    return this.http.post(this.apiURL + '/poll', formData)
                    .pipe(catchError(this.errorHandler));
  }

  deletePoll(pollId, businessId) {
    return this.http.delete(this.apiURL + '/poll/' + pollId + '/' + businessId)
                    .pipe(catchError(this.errorHandler));
  }

  errorHandler(error) {
    return throwError(error || 'Server Error');
  }
}
