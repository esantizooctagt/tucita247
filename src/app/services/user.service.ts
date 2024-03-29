import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { User, Business } from '@app/_models';
import { catchError } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  readonly apiURL = environment.apiUrl;
  constructor(private http: HttpClient) { }

  getUser(userId, businessId): Observable<any> {
    return this.http.get<any>(this.apiURL + '/user/' + userId + '/' + businessId)
                    .pipe(catchError(this.errorHandler));
  }

  uploadImage(userId, businessId, formData){
    return this.http.put(this.apiURL + '/user/avatar/' + userId + '/' + businessId, formData)
                      .pipe(catchError(this.errorHandler));
  }

  updateUser(formData){
    return this.http.put(this.apiURL + '/user', formData)
                    .pipe(catchError(this.errorHandler));
  }

  updateProfile(userId, formData){
    return this.http.put(this.apiURL + '/user/profile/' + userId, formData)
                    .pipe(catchError(this.errorHandler));
  }

  updateToken(formData){
    return this.http.put(this.apiURL + '/user/token', formData)
                    .pipe(catchError(this.errorHandler));
  }

  getUsers(formData): Observable<User[]> {
    return this.http.get<User[]>(this.apiURL + '/users/' + formData)
                    .pipe(catchError(this.errorHandler));
  }

  getUsersLoc(pathParams): Observable<any[]> {
    return this.http.get<any[]>(this.apiURL + '/users/location/' + pathParams)
                    .pipe(catchError(this.errorHandler));
  }

  updateUsersLocs(businessId, formData): Observable<any[]>{
    return this.http.put<any[]>(this.apiURL + '/users/location/' + businessId, formData)
                    .pipe(catchError(this.errorHandler));
  }

  postUser(formData) {
    return this.http.post(this.apiURL + '/user', formData)
                    .pipe(catchError(this.errorHandler));
  }

  deleteUser(userId, businessId) {
    return this.http.delete(this.apiURL + '/user/' + userId + '/' + businessId)
                    .pipe(catchError(this.errorHandler));
  }

  validateEmail(email){
    return this.http.get(this.apiURL + '/user/validate/' + email)
                    .pipe(catchError(this.errorHandler));
  }

  forgotPassword(formData){
    return this.http.post(this.apiURL + '/user/forgotpassword', formData)
                    .pipe(catchError(this.errorHandler));
  }

  putResetPass(userId, code, formData){
    return this.http.put(this.apiURL + '/user/reset/' + userId + '/' + code, formData)
                    .pipe(catchError(this.errorHandler));
  }

  putVerifCode(code, formData){
    return this.http.put(this.apiURL + '/user/verification/'+code, formData)
                    .pipe(catchError(this.errorHandler));
  }

  putActivationAccount(formData){
    return this.http.put(this.apiURL + '/user/activate/admin', formData)
                    .pipe(catchError(this.errorHandler));
  }

  errorHandler(error) {
    return throwError(error || 'Server Error');
  }
}
