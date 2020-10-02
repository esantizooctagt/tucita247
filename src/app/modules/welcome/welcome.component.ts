import { Component, OnInit } from '@angular/core';
import { Route, Router } from '@angular/router';
import { AuthService } from '@app/core/services';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {
  isAdmin: number = 0;
  superAdmin: number = 0;
  md5Admin: string = 'c4ca4238a0b923820dcc509a6f75849b';
  constructor(
    public authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    if (this.authService.superAdmin() == this.md5Admin){
      this.superAdmin = 1;
    }
  }

  redirectTo(link: string){
    if (this.isAdmin == 0 && this.superAdmin == 0) {return;}
    this.router.navigate(['/' + link]);
  }
}
