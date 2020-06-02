import { Component, OnInit, ɵConsole } from '@angular/core';
import { User } from '@app/_models';
import { AuthService } from '@app/core/services';
import { Router } from '@angular/router';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  public clickedUser: User;
  public displayForm: string = 'Search';
  public filterData: string = undefined;
  public valueForm: string = undefined;
  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    let isAdmin = this.authService.isAdmin();
    let roleId = this.authService.roleId();
    if (roleId != '' && isAdmin != 1){
      this.router.navigate(['/']);
    }
  }

  onSelected(user: User) {
    console.log("Comp user - click on edit");
    console.log(user);
    // (async () => {
    //   this.valueForm = '';
    //   this.clickedUser = undefined;
    //   await delay(20);
    //   this.valueForm = 'Add';
    //   this.clickedUser = user;
    // })();
    
  }

  getForm(value){
    this.displayForm= value;
  }

  filterList(value){
    this.filterData = value;
  }
}
