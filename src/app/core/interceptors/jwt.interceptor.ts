import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '@core/services';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  excludeDomain = ['https://www.agilpay.net','https://tucita247.com'];
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    let currentUser = this.authService.currentUserValue;
    let currentUserTkn = this.authService.currentAccessValue;
    let ingreso: boolean = false;
    this.excludeDomain.forEach(res => {
      if (request.url.includes(res)){ ingreso = true; return; }
    });
    if (ingreso) { return next.handle(request); }
    if (currentUser && currentUserTkn) {
      request = request.clone({
          setHeaders: { 
              Authorization: `Bearer ${currentUserTkn}`
          }
      });
    }
    return next.handle(request);
  }
}
