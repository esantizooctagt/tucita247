import { Component, OnInit } from '@angular/core';
import { AuthService } from '@app/core/services';
import { Router } from '@angular/router';
import { MonitorService } from '@app/shared/monitor.service';

@Component({
  selector: 'app-providers',
  templateUrl: './providers.component.html',
  styleUrls: ['./providers.component.scss']
})
export class ProvidersComponent implements OnInit {
  public filterData: string = undefined;
  changeData: string;

  constructor(
    private authService: AuthService,
    private router: Router,
    private monitorService: MonitorService
  ) { }

  ngOnInit(): void {
    let isAdmin = this.authService.isAdmin();
    if (isAdmin != 1){
      this.router.navigate(['/']);
    }
    this.monitorService.handleData('Search');
    this.monitorService.handleMessage.subscribe(res => this.changeData = res);
  }

  filterList(value){
    this.filterData = value;
  }

}
