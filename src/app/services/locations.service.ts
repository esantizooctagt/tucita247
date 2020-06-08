import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { Location } from '@app/_models';  //StoreDocto
import { catchError } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  readonly apiURL = environment.apiUrl;
  constructor(private http: HttpClient) { }

  getLocations(businessId, country): Observable<Location[]> {
      return this.http.get<Location[]>(this.apiURL + '/locations/' + businessId + '/' + country)
                      .pipe(catchError(this.errorHandler));
  }

  updateLocations(dataForm, businessId){
    return this.http.put(this.apiURL + '/locations/' +businessId, dataForm)
                    .pipe(catchError(this.errorHandler));
  }

  updateOpenLocation(locationId, businessId){
    return this.http.put(this.apiURL + '/location/open/' + locationId + '/' + businessId, '')
                    .pipe(catchError(this.errorHandler))
  }

  updateClosedLocation(locationId, businessId){
    return this.http.put(this.apiURL + '/location/closed/' + locationId + '/' + businessId, '')
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

  getCities(countryId): Observable<any>{
    return this.http.get<any>(this.apiURL + '/locations/cities/' + countryId)
                    .pipe(catchError(this.errorHandler));
  }

  getSectors(countryId, cityId): Observable<any>{
    return this.http.get<any>(this.apiURL + '/locations/sectors/' + countryId + '/' + cityId)
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
