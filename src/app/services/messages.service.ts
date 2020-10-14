import { Injectable } from '@angular/core';
import { AuthService } from '@app/core/services';
import { Subject } from 'rxjs/Rx';
import { WebSocketService } from '../services/web-socket.service';
import { environment } from '@environments/environment';

const CHAT_URL = environment.wsEndPoint;

@Injectable({
  providedIn: 'root'
})

export class MessagesService {
  public messages: Subject<any>;
  private businessId: string='';

  constructor(
    // wsService: WebSocketService,
    private authService: AuthService
  ) {
    this.businessId = this.authService.businessId();
    // this.messages = <Subject<any>>wsService.connect(CHAT_URL+(this.businessId != '' ? '?businessId=' + this.businessId : '')).map(
    //   (response: MessageEvent): any => {
    //     let data = JSON.parse(response.data);
    //     return data; 
    //   }
    // );
  }
  
}
