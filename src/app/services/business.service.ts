import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Business } from '@app/_models';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BusinessService {
  readonly apiURL = environment.apiUrl;
  constructor(private http: HttpClient) { }

  getBusiness(businessId): Observable<Business> {
    return this.http.get<Business>(this.apiURL + '/business/' + businessId)
                    .pipe(catchError(this.errorHandler));
  }

  getBusinessOpeHours(businessId, locationId, serviceId): Observable<any> {
    return this.http.get<any>(this.apiURL + '/business/opehours/' + businessId + '/' + locationId + '/' + serviceId)
                    .pipe(catchError(this.errorHandler));
  }

  getBusinessParent(): Observable<any[]>{
    return this.http.get<any[]>(this.apiURL + '/business/parents')
                    .pipe(catchError(this.errorHandler));
  }

  getBusinessAppos(businessId): Observable<any>{
    return this.http.get<any>(this.apiURL + '/business/appos/' + businessId)
                    .pipe(catchError(this.errorHandler));
  }

  getBusinessLanding(link): Observable<any>{
    return this.http.get<any>(this.apiURL + '/business/landing/'+ link)
                    .pipe(catchError(this.errorHandler));
  }

  updateBusiness(businessId, dataForm) {
    return this.http.put(this.apiURL + '/business/' + businessId, dataForm)
                    .pipe(catchError(this.errorHandler));
  }

  uploadBusinessImg(businessId, dataForm){
    return this.http.put(this.apiURL + '/business/imagen/' + businessId, dataForm)
                    .pipe(catchError(this.errorHandler));
  }

  uploadBusinessImgLink(businessId, dataForm){
    return this.http.put(this.apiURL + '/business/imagen/link/' + businessId, dataForm)
                    .pipe(catchError(this.errorHandler));
  }

  validateLink(link){
    return this.http.get<any>(this.apiURL + '/business/link/' + link)
                    .pipe(catchError(this.errorHandler))
  }

  errorHandler(error){
    return throwError(error || 'Server Error');
  }
}
