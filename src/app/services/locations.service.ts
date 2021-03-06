import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { Location } from '@app/_models';
import { catchError } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  readonly apiURL = environment.apiUrl;
  constructor(private http: HttpClient) { }

  getLocation(businessId, locationId, country, language): Observable<Location>{
    return this.http.get<Location>(this.apiURL + '/location/data/' + businessId + '/' + locationId + '/' + country + '/' + language)
                    .pipe(catchError(this.errorHandler));
  }

  getLocationsData(queryStr): Observable<any[]> {
    return this.http.get<any[]>(this.apiURL + '/locations/' + queryStr)
                    .pipe(catchError(this.errorHandler));
  }

  postLocations(formData){
    return this.http.post(this.apiURL + '/location', formData)
                    .pipe(catchError(this.errorHandler))
  }

  getLocations(businessId, country, language): Observable<Location[]> {
      return this.http.get<Location[]>(this.apiURL + '/locations/' + businessId + '/' + country + '/' + language)
                      .pipe(catchError(this.errorHandler));
  }

  // updateLocations(dataForm, businessId){
  //   return this.http.put(this.apiURL + '/locations/' +businessId, dataForm)
  //                   .pipe(catchError(this.errorHandler));
  // }

  updateOpenLocation(locationId, businessId){
    return this.http.put(this.apiURL + '/location/open/' + locationId + '/' + businessId, '')
                    .pipe(catchError(this.errorHandler))
  }

  updateClosedLocation(locationId, businessId, closed, language){
    return this.http.put(this.apiURL + '/location/closed/' + locationId + '/' + businessId + '/' + closed + '/' + language, '')
                    .pipe(catchError(this.errorHandler))
  }
  
  getLocationsHost(businessId): Observable<Location[]> {
    return this.http.get<Location[]>(this.apiURL + '/locations/host/' + businessId)
                    .pipe(catchError(this.errorHandler));
  }

  getLocationsCode(businessId): Observable<any[]>{
    return this.http.get<any[]>(this.apiURL + '/locations/Codes/' + businessId)
                    .pipe(catchError(this.errorHandler));
  }

  getLocationQuantity(businessId, locationId): Observable<any>{
    return this.http.get<any>(this.apiURL + '/location/checkin/' + businessId + '/' + locationId)
                    .pipe(catchError(this.errorHandler));
  }

  getLocationQuantityAll(businessId, isAdmin): Observable<any[]>{
    return this.http.get<any>(this.apiURL + '/location/checkinall/' + businessId + '/' + isAdmin)
                    .pipe(catchError(this.errorHandler));
  }

  getCities(countryId, language): Observable<any>{
    return this.http.get<any>(this.apiURL + '/locations/cities/' + countryId + '/' + language + '/_')
                    .pipe(catchError(this.errorHandler));
  }

  getSectors(countryId, cityId, language): Observable<any>{
    return this.http.get<any>(this.apiURL + '/locations/sectors/' + countryId + '/' + cityId + '/' + language)
                    .pipe(catchError(this.errorHandler));
  }

  getWalkInsCheckOut(businessId, locationId, dateAppo): Observable<any[]>{
    return this.http.get<any[]>(this.apiURL + '/location/walkins/' + businessId + '/' + locationId + '/' + dateAppo)
                    .pipe(catchError(this.errorHandler));
  }

  errorHandler(error) {
    return throwError(error || 'Server Error');
  }
  
}
