import { Component, OnInit } from '@angular/core';
import { AuthService } from '@app/core/services';
import { Router } from '@angular/router';
import { MonitorService } from '@app/shared/monitor.service';

@Component({
  selector: 'app-polls',
  templateUrl: './polls.component.html',
  styleUrls: ['./polls.component.scss']
})
export class PollsComponent implements OnInit {
  public filterData: string = undefined;
  changeData: string;
  constructor(
    private authService: AuthService,
    private router: Router,
    private monitorService: MonitorService
  ) { }

  ngOnInit(): void {
    this.monitorService.handleData('Search');
    this.monitorService.handleMessage.subscribe(res => this.changeData = res);
  }

  filterList(value){
    this.filterData = value;
  }

}
