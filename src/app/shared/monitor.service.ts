import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '@app/_models';

@Injectable({
  providedIn: 'root'
})
export class MonitorService {
  private monitorSource = new BehaviorSubject('');
  private handleSource = new BehaviorSubject('');
  private objectSource = new BehaviorSubject<any>(null);
  private syncSource = new BehaviorSubject<any>(null);

  handleMessage = this.handleSource.asObservable();
  monitorMessage = this.monitorSource.asObservable();
  objectMessage = this.objectSource.asObservable();
  syncMessage = this.syncSource.asObservable();

  constructor() { }

  changeData(message: string) {
    this.monitorSource.next(message);
  }

  handleData(message: string){
    this.handleSource.next(message);
  }

  setData(message: any){
    this.objectSource.next(message);
  }

  syncData(message: any){
    this.syncSource.next(message);
  }
}
