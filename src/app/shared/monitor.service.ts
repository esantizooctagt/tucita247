import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MonitorService {
  private monitorSource = new BehaviorSubject('');
  private handleSource = new BehaviorSubject('');

  handleMessage = this.handleSource.asObservable();
  monitorMessage = this.monitorSource.asObservable();

  constructor() { }

  changeData(message: string) {
    this.monitorSource.next(message);
  }

  handleData(message: string){
    this.handleSource.next(message);
  }
}
