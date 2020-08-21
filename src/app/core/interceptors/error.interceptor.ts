import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpInterceptor,
    HttpErrorResponse,
    HttpEvent
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthService } from '@core/services';
import { UserService } from '@app/services';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(
        private authService: AuthService, 
        private userService: UserService
    ) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request)
            .pipe(
                catchError((err: HttpErrorResponse) => {
                    let message = "";
                    if (err.error instanceof ErrorEvent) {
                        message = "Error on execution";
                    } else {
                        // if (err.status === 0){
                        //     // auto logout if 401 response returned from api
                        //     this.authService.logout();
                        //     location.reload(true);
                        // }
                        if (err.status === 401) {
                            // auto logout if 401 response returned from api
                            // this.authService.logout();
                            // location.reload(true);
                            this.refreshToken();
                        }
                        message = err.error.Message || err.statusText;
                        if (err.status === 404) {
                            message = err.error.Message;
                        }
                        if (err.status === 403) {
                            message = "Auth failed";
                        }
                    }
                    let error = {
                        'Message': message,
                        'Status': err.status
                    };
                    return throwError(error);
                })
            );
    }

    refreshToken(){
        let token = this.authService.currentRefreshToken();
        let userName = this.authService.cognitoUser();
        let formData = {
            RefreshTkn: token,
            Email: userName
        };
        this.userService.updateToken(formData).subscribe(
        (res: any) => {
            if (res.Code == 200){
                console.log("error 401, refresh token");
                sessionStorage.setItem('TC247_TKN', JSON.stringify(res.token));
                sessionStorage.setItem('TC247_ACT', JSON.stringify(res.access));
            }
        },
        catchError(res => {
          return res;
        })
      );
    }
}
