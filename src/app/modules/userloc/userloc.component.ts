import { Component, OnInit } from '@angular/core';
import { FormArray, FormGroup, FormBuilder } from '@angular/forms';
import { UserService } from '@app/services';
import { AuthService } from '@app/core/services';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-userloc',
  templateUrl: './userloc.component.html',
  styleUrls: ['./userloc.component.scss']
})
export class UserlocComponent implements OnInit {
  businessId: string = '';
  displayedColumns = ['Name', 'Email', 'Location', 'Door', 'Actions'];
  
  get fUsers(){
    return this.usersForm.get('users') as FormArray;
  }

  usersForm = this.fb.group({
    users: this.fb.array([this.addUserLoc()])
  });

  addUserLoc(): FormGroup {
    const items = this.fb.group({
        UserId: [''],
        Name: [''],
        Email: [''],
        LocationId: [''],
        Door: ['']
    })
    return items;
  }

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService
  ) { }
  
  ngOnInit(): void {
    this.businessId = this.authService.businessId();
    this.taxes$ = this.locationService.getTaxes(data).pipe(
      map((res: any) => {
        if (res != null){
          this.taxes = res.taxes;
          return res.taxes;
        }
      })
    );

    this.userService.getUsersLoc(this.businessId).pipe(
      map((res: any) =>{

      })
    )
  }

}
