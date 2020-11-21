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
  readonly apiAdminUrl = environment.apiAdminUrl;
  constructor(private http: HttpClient) { }

  getBusinessAdmin(): Observable<any>{
    return this.http.get<Business>(this.apiAdminUrl + '/business/admin')
                    .pipe(catchError(this.errorHandler));
  }

  getBusiness(businessId, language): Observable<Business> {
    return this.http.get<Business>(this.apiURL + '/business/' + businessId + '/' + language)
                    .pipe(catchError(this.errorHandler));
  }

  getBusinessOpeHours(businessId, locationId): Observable<any> {
    return this.http.get<any>(this.apiURL + '/business/opehours/' + businessId + '/' + locationId)
                    .pipe(catchError(this.errorHandler));
  }

  getValidBusiness(businessId, locationId, providerId, serviceId, appoDate, appoHour): Observable<any>{
    return this.http.get<any>(this.apiURL + '/business/valid/' + businessId + '/' + locationId + '/' + providerId + '/' + serviceId + '/' + appoDate + '/' + appoHour)
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

  getCountry(businessId): Observable<any>{
    return this.http.get<any>(this.apiURL + '/business/country/' + businessId)
                    .pipe(catchError(this.errorHandler));
  }

  getDaysOff(businessId, locationId, providerId, year): Observable<any>{
    return this.http.get<any>(this.apiURL + '/business/daysoff/' + businessId + '/' + locationId + '/' + providerId + '/' + year)
                    .pipe(catchError(this.errorHandler));
  }

  getOpeningHours(businessId, locationId, providerId): Observable<any>{
    return this.http.get<any>(this.apiURL + '/business/openinghours/' + businessId + '/' + locationId + '/' + providerId)
                    .pipe(catchError(this.errorHandler));
  }

  updateBusinessParms(businessId, locationId, providerId, value, tipo){
    return this.http.put(this.apiURL + '/business/params/' + businessId + '/' + locationId + '/' + providerId + '/' + value + '/' + tipo, '')
                    .pipe(catchError(this.errorHandler));
  }

  updateOpeningHours(businessId, locationId, providerId, parentData, dataForm){
    return this.http.put(this.apiURL + '/business/openinghours/' + businessId + '/' + locationId + '/' + providerId + '/' + parentData, dataForm)
                    .pipe(catchError(this.errorHandler));
  }

  updateDaysOff(businessId, locationId, providerId, dateOpe, tipo){
    return this.http.put(this.apiURL + '/business/daysoff/' + businessId + '/' + locationId + '/' + providerId + '/' + dateOpe + '/' + tipo, '')
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
