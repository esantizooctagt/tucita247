import { Component, OnInit } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { FormBuilder, FormArray, FormGroup, Validators } from '@angular/forms';
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

@Component({
  selector: 'app-locations',
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.scss']
})
export class LocationsComponent implements OnInit {
  businessId: string = '';
  locationSave$: Observable<object>;
  location$: Observable<any>;
  savingLocation: boolean = false;
  displayLocation: boolean = true;

  sectors$: Observable<any[]>;
  parentBus$: Observable<any[]>;

  lat: number = 18.3796538;
  lng: number = -66.1989426;
  latLoc: any[] = [];
  lngLoc: any[] = [];
  zoom: number = 9;

  cities = [];
  sectors = [];
  countryCode = '';

  //Doors
  noItemsLoc = 0;
  doors: any[] = [];
  selectable = true;
  removable = true;
  addOnBlur = true;

  //Tags
  public tags =[];
  public apposPurpose=[];

  language: string = 'EN';

  businessParent = [];

  get fLocations(){
    return this.locationForm.get('locations') as FormArray;
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
    private spinnerService: SpinnerService
  ) { }

  locationForm = this.fb.group({ 
    locations : this.fb.array([this.createLocation()])
  });

  createLocation(): FormGroup {
    const items = this.fb.group({
      LocationId: [''],
      BusinessId: [''],
      Name: ['', [Validators.required, Validators.maxLength(500), Validators.minLength(3)]],
      City: ['', Validators.required],
      Sector: ['', Validators.required],
      Address: ['', [Validators.required, Validators.maxLength(500), Validators.minLength(3)]],
      Geolocation: ['{0.00,0.00}', [Validators.maxLength(50), Validators.minLength(5)]],
      ParentLocation: ['0', Validators.required],
      MaxConcurrentCustomer:['',[Validators.required, Validators.min(1)]],
      BucketInterval: ['',[Validators.required, Validators.min(0.5), Validators.max(5)]],
      TotalCustPerBucketInter: ['',[Validators.required, Validators.min(1)]],
      ManualCheckOut: [''],
      Doors: ['',[Validators.required]],
      Status: [1]
    });
    this.noItemsLoc = this.noItemsLoc+1;
    this.latLoc[this.noItemsLoc] = 18.3796538;
    this.lngLoc[this.noItemsLoc] = -66.1989426;

    this.sectors[this.noItemsLoc] = [];
    this.sectors[this.noItemsLoc].push({SectorId: "0", Name: "N/A"});
    
    return items;
  }
  
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
    dialogConfig.width ='280px';
    dialogConfig.minWidth = '280px';
    dialogConfig.maxWidth = '280px';
    this.dialog.open(DialogComponent, dialogConfig);
  }
  
  ngOnInit(): void {
    var spinnerRef = this.spinnerService.start("Loading Locations...");
    this.businessId = this.authService.businessId();

    this.parentBus$ = this.businessService.getBusinessParent().pipe(
      map(res => {
        if (res != null){
          this.businessParent.push({BusinessId: "0", Name: "N/A"});
          this.businessParent.push(res[0]);
          return res;
        }
      })
    );

    this.location$ = this.businessService.getCountry(this.businessId).pipe (
      map((res: any) => {
        if (res != null) {
          this.countryCode = res.CountryId;
        }
      }),
      switchMap(x => this.locationService.getCities(this.countryCode, this.language).pipe(
        map(res => {
          if (res != null){
            res.forEach(element => {
              this.cities.push(element);
            });  
            return res;
          }
        })
      )),
      switchMap(v => this.locationService.getLocations(this.businessId, this.countryCode, this.language).pipe(
        tap((res: any) => {
          if (res != null){
            this.locationForm.setControl('locations', this.setLocations(res.Locations));
          }
          this.spinnerService.stop(spinnerRef);
          return v;
        })
      )),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        this.openDialog('Error !', err.Message, false, true, false);
        return throwError(err || err.message);
      })
    );
  }

  setLocations(res: Observable<any[]>){
    const formArray = new FormArray([]);
    let index: number =0;
    res.forEach((s: any) => {
      var locMap = JSON.parse(s.Geolocation);
      if ("LAT" in locMap) {
        this.latLoc[index] = locMap['LAT'];
      } else {
        this.latLoc[index] = 0;
      }
      if ("LNG" in locMap){
        this.lngLoc[index] = locMap['LNG'];
      } else {
        this.lngLoc[index] = 0;
      }
      this.doors[index] = "";
      this.zoom = 15;
      
      this.sectors[index] = [];
      this.noItemsLoc =  index;
      
      this.sectors[index] = s.Sectors;
      this.sectors[index].push({SectorId: "0", Name: "N/A"});

      formArray.push(
        this.fb.group({
          BusinessId: s.BusinessId,
          LocationId: s.LocationId,
          Name: s.Name,
          Address: s.Address,
          Geolocation: s.Geolocation,
          ParentLocation: s.ParentLocation,
          City: s.City,
          Sector: s.Sector,
          MaxConcurrentCustomer: s.MaxConcurrentCustomer,
          BucketInterval: s.BucketInterval,
          TotalCustPerBucketInter: s.TotalCustPerBucketInter,
          ManualCheckOut: s.ManualCheckOut,
          Doors: '',
          Status: (s.Status == "1" ? true : false)
        })
      );
      this.doors[index] = s.Doors;
      index = index+1;
    });
    return formArray;
  }

  loadSectorsInit(locs: Observable<any>){
    let index  = 0;
    this.sectors[index] = [];
    locs.forEach((s: any) => {
      this.locationService.getSectors(this.countryCode, s.City, this.language).pipe(
        map(res => {
          if (res != null){
            this.sectors[index] = [];
            this.sectors[index].push({SectorId: "0", Name: "N/A"});
            res.forEach(element => {
              this.sectors[index].push(element);
            });
            return res;
          }
        })
      );
      index = index + 1;
    })
  }

  onKeyPress(event, value): boolean { 
    const charCode = (event.which) ? event.which : event.keyCode;
    let perc: string = value.toString();
    var count = (perc.match(/[.]/g) || []).length;
    if (count  == 1) {
      if (charCode == 46) return false;
    }
    if (charCode == 46) return true;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  getErrorMessage(component: string, index: number=0) {
    if (component === 'SName'){
      let sName = (<FormArray>this.locationForm.get('locations')).controls[index].get('Name');
      return sName.hasError('required') ? 'You must enter a value' :
        sName.hasError('minlength') ? 'Minimun length 3' :
          sName.hasError('maxlength') ? 'Maximum length 500' :
            '';
    }
    if (component === 'SAddress'){
      let sAddress = (<FormArray>this.locationForm.get('locations')).controls[index].get('Address');
      return sAddress.hasError('required') ? 'You must enter a value' :
        sAddress.hasError('minlength') ? 'Minimun length 3' :
          sAddress.hasError('maxlength') ? 'Maximum length 500' :
            '';
    }
    if (component === 'SCity'){
      let sCity = (<FormArray>this.locationForm.get('locations')).controls[index].get('City');
      return sCity.hasError('required') ? 'You must enter a value' :
        '';
    }
    if (component === 'Sector'){
      let sSector = (<FormArray>this.locationForm.get('locations')).controls[index].get('Sector');
      return sSector.hasError('required') ? 'You must enter a value' :
        '';
    }
    if (component === 'ParentLocation'){
      let sParentLocation = (<FormArray>this.locationForm.get('locations')).controls[index].get('ParentLocation');
      return sParentLocation.hasError('required') ? 'You must enter a value' :
        '';
    }
    if (component === 'MaxConcurrentCustomer'){
      let maxConcurrentCustomer = (<FormArray>this.locationForm.get('locations')).controls[index].get('MaxConcurrentCustomer');
      return maxConcurrentCustomer.hasError('required') ? 'You must enter a value':
        '';
    }
    if (component === 'BucketInterval'){
      let bucketInterval = (<FormArray>this.locationForm.get('locations')).controls[index].get('BucketInterval');
      return bucketInterval.hasError('required') ? 'You must enter a value':
        '';
    }
    if (component === 'TotalCustPerBucketInter'){
      let totalCustPerBucketInter = (<FormArray>this.locationForm.get('locations')).controls[index].get('TotalCustPerBucketInter');
      return totalCustPerBucketInter.hasError('required') ? 'You must enter a value':
        '';
    }
  }

  addLocation(){
    (<FormArray>this.locationForm.get('locations')).push(this.createLocation());
  }

  delLocation(index: number){
    let loca =  this.locationForm.get('locations') as FormArray;
    let item = loca.at(index);
    if (item.value.LocationId == ''){
      loca.removeAt(index);
      this.noItemsLoc = this.noItemsLoc-1;
    }
  }

  removeDoor(door: string, i: number): void {
    const index = this.doors[i].indexOf(door);
    if (index > 0) {
      this.doors[i] = this.doors[i].replace(','+door,'');
    } else if (index == 0) {
      if (this.doors[i].length > index+door.length) {
        this.doors[i] = this.doors[i].replace(door+',','');
      } else {
        this.doors[i] = this.doors[i].replace(door,'');
      }
    } else {
      this.doors[i] = this.doors[i].replace(door,'');
    }
  }

  removeTag(tag: string){
    var data = this.tags.findIndex(e => e === tag);
    this.tags.splice(data, 1);
  }

  removePurpose(appoPurpose: string){
    var data = this.apposPurpose.findIndex(e => e === appoPurpose);
    this.apposPurpose.splice(data, 1);
  }

  addDoor(event: MatChipInputEvent, i: number): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      if (this.doors[i] != ''){
        this.doors[i] = this.doors[i] + ',' + value;
      } else {
        this.doors[i] = value;
      }
    }
    if (input) {
      input.value = '';
    }
  }

  addTag(event: MatChipInputEvent){
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      this.tags.push(value);
    }
    if (input) {
      input.value = '';
    }
  }

  addPurpose(event: MatChipInputEvent){
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()){
      this.apposPurpose.push(value);
    }
    if (input){
      input.value = '';
    }
  }

  onSubmitLocations(){
    if (this.locationForm.invalid){ 
      return;
    }
    // if (this.locationForm.touched){
      let loca =  this.locationForm.get('locations') as FormArray;
      let items: any[] = [];
      for (var i = 0; i < this.noItemsLoc; i++) {
        let item = loca.at(i);
        let location = {
          LocationId: item.value.LocationId,
          Name: item.value.Name,
          Address: item.value.Address,
          City: item.value.City,
          Sector: item.value.Sector,
          Geolocation: '{"LAT": '+ this.latLoc[i]+',"LNG": '+this.lngLoc[i]+'}',
          ParentLocation: item.value.ParentLocation,
          MaxConcurrentCustomer: item.value.MaxConcurrentCustomer,
          BucketInterval: item.value.BucketInterval,
          TotalCustPerBucketInter: item.value.TotalCustPerBucketInter,
          Status: (item.value.Status == true ? 1: 0),
          ManualCheckOut: (item.value.ManualCheckOut == true ? 1: 0),
          Doors: this.doors[i].toString()
        }
        items.push(location);
      }
      let dataForm = {
        Locs: items
      }
      var spinnerRef = this.spinnerService.start("Saving Locations...");
      this.locationSave$ = this.locationService.updateLocations(dataForm, this.businessId).pipe(
        tap(res => {
          this.spinnerService.stop(spinnerRef);
          this.savingLocation = true;
          this.locationForm.markAsPristine();
          this.locationForm.markAsUntouched();
          this.openDialog('Locations', 'Location created successful', true, false, false);
        }),
        catchError(err => {
          this.spinnerService.stop(spinnerRef);
          this.savingLocation = false;
          this.openDialog('Error !', err.Message, false, true, false);
          return throwError(err || err.message);
        })
      ); 
    // }
  }

  loadSectors(cityId: string, i: number){
    this.sectors$ = this.locationService.getSectors(this.countryCode, cityId, this.language).pipe(
      map(res => {
        if (res != null){
          this.sectors[i]= [];
          this.sectors[i].push({SectorId: "0", Name: "N/A"});
          res.forEach(element => {
            this.sectors[i].push(element);
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

  markerDragEndLoc($event: MouseEvent, i: number){
    let res = $event['coords'];

    this.latLoc[i] = res.lat;
    this.lngLoc[i] = res.lng;
  }
  
}
