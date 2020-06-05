import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormGroup, FormBuilder } from '@angular/forms';
import { UserService, LocationService } from '@app/services';
import { AuthService } from '@app/core/services';
import { map, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { SpinnerService } from '@app/shared/spinner.service';
import { MatTable } from '@angular/material/table';

@Component({
  selector: 'app-userloc',
  templateUrl: './userloc.component.html',
  styleUrls: ['./userloc.component.scss']
})
export class UserlocComponent implements OnInit {
  @ViewChild(MatTable) userTable :MatTable<any>;

  businessId: string = '';
  locs$: Observable<any[]>;
  users$: Observable<any[]>;
  
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
    private locationService: LocationService,
    private spinnerService: SpinnerService,
    private authService: AuthService
  ) { }
  
  ngOnInit(): void {
    var spinnerRef = this.spinnerService.start("Loading Users...");
    this.businessId = this.authService.businessId();
    this.locs$ = this.locationService.getLocationsCode(this.businessId).pipe(
      map((res: any) => {
        if (res != null){
          return res.locs;
        }
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        return throwError(err || err.message);
      })
    );

    this.users$ = this.userService.getUsersLoc(this.businessId).pipe(
      map((res: any) =>{
        return res.users;
      })
    );
    this.usersForm.setControl('users', this.setUsers(this.users$));
  }

  setUsers(usrs: Observable<any[]>){
    const formArray = new FormArray([]);
    var spinnerRef = this.spinnerService.start("Loading Users...");
    usrs.forEach(res => {
      res.forEach(user => {
        formArray.push(
          this.fb.group({
            UserId: user.User_Id,
            Name: user.First_Name + ' ' + user.Last_Name,
            Email: user.Email,
            LocationId: user.LocationId,
            Door: user.Door,
            Actions: ''
          }));
          this.userTable.renderRows();
      });
      this.spinnerService.stop(spinnerRef);
    });
    return formArray;
  }

  changeLocation(event: any, i: number){
    console.log(event);
    console.log(i);
  }

  changeDoor(event: any, i:number){
    console.log(event);
  }
}
