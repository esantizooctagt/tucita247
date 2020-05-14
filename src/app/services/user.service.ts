import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { User } from '@app/_models';
import { catchError } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  readonly apiURL = environment.apiUrl;
  constructor(private http: HttpClient) { }

  getUser(userId, companyId): Observable<User> {
    return this.http.get<User>(this.apiURL + '/user/' + userId + '/' + companyId)
                    .pipe(catchError(this.errorHandler));
  }

  uploadImage(userId, formData){
    return this.http.patch(this.apiURL + '/user/' + userId, formData)
                      .pipe(catchError(this.errorHandler));
  }

  updateUser(userId, formData){
    return this.http.put(this.apiURL + '/user/' + userId, formData)
                      .pipe(catchError(this.errorHandler));
  }

  updateProfile(userId, formData){
    return this.http.put(this.apiURL + '/user/profile/' + userId, formData)
                      .pipe(catchError(this.errorHandler));
  }

  getUsers(formData): Observable<User[]> {
    return this.http.get<User[]>(this.apiURL + '/users/' + formData)
                    .pipe(catchError(this.errorHandler));
  }

  postUser(formData) {
      return this.http.post(this.apiURL + '/user', formData)
                      .pipe(catchError(this.errorHandler));
  }

  deleteUser(userId) {
    return this.http.delete(this.apiURL + '/user/' + userId)
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

  putVerifCode(userName, code, formData){
    return this.http.put(this.apiURL + '/user/verification/' + userName + '/' + code, formData)
                    .pipe(catchError(this.errorHandler));
  }

  errorHandler(error) {
    return throwError(error || 'Server Error');
  }
}
