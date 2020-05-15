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

    getLocation(storeId, cashierId): Observable<any>{
      return this.http.get<any>(this.apiURL + '/location/' + storeId + '/' + cashierId)
                      .pipe(catchError(this.errorHandler));
    }

    getLocations(businessId): Observable<Location[]> {
        return this.http.get<Location[]>(this.apiURL + '/locations/' + businessId)
                        .pipe(catchError(this.errorHandler));
    }

    updateLocations(dataForm){
      return this.http.patch(this.apiURL + '/locations', dataForm)
                      .pipe(catchError(this.errorHandler));
    }

    errorHandler(error) {
      return throwError(error || 'Server Error');
    }
}
