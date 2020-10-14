import { Injectable } from '@angular/core';
import { EMPTY, Subject } from 'rxjs';
import { catchError, switchAll, tap } from 'rxjs/operators';
// import * as Rx from "rxjs/Rx";
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from '@environments/environment';
import { AuthService } from '@app/core/services';

export const WS_ENDPOINT = environment.wsEndPoint;

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  businessId: string = '';
  constructor(private authService: AuthService) {
    this.businessId = this.authService.businessId();
  }

  private socket$: WebSocketSubject<any>;
  private messagesSubject$ = new Subject();
  public messages$ = this.messagesSubject$.pipe(switchAll(), catchError(e => { throw e }));
 
  public connect(): void {
    if (!this.socket$ || this.socket$.closed) {
      this.socket$ = this.getNewWebSocket();
      const messages = this.socket$.pipe(
        tap({
          error: error => console.log(error),
        }), catchError(_ => EMPTY));
        console.log(messages);
      this.messagesSubject$.next(messages);
    }
  }
 
  private getNewWebSocket() {
    return webSocket(WS_ENDPOINT+(this.businessId != '' ? '?businessId=' + this.businessId : ''));
  }

  sendMessage(msg: any) {
    console.log("send message ");
    console.log(msg);
    this.socket$.next(msg);
  }

  close() {
    this.socket$.complete(); 
  }
}