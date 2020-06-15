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
                            this.authService.logout();
                            location.reload(true);
                            // this.refreshToken();
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
        let email = this.authService.email();
        let formData = {
            RefreshTkn: token,
            Email: email
        };
        console.log(formData);
        // fetch("https://cognito-idp.us-east-1.amazonaws.com/", {
        //     headers: {
        //         "X-Amz-Target": "AWSCognitoIdentityProviderService.InitiateAuth",
        //         "Content-Type": "application/x-amz-json-1.1",
        //     },
        //     mode: 'cors',
        //     cache: 'no-cache',
        //     method: 'POST',
        //     body: JSON.stringify({
        //         ClientId: "52k0o8239mueu31uu5fihccbbf",
        //         AuthFlow: 'REFRESH_TOKEN',
        //         AuthParameters: {
        //             REFRESH_TOKEN: token,
        //             SECRET_HASH: "1r2k3dm8748i5dfu632eu8ptai7vocidm01vp3la82nhq91jgqqt",
        //         }
        //     }),
        // }).then((res) => {
        //     console.log(res.json);
        //     return res.json(); // this will give jwt id and access tokens
        // });
        // this.userService.updateToken(formData).subscribe((res: any) => {
        //     if (res != null){
        //         console.log(res);
        //     } else {
        //         this.authService.logout();
        //         location.reload(true);
        //     }
        // },
        // error => {
        //     this.authService.logout();
        //     location.reload(true);
        // });
    }
}
