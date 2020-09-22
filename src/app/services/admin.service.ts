import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { User, Business } from '@app/_models';
import { catchError } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AdminService {
    readonly apiURL = environment.apiAdminUrl;
    constructor(private http: HttpClient) { }
  
    getUser(userId, businessId): Observable<User> {
      return this.http.get<User>(this.apiURL + '/user/' + userId + '/' + businessId)
                      .pipe(catchError(this.errorHandler));
    }
  
    updateUser(formData){
      return this.http.put(this.apiURL + '/user', formData)
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
  
    deleteUser(userId, businessId) {
      return this.http.delete(this.apiURL + '/user/' + userId + '/' + businessId)
                      .pipe(catchError(this.errorHandler));
    }

    getRoles(data): Observable<any[]> {
        return this.http.get<any[]>(this.apiURL + '/roles/' + data)
                        .pipe(catchError(this.errorHandler));
    }
  
    errorHandler(error) {
      return throwError(error || 'Server Error');
    }
  }
  