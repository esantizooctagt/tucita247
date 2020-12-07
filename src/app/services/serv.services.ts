import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { catchError } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServService {
  readonly apiURL = environment.apiUrl;
  constructor(private http: HttpClient) { }

  getService(businessId, serviceId): Observable<any>{
    return this.http.get<any>(this.apiURL + '/service/' + businessId + '/' + serviceId)
                    .pipe(catchError(this.errorHandler));
  }

  getServices(queryStr): Observable<any[]> {
      return this.http.get<any[]>(this.apiURL + '/services/' + queryStr)
                      .pipe(catchError(this.errorHandler));
  }

  getServicesColor(businessId): Observable<any[]> {
    return this.http.get<any[]>(this.apiURL + '/services/' + businessId)
                    .pipe(catchError(this.errorHandler));
  }

  postServices(formData) {
    return this.http.post(this.apiURL + '/service', formData)
                    .pipe(catchError(this.errorHandler));
  }

  deleteService(businessId, serviceId) {
    return this.http.delete(this.apiURL + '/service/' + businessId + '/' + serviceId)
                    .pipe(catchError(this.errorHandler));
  }

  getServicesProvider(businessId, providerId): Observable<any>{
    return this.http.get<any>(this.apiURL + '/services/' + businessId + '/' + providerId)
                    .pipe(catchError(this.errorHandler));
  }

  // putServiceProvider(businessId, providerId, serviceId, activo){
  //   return this.http.put(this.apiURL + '/service/'+ businessId + '/' + providerId + '/' + serviceId + '/' + activo, '')
  //                   .pipe(catchError(this.errorHandler));
  // }
  errorHandler(error) {
    return throwError(error || 'Server Error');
  }
}
