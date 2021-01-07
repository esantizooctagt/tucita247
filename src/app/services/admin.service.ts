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

    getRole(roleId, businessId): Observable<any>{
      return this.http.get<any>(this.apiURL + '/role/' + roleId + '/' + businessId)
                      .pipe(catchError(this.errorHandler));
    }
  
    getApplications(roleId, businessId, language): Observable<any[]>{
      return this.http.get<any[]>(this.apiURL + '/apps/'+(roleId === '' ? '0' : roleId) + '/' + businessId + '/' + language)
                      .pipe(catchError(this.errorHandler));
    }
  
    getAccess(businessId, roleId): Observable<any>{
      return this.http.get<any>(this.apiURL + '/user/access/'+businessId+'/'+roleId)
                      .pipe(catchError(this.errorHandler));
    }
  
    postRole(formData) {
      return this.http.post(this.apiURL + '/role', formData)
                      .pipe(catchError(this.errorHandler));
    }
  
    updateRole(formData) {
      return this.http.put(this.apiURL + '/role', formData)
                      .pipe(catchError(this.errorHandler));
    }
  
    deleteRole(roleId, businessId){
      return this.http.delete(this.apiURL + '/role/' + roleId + '/' + businessId)
                      .pipe(catchError(this.errorHandler));
    }
  
    putNoShow(appId: string){
      return this.http.put(this.apiURL + '/appointments/cancel/precheckin/'+appId, '')
                      .pipe(catchError(this.errorHandler));
    }

    putSuspend(busId: string, sns: string, type: string){
      return this.http.put(this.apiURL + '/business/suspend/'+busId+'/'+sns+'/'+type, '')
                      .pipe(catchError(this.errorHandler));
    }

    errorHandler(error) {
      return throwError(error || 'Server Error');
    }
  }
  