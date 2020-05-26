import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { catchError } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';
import { Appointment } from '@app/_models';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  readonly apiURL = environment.apiUrl;
  constructor(private http: HttpClient) { }

  getLocations(businessId, locationId, dateAppo): Observable<Appointment[]> {
      return this.http.get<Appointment[]>(this.apiURL + '/appointments/' + businessId + '/' + locationId + '/' + dateAppo)
                      .pipe(catchError(this.errorHandler));
  }

  errorHandler(error) {
    return throwError(error || 'Server Error');
  }
  
}
