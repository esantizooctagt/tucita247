import { Component, OnInit } from '@angular/core';
import { User } from '@app/_models';
import { AuthService } from '@app/core/services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  public clickedUser: User;
  
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
    this.clickedUser = user;
  }

}
