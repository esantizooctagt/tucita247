import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/internal/operators';

import { AuthService } from '@core/services';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  // intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
  //   return next.handle(request);
  // }
  intercept(request: HttpRequest<any>, next: HttpHandler) {
    return next.handle(request).pipe(
        catchError(err  => {
            let message = "";
            if (err instanceof HttpErrorResponse) {
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
                        this.authService.logout();
                        location.reload(true);
                    }
                    message = err.error.message || err.statusText;
                    if (err.status === 404) {
                        message = err.error.Message;
                    }
                    if (err.status === 403){
                        message = "Auth failed";
                    }
                }
            } else {
                message = "Error on execution";
            }
            let error = {  
                'Message': message,
                'Status' : err.status
            };
            return throwError(error);
        })
    );
  }
}
