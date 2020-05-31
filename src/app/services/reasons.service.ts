import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { Reason } from '@app/_models';
import { catchError } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReasonsService {
  readonly apiURL = environment.apiUrl;
  constructor(private http: HttpClient) { }

  getReasons(businessId): Observable<Reason[]> {
    return this.http.get<Reason[]>(this.apiURL + '/reasons/' + businessId)
                    .pipe(catchError(this.errorHandler));
  }

  errorHandler(error) {
    return throwError(error || 'Server Error');
  }

}
