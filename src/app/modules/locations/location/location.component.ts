import { Component, OnInit } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AuthService } from '@app/core/services';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LocationService, BusinessService } from '@app/services';
import { SpinnerService } from '@app/shared/spinner.service';
import { ConfirmValidParentMatcher } from '@app/validators';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { DialogComponent } from '@app/shared/dialog/dialog.component';
import { MatChipInputEvent } from '@angular/material/chips';
import { MonitorService } from '@app/shared/monitor.service';

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss']
})
export class LocationComponent implements OnInit {
  businessId: string = '';
  saveLocation$: Observable<object>;
  location$: Observable<any>;
  locationParams$: Observable<any>;
  locationDataList: any;
  sectors$: Observable<any[]>;
  parentBus$: Observable<any[]>;

  lat: number = 18.3796538;
  lng: number = -66.1989426;
  zoom: number = 9;

  cities = [];
  sectors = [] = [];
  countryCode = '';

  //Doors
  doors: string = '';
  selectable = true;
  removable = true;
  addOnBlur = true;

  //Tags
  public tags = [];

  language: string = 'EN';

  businessParent = [];

  get f() {
    return this.locationForm.controls;
  }

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  confirmValidParentMatcher = new ConfirmValidParentMatcher();

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private authService: AuthService,
    private _snackBar: MatSnackBar,
    private locationService: LocationService,
    private businessService: BusinessService,
    private data: MonitorService,
    private spinnerService: SpinnerService
  ) { }

  locationForm = this.fb.group({
    LocationId: [''],
    BusinessId: [''],
    Name: ['', [Validators.required, Validators.maxLength(500), Validators.minLength(3)]],
    City: ['', Validators.required],
    Sector: ['', Validators.required],
    Address: ['', [Validators.required, Validators.maxLength(500), Validators.minLength(3)]],
    Geolocation: ['{0.00,0.00}', [Validators.maxLength(50), Validators.minLength(5)]],
    ParentLocation: ['0', Validators.required],
    MaxConcurrentCustomer: ['', [Validators.required, Validators.min(1)]],
    BucketInterval: ['', [Validators.required, Validators.min(0.5), Validators.max(5)]],
    TotalCustPerBucketInter: ['', [Validators.required, Validators.min(1)]],
    ManualCheckOut: [''],
    Doors: ['', [Validators.required]],
    Status: [1]
  });

  openDialog(header: string, message: string, success: boolean, error: boolean, warn: boolean): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      header: header,
      message: message,
      success: success,
      error: error,
      warn: warn
    };
    dialogConfig.width = '280px';
    dialogConfig.minWidth = '280px';
    dialogConfig.maxWidth = '280px';
    this.dialog.open(DialogComponent, dialogConfig);
  }

  ngOnInit(): void {
    var spinnerRef = this.spinnerService.start("Loading Location...");
    this.businessId = this.authService.businessId();

    this.sectors = [];
    this.sectors.push({ SectorId: "0", Name: "N/A" });
    this.cities.push({ CityId: "0", Name: "N/A" });

    this.data.objectMessage.subscribe(res => this.locationDataList = res);

    this.parentBus$ = this.businessService.getBusinessParent().pipe(
      map(res => {
        if (res != null) {
          this.businessParent.push({ BusinessId: "0", Name: "N/A" });
          this.businessParent.push(res[0]);
          return res;
        }
      })
    );

    this.locationParams$ = this.businessService.getCountry(this.businessId).pipe(
      map((res: any) => {
        if (res != null) {
          this.countryCode = res.CountryId;
          this.onDisplay();
        }
      }),
      switchMap(x => this.locationService.getCities(this.countryCode, this.language).pipe(
        map(res => {
          if (res != null) {
            res.forEach(element => {
              this.cities.push(element);
            });
            this.spinnerService.stop(spinnerRef);
            return res;
          }
        })
      )),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        this.openDialog('Error !', err.Message, false, true, false);
        return throwError(err || err.message);
      })
    );
  }

  onDisplay() {
    if (this.locationDataList != undefined) {
      var spinnerRef = this.spinnerService.start("Loading Location...");
      this.locationForm.reset({ LocationId: '', BusinessId: '', Name: '', City: '', Sector: '', Address: '', Geolocation : '{0.00,0.00}', ParentLocation : '0', MaxConcurrentCustomer: '', BucketInterval: '', TotalCustPerBucketInter: '', ManualCheckOut: '', Doors: '', Status: true});
      this.location$ = this.locationService.getLocation(this.businessId, this.locationDataList, this.countryCode, this.language).pipe(
        map((res: any) => {
          if (res.Code == 200) {
            let loc = res.Data;
            this.locationForm.setValue({
              LocationId: loc.LocationId,
              BusinessId: loc.BusinessId,
              Name: loc.Name,
              City: loc.City,
              Sector: loc.Sector,
              Address: loc.Address,
              Geolocation: loc.Geolocation,
              ParentLocation: loc.ParentLocation,
              MaxConcurrentCustomer: loc.MaxConcurrentCustomer,
              BucketInterval: loc.BucketInterval,
              TotalCustPerBucketInter: loc.TotalCustPerBucketInter,
              ManualCheckOut: loc.ManualCheckOut,
              Doors: loc.Doors,
              Status: (loc.Status == 1 ? true : false)
            });
            this.sectors = res.Data.Sectors;
            this.doors = loc.Doors;
            this.spinnerService.stop(spinnerRef);
            return location;
          }
        }),
        catchError(err => {
          this.spinnerService.stop(spinnerRef);
          this.openDialog('Error !', err.Message, false, true, false);
          return throwError(err || err.Message);
        })
      );
    }
  }

  onKeyPress(event, value): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    let perc: string = value.toString();
    var count = (perc.match(/[.]/g) || []).length;
    if (count == 1) {
      if (charCode == 46) return false;
    }
    if (charCode == 46) return true;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  getErrorMessage(component: string) {
    if (component === 'Name') {
      return this.f.Name.hasError('required') ? 'You must enter a value' :
        this.f.Name.hasError('minlength') ? 'Minimun length 3' :
          this.f.Name.hasError('maxlength') ? 'Maximun length 500' :
            '';
    }
    if (component === 'Address') {
      return this.f.Address.hasError('required') ? 'You must enter a value' :
        this.f.Address.hasError('minlength') ? 'Minimun length 3' :
          this.f.Address.hasError('maxlength') ? 'Maximum length 500' :
            '';
    }
    if (component === 'City') {
      return this.f.City.hasError('required') ? 'You must enter a value' :
        '';
    }
    if (component === 'Sector') {
      return this.f.Sector.hasError('required') ? 'You must enter a value' :
        '';
    }
    if (component === 'ParentLocation') {
      return this.f.ParentLocation.hasError('required') ? 'You must enter a value' :
        '';
    }
    if (component === 'MaxConcurrentCustomer') {
      return this.f.maxConcurrentCustomer.hasError('required') ? 'You must enter a value' :
        '';
    }
    if (component === 'BucketInterval') {
      return this.f.bucketInterval.hasError('required') ? 'You must enter a value' :
        '';
    }
    if (component === 'TotalCustPerBucketInter') {
      return this.f.totalCustPerBucketInter.hasError('required') ? 'You must enter a value' :
        '';
    }
  }

  removeDoor(door: string): void {
    const index = this.doors.indexOf(door);
    if (index > 0) {
      this.doors = this.doors.replace(',' + door, '');
    } else if (index == 0) {
      if (this.doors.length > index + door.length) {
        this.doors = this.doors.replace(door + ',', '');
      } else {
        this.doors = this.doors.replace(door, '');
      }
    } else {
      this.doors = this.doors.replace(door, '');
    }
  }

  removeTag(tag: string) {
    var data = this.tags.findIndex(e => e === tag);
    this.tags.splice(data, 1);
  }

  addDoor(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      if (this.doors != '') {
        this.doors = this.doors + ',' + value;
      } else {
        this.doors = value;
      }
    }
    if (input) {
      input.value = '';
    }
  }

  addTag(event: MatChipInputEvent) {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      this.tags.push(value);
    }
    if (input) {
      input.value = '';
    }
  }

  onCancel(){
    this.locationForm.reset({ LocationId: '', BusinessId: '', Name: '', City: '', Sector: '', Address: '', Geolocation : '{0.00,0.00}', ParentLocation : '0', MaxConcurrentCustomer: '', BucketInterval: '', TotalCustPerBucketInter: '', ManualCheckOut: '', Doors: '', Status: true});
  }

  onSubmit() {
    if (this.locationForm.invalid) { return; }
    if (this.locationForm.touched) {
      let location = {
        LocationId: this.locationForm.value.LocationId,
        Name: this.locationForm.value.Name,
        Address: this.locationForm.value.Address,
        City: this.locationForm.value.City,
        Sector: this.locationForm.value.Sector,
        Geolocation: '{"LAT": ' + this.lat + ',"LNG": ' + this.lng + '}',
        ParentLocation: this.locationForm.value.ParentLocation,
        MaxConcurrentCustomer: this.locationForm.value.MaxConcurrentCustomer,
        BucketInterval: this.locationForm.value.BucketInterval,
        TotalCustPerBucketInter: this.locationForm.value.TotalCustPerBucketInter,
        Status: (this.locationForm.value.Status == true ? 1 : 0),
        ManualCheckOut: (this.locationForm.value.ManualCheckOut == true ? 1 : 0),
        Doors: this.doors.toString()
      }
      console.log(location);
      return;
      var spinnerRef = this.spinnerService.start("Saving Locations...");
      this.saveLocation$ = this.locationService.postLocations(location).pipe(
        map((res:any) => {
          if (res != null){
            if (res.Code == 200){
              this.spinnerService.stop(spinnerRef);
              this.locationForm.patchValue({LocationId: res.LocationId});
              this.openDialog('Location', 'Location saved successfully', true, false, false);
            } else {
              this.spinnerService.stop(spinnerRef);
              this.openDialog('Error ! ', 'Something goes wrong, try again', false, true, false);
            }
          } else {
            this.spinnerService.stop(spinnerRef);
            this.openDialog('Error ! ', 'Something goes wrong, try again', false, true, false);
          }
          return res;
        }),
        catchError(err => {
          this.spinnerService.stop(spinnerRef);
          this.openDialog('Error !', err.Message, false, true, false);
          return throwError(err || err.message);
        })
      );
    }
  }

  loadSectors(cityId: string) {
    this.sectors$ = this.locationService.getSectors(this.countryCode, cityId, this.language).pipe(
      map(res => {
        if (res != null) {
          this.sectors = [];
          this.sectors.push({ SectorId: "0", Name: "N/A" });
          res.forEach(element => {
            this.sectors.push(element);
          });
          return res;
        }
      }),
      catchError(err => {
        return throwError(err || err.message);
      })
    )
  }

  markerDragEnd($event: MouseEvent) {
    let res = $event['coords'];

    this.lat = res.lat;
    this.lng = res.lng;
  }

  markerDragEndLoc($event: MouseEvent) {
    let res = $event['coords'];

    this.lat = res.lat;
    this.lng = res.lng;
  }

}
