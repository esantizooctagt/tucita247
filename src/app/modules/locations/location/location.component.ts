import { Component, OnInit } from '@angular/core';
import { Observable, throwError, empty } from 'rxjs';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AuthService } from '@app/core/services';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LocationService, BusinessService } from '@app/services';
import { SpinnerService } from '@app/shared/spinner.service';
import { ConfirmValidParentMatcher } from '@app/validators';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { map, catchError, switchMap } from 'rxjs/operators';
import { DialogComponent } from '@app/shared/dialog/dialog.component';
import { MatChipInputEvent } from '@angular/material/chips';
import { MonitorService } from '@app/shared/monitor.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ShopdialogComponent } from '@app/shared/shopdialog/shopdialog.component';
import { MapsAPILoader } from '@agm/core';
import { LearnDialogComponent } from '@app/shared/learn-dialog/learn-dialog.component';

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
  geoLoc$: Observable<any>;
  appos$: Observable<any>;

  free: number = 0;
  invalid: number = 0;
  email: string = '';

  lat: number = 18.3796538;
  lng: number = -66.1989426;
  zoom: number = 12;

  cities = [];
  sectors = [];
  countryCode = '';
  textStatus: string='';

  //Doors
  doors: string = '';
  selectable = true;
  removable = true;
  addOnBlur = true;

  //Tags
  public tags = [];

  language: string = 'EN';
  businessTemp = [];
  businessParent = [];

  private geocoder: any;
  
  get f() {
    return this.locationForm.controls;
  }

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  confirmValidParentMatcher = new ConfirmValidParentMatcher();

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private learnmore: MatDialog,
    private authService: AuthService,
    private _snackBar: MatSnackBar,
    private locationService: LocationService,
    private businessService: BusinessService,
    private data: MonitorService,
    private route: ActivatedRoute,
    private router: Router,
    private spinnerService: SpinnerService,
    // public geocodeService: GeocodeService,
    private mapLoader: MapsAPILoader
  ) { }

  locationForm = this.fb.group({
    LocationId: [''],
    BusinessId: [''],
    Name: ['', [Validators.required, Validators.maxLength(500), Validators.minLength(3)]],
    City: ['', Validators.required],
    Sector: ['', Validators.required],
    ZipCode: ['', [Validators.maxLength(10), Validators.minLength(3)]],
    Address: ['', [Validators.required, Validators.maxLength(500), Validators.minLength(3)]],
    Geolocation: ['{0.00,0.00}', [Validators.maxLength(50), Validators.minLength(5)]],
    ParentLocation: ['0'],
    MaxConcurrentCustomer: ['', [Validators.required, Validators.min(1)]],
    ManualCheckOut: [false],
    Doors: ['', [Validators.required]],
    Status: [true]
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

  openLearnMore(message: string): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      message: message
    };
    this.learnmore.open(LearnDialogComponent, dialogConfig);
  }

  openShopDialog(header: string, message: string, business: string, email: string): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      header: header,
      message: message,
      businessId: business,
      email: email
    };
    dialogConfig.width = '280px';
    dialogConfig.minWidth = '280px';
    dialogConfig.maxWidth = '280px';
    this.dialog.open(ShopdialogComponent, dialogConfig);
  }

  ngOnInit(): void {
    this.mapLoader.load().then(() => {
      this.geocoder = new google.maps.Geocoder;
    });

    this.data.handleData('Add');
    let language = this.authService.language();

    this.email = this.authService.email();
    this.businessId = this.authService.businessId();
    this.locationDataList = this.route.snapshot.paramMap.get('locationId');

    var spinnerRef = this.spinnerService.start($localize`:@@locations.loadlocation:`);
    if (this.locationDataList == "0"){
      this.doors = (language.toUpperCase() == "EN" ? 'MAIN DOOR' : 'PUERTA PRINCIPAL');
      this.locationForm.patchValue({Doors: this.doors});

      this.appos$ = this.businessService.getBusinessAppos(this.businessId).pipe(
        map((res: any) => {
          if (res != null){
            this.free  = (res.Name.toString().toUpperCase() == 'FREE' || res.Name.toString().toUpperCase() == 'GRATIS' ? 1: 0); 
            if (this.free == 1){
              this.spinnerService.stop(spinnerRef);
              this.openShopDialog($localize`:@@shared.shopheader:`, $localize`:@@shared.shopmessage:`, this.businessId, this.email);
              this.router.navigate(['/locations']);
            }
            return res;
          }
        }),
        catchError(err => {
          return err;
        })
      );
    }

    this.language = this.authService.language() == "" ? "EN" : this.authService.language();

    this.sectors = [];
    this.sectors.push({ SectorId: "0", Name: "N/A" });
    this.cities.push({ CityId: "0", Name: "N/A" });

    this.parentBus$ = this.businessService.getBusinessParent().pipe(
      map(res => {
        if (res != null) {
          this.businessParent.push({ BusinessId: "0", Name: "N/A" });
          res.forEach(x=>{
            this.businessParent.push({ BusinessId: x.BusinessId, Name: x.Name});
          });
          this.businessParent = this.businessParent.sort((a, b) => (a.Name < b.Name ? -1 : 1));
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
        this.openDialog($localize`:@@shared.error:`, err.Message, false, true, false);
        return throwError(err || err.message);
      })
    );
  }

  onDisplay() {
    if (this.locationDataList != undefined && this.locationDataList != "0") {
      var spinnerRef = this.spinnerService.start($localize`:@@locations.loadlocation:`);
      this.locationForm.reset({ LocationId: '', BusinessId: '', Name: '', City: '', Sector: '', ZipCode: '', Address: '', Geolocation : '{0.00,0.00}', ParentLocation : '0', MaxConcurrentCustomer: '', ManualCheckOut: false, Doors: '', Status: true});
      this.location$ = this.locationService.getLocation(this.businessId, this.locationDataList, this.countryCode, this.language).pipe(
        map((res: any) => {
          if (res.Code == 200) {
            let loc = res.Data;
            if (loc != '') {
              this.sectors = res.Data.Sectors;
              let data = {
                SectorId: "0",
                Name: "N/A"
              }
              this.sectors.push(data);
              this.locationForm.setValue({
                LocationId: loc.LocationId,
                BusinessId: loc.BusinessId,
                Name: loc.Name,
                City: loc.City,
                Sector: (loc.Sector == "" ? "0" : loc.Sector),
                Address: loc.Address,
                ZipCode: loc.ZipCode,
                Geolocation: loc.Geolocation,
                ParentLocation: loc.ParentLocation,
                MaxConcurrentCustomer: loc.MaxConcurrentCustomer,
                ManualCheckOut: loc.ManualCheckOut,
                Doors: loc.Doors,
                Status: (loc.Status == 1 ? true : false)
              });
              let geo = JSON.parse(loc.Geolocation);
              this.lat = geo.LAT;
              this.lng = geo.LNG;
              this.doors = loc.Doors;
              this.textStatus = (loc.Status == 0 ? $localize`:@@shared.disabled:` : $localize`:@@shared.enabled:`);
            } else {
              this.invalid = 1;
            }
            this.spinnerService.stop(spinnerRef);
            return location;
          }
        }),
        catchError(err => {
          this.spinnerService.stop(spinnerRef);
          this.openDialog($localize`:@@shared.error:`, err.Message, false, true, false);
          this.router.navigate(['/locations']);
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
    const val3 = '3';
    const val500 = '500';
    const min3 = '3';
    const min10 = '10';
    if (component === 'Name') {
      return this.f.Name.hasError('required') ? $localize`:@@shared.entervalue:` :
        this.f.Name.hasError('minlength') ? $localize`:@@shared.minimun: ${val3}` :
          this.f.Name.hasError('maxlength') ? $localize`:@@shared.maximun: ${val500}` :
            '';
    }
    if (component === 'Address') {
      return this.f.Address.hasError('required') ? $localize`:@@shared.entervalue:` :
        this.f.Address.hasError('minlength') ? $localize`:@@shared.minimun: ${val3}` :
          this.f.Address.hasError('maxlength') ? $localize`:@@shared.maximun: ${val500}` :
            '';
    }
    if (component === 'City') {
      return this.f.City.hasError('required') ? $localize`:@@shared.entervalue:` :
        '';
    }
    if (component === 'ZipCode'){
      return this.f.ZipCode.hasError('maxlength') ? $localize`:@@shared.maximun: ${min10}` :
        this.f.ZipCode.hasError('minlength') ? $localize`:@@shared.minimun: ${min3}` :
        '';
    }
    if (component === 'Sector') {
      return this.f.Sector.hasError('required') ? $localize`:@@shared.entervalue:` :
        '';
    }
    if (component === 'ParentLocation') {
      return this.f.ParentLocation.hasError('required') ? $localize`:@@shared.entervalue:` :
        '';
    }
    if (component === 'MaxConcurrentCustomer') {
      return this.f.maxConcurrentCustomer.hasError('required') ? $localize`:@@shared.entervalue:` :
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
    this.locationForm.patchValue({Doors: this.doors});
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
    this.locationForm.patchValue({Doors: this.doors});
    if (input) {
      input.value = '';
    }
  }

  onCancel(){
    this.router.navigate(['/locations']);
  }

  onSubmit() {
    if (this.locationForm.invalid) { return; }
    if (this.locationForm.touched) {
      let location = {
        BusinessId: this.businessId,
        LocationId: this.locationForm.value.LocationId,
        Name: this.locationForm.value.Name,
        Address: this.locationForm.value.Address,
        ZipCode: this.locationForm.value.ZipCode,
        City: this.locationForm.value.City,
        Sector: this.locationForm.value.Sector,
        Geolocation: '{"LAT": ' + this.lat + ',"LNG": ' + this.lng + '}',
        ParentLocation: this.locationForm.value.ParentLocation,
        MaxConcurrentCustomer: this.locationForm.value.MaxConcurrentCustomer,
        Status: (this.locationForm.value.Status == true ? 1 : 0),
        ManualCheckOut: (this.locationForm.value.ManualCheckOut == true ? 1 : 0),
        Doors: this.doors.toString()
      }
      var spinnerRef = this.spinnerService.start($localize`:@@locations.savinglocations:`);
      this.saveLocation$ = this.locationService.postLocations(location).pipe(
        map((res:any) => {
          if (res != null){
            if (res.Code == 200){
              this.spinnerService.stop(spinnerRef);
              this.locationForm.patchValue({LocationId: res.LocationId});
              this.openDialog($localize`:@@locations.subtitlesing:`, $localize`:@@locations.savedsuccess:`, true, false, false);
            } else {
              this.spinnerService.stop(spinnerRef);
              this.openDialog($localize`:@@shared.error:`, $localize`:@@shared.wrong:`, false, true, false);
            }
            this.router.navigate(['/locations']);
          } else {
            this.spinnerService.stop(spinnerRef);
            this.openDialog($localize`:@@shared.error:`, $localize`:@@shared.wrong:`, false, true, false);
          }
          return res;
        }),
        catchError(err => {
          this.spinnerService.stop(spinnerRef);
          this.openDialog($localize`:@@shared.error:`, err.Message, false, true, false);
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
          console.log("set default value");
          this.locationForm.patchValue({Sector: "0"});
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

  setMarker(data){
    if (data.length >= 5){
      this.geocodeAddress(data);
    }
  }

  geocodeAddress(location: string){
    this.geocoder.geocode({'address': location}, (results, status) => {
      if (status == google.maps.GeocoderStatus.OK) {
        console.log('Geocoding complete!');
        this.lat = results[0].geometry.location.lat();
        this.lng = results[0].geometry.location.lng();
      } else {
          console.log('Error - ', results, ' & Status - ', status);
      }
    });
  }

  learnMore(message: string){
    this.openLearnMore(message);
  }

}
