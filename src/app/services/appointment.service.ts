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

  getAppointments(businessId, locationId, providerId, dateAppoIni, dateAppoFin, status, type, lastItem, appId): Observable<Appointment[]> {
      return this.http.get<Appointment[]>(this.apiURL + '/appointments/' + businessId + '/' + locationId + '/' + providerId + '/' + dateAppoIni + '/' + dateAppoFin + '/' + status + '/' + type + '/' + lastItem + '/' + appId)
                      .pipe(catchError(this.errorHandler));
  }

  getAppointmentsSche(businessId, locationId, providerId, dateAppoIni): Observable<Appointment[]>{
    return this.http.get<Appointment[]>(this.apiURL + '/appointments/' + businessId + '/' + locationId + '/' + providerId + '/' + dateAppoIni)
                    .pipe(catchError(this.errorHandler));
  }

  getPreviousAppointments(businessId, locationId, providerId, dateAppo, status): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(this.apiURL + '/appointments/previous/' + businessId + '/' + locationId + '/' + providerId + '/' + dateAppo + '/' + status)
                    .pipe(catchError(this.errorHandler));
  }

  getApposAverage(locationId, providerId, initDate): Observable<any[]>{
    return this.http.get<any[]>(this.apiURL + '/appointments/average/' + locationId + '/' + providerId + '/' + initDate)
                    .pipe(catchError(this.errorHandler));
  }

  updateAppointment(appointmentId, formData) {
    return this.http.put(this.apiURL + '/appointment/' + appointmentId, formData)
                    .pipe(catchError(this.errorHandler));
  }

  updateAppointmentCheckIn(appointmentId, formData) {
    return this.http.put(this.apiURL + '/appointment/checkin/' + appointmentId, formData)
                    .pipe(catchError(this.errorHandler));
  }

  updateAppointmentCheckInQR(appointmentId, formData) {
    return this.http.put(this.apiURL + '/appointment/checkinqr/' + appointmentId, formData)
                    .pipe(catchError(this.errorHandler));
  }

  updateAppointmentCheckOut(formData){
    return this.http.put(this.apiURL + '/appointment/checkout', formData)
                    .pipe(catchError(this.errorHandler));
  }

  updateAppointmentWalkInsCheckOut(formData){
    return this.http.put(this.apiURL + '/appointment/checkout/walkins', formData)
                    .pipe(catchError(this.errorHandler));
  }

  updateManualCheckOut(businessId, locationId, providerId, qtyGuests){
    return this.http.put(this.apiURL + '/appointment/checkout/manual/' + businessId + '/' + locationId + '/' + providerId + '/' + qtyGuests,'')
                    .pipe(catchError(this.errorHandler));
  }

  getHostLocations(businessId, userId): Observable<any[]> {
    return this.http.get<any[]>(this.apiURL + '/host/' + businessId + '/' + userId)
                    .pipe(catchError(this.errorHandler));
  }

  postNewAppointment(formData){
    return this.http.post(this.apiURL + '/appointment/host', formData)
                    .pipe(catchError(this.errorHandler));
  }

  putMessage(appointmentId, type, formData){
    return this.http.put(this.apiURL + '/appointment/chat/' + appointmentId + '/' + type, formData)
                    .pipe(catchError(this.errorHandler));
  }

  putCancelAppos(businessId, locationId, providerId, appoDate) {
    return this.http.put(this.apiURL + '/appointment/' + businessId + '/' + locationId + '/' + providerId + '/' + appoDate, '')
                    .pipe(catchError(this.errorHandler));
  }

  getMessages(appointmentId, type): Observable<any[]> {
    return this.http.get<any[]>(this.apiURL + '/appointment/messages/' + appointmentId + '/' + type)
                    .pipe(catchError(this.errorHandler));
  }

  getPurpose(businessId): Observable<any[]> {
    return this.http.get<any[]>(this.apiURL + '/appointment/purpose/' + businessId)
                    .pipe(catchError(this.errorHandler))
  }

  getOperationHours(businessId, locationId, providerId, initDay){
    return this.http.get<any>(this.apiURL + '/appointment/opeHours/' + businessId + '/' + locationId + '/' + providerId + '/' + initDay)
                    .pipe(catchError(this.errorHandler));
  }

  getRepoAverage(businessId, locationId, providerId, dateIni, dateFin){
    return this.http.get<any>(this.apiURL + '/appointments/repAverage/' + businessId + '/' + locationId + '/' + providerId + '/' + dateIni + '/' + dateFin)
                    .pipe(catchError(this.errorHandler));
  }

  errorHandler(error) {
    return throwError(error || 'Server Error');
  }
  
}
