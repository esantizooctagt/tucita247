import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MonitorService {
  private monitorSource = new BehaviorSubject('');
  monitorMessage = this.monitorSource.asObservable();

  constructor() { }

  changeData(message: string) {
    this.monitorSource.next(message);
  }
}
