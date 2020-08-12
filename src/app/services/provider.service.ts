import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { catchError } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProviderService {
  readonly apiURL = environment.apiUrl;
  constructor(private http: HttpClient) { }

  getProvider(businessId, providerId): Observable<any>{
    return this.http.get<any>(this.apiURL + '/provider/' + businessId + '/' + providerId)
                    .pipe(catchError(this.errorHandler));
  }

  getProviders(queryStr): Observable<any[]> {
      return this.http.get<any[]>(this.apiURL + '/providers/' + queryStr)
                      .pipe(catchError(this.errorHandler));
  }

  getProvidersLoc(businessId, locationId): Observable<any[]> {
    return this.http.get<any[]>(this.apiURL + '/providers/' + businessId + '/' + locationId)
                    .pipe(catchError(this.errorHandler));
}

  postProviders(formData) {
    return this.http.post(this.apiURL + '/provider', formData)
                    .pipe(catchError(this.errorHandler));
  }

  deleteProvider(businessId, locationId, providerId) {
    return this.http.delete(this.apiURL + '/provider/' + businessId + '/' + locationId + '/' + providerId)
                    .pipe(catchError(this.errorHandler));
  }

  errorHandler(error) {
    return throwError(error || 'Server Error');
  }
}
