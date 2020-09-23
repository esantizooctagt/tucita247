import { Component, OnInit } from '@angular/core';
import { AuthService } from '@app/core/services';
import { Router } from '@angular/router';
import { MonitorService } from '@app/shared/monitor.service';

@Component({
  selector: 'app-roles-admin',
  templateUrl: './roles-admin.component.html',
  styleUrls: ['./roles-admin.component.scss']
})
export class RolesAdminComponent implements OnInit {
  public filterData: string = undefined;
  changeData: string;

  constructor(
    private authService: AuthService,
    private router: Router,
    private monitorService: MonitorService
  ) { }

  ngOnInit(): void {
    let roleId = this.authService.roleId();
    
    if (this.authService.superAdmin() != 'c4ca4238a0b923820dcc509a6f75849b'){
      this.router.navigate(['/']);
    }
    this.monitorService.handleData('Search');
    this.monitorService.handleMessage.subscribe(res => this.changeData = res);
  }

  filterList(value){
    this.filterData = value;
  }

}
