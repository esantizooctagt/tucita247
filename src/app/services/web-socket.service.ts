import { Injectable } from '@angular/core';
import { EMPTY, Observable, Subject, timer } from 'rxjs';
import { catchError, delayWhen, retryWhen, switchAll, tap } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from '@environments/environment';
import { AuthService } from '@app/core/services';

export const WS_ENDPOINT = environment.wsEndPoint;
export const RECONNECT_INTERVAL = 2000;

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private businessId: string = '';
  private socket$: WebSocketSubject<any>;
  private messagesSubject$ = new Subject();
  public messages$ = this.messagesSubject$.pipe(switchAll(), catchError(e => { throw e }));
 
  constructor(private authService: AuthService) {
    this.businessId = this.authService.businessId();
  }

  public connect(cfg: { reconnect: boolean } = { reconnect: false }): void {
    if (!this.socket$ || this.socket$.closed) {
      this.socket$ = this.getNewWebSocket();
      const messages = this.socket$.pipe(cfg.reconnect ? this.reconnect : o => o,
        tap({
          error: error => console.log(error),
        }), 
        catchError(_ => EMPTY)
      );
      this.messagesSubject$.next(messages);
    }
  }
 
  private reconnect(observable: Observable<any>): Observable<any> {
    return observable.pipe(
      retryWhen(errors => errors.pipe(
        tap(val => console.log('Try to reconnect', val)), 
        delayWhen(_ => timer(RECONNECT_INTERVAL))
        )
      )
    ); 
  }

  private getNewWebSocket() {
    // console.log(WS_ENDPOINT+(this.businessId != '' ? '?businessId=' + this.businessId : ''));
    return webSocket({
      url: WS_ENDPOINT+(this.businessId != '' ? '?businessId=' + this.businessId : ''),
      openObserver: {
        next: () => {
          console.log('connection ok');
        }
      },
      closeObserver: {
        next: () => {
          console.log('connection closed');
          this.socket$ = undefined;
          this.connect({ reconnect: true });
        }
      },
    });
  }

  sendMessage(msg: any) {
    this.socket$.next(msg);
  }

  public close() {
    this.socket$.complete();
    this.socket$ = undefined;
  }
}