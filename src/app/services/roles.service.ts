import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { Role, Applications, Access } from '@app/_models';
import { catchError } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  readonly apiURL = environment.apiUrl;
  constructor(private http: HttpClient) { }

  getRoles(companyId): Observable<Role[]> {
    return this.http.get<Role[]>(this.apiURL + '/roles/' + companyId)
                    .pipe(catchError(this.errorHandler));
  }

  getRole(roleId): Observable<Role>{
    return this.http.get<Role>(this.apiURL + '/role/' + roleId)
                    .pipe(catchError(this.errorHandler));
  }

  getApplications(roleId): Observable<Access[]>{
    return this.http.get<Access[]>(this.apiURL + '/apps/'+(roleId === '' ? '0' : roleId))
                    .pipe(catchError(this.errorHandler));
  }

  getAccess(roleId, nameApp): Observable<any>{
    return this.http.get<any>(this.apiURL + '/apps/'+roleId+'/'+nameApp)
                    .pipe(catchError(this.errorHandler));
  }

  postRole(formData) {
    return this.http.post(this.apiURL + '/role', formData)
                    .pipe(catchError(this.errorHandler));
  }

  updateRole(roleId, formData) {
    return this.http.patch(this.apiURL + '/role/'  + roleId, formData)
                    .pipe(catchError(this.errorHandler));
  }

  deleteRole(roleId){
    return this.http.delete(this.apiURL + '/role/' + roleId)
                    .pipe(catchError(this.errorHandler));
  }

  errorHandler(error) {
    return throwError(error || 'Server Error');
  }
}
