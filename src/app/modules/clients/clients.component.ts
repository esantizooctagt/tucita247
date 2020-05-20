import { Component, OnInit } from '@angular/core';
import { Options } from 'ng5-slider';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent implements OnInit {
  minValue: number[] = [8,8,8,8,8,8,8];
  maxValue: number[] = [17,17,17,17,17,12,12];
  options: Options = {
    floor: 0,
    ceil: 24
  };
  optionsWeekend: Options = {
    floor: 0,
    ceil: 24,
    disabled: true
  };

  constructor() { }

  ngOnInit(): void {
  }

  onChangeRange(event){
    console.log(event);
  }

}
