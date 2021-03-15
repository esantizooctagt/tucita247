import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '@core/services';
import { Category, Country } from '@app/_models';
import { MapsAPILoader } from '@agm/core';
import { Observable, Subscription, throwError } from 'rxjs';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { CategoryService, LocationService, BusinessService } from '@app/services';
import { SpinnerService } from '@app/shared/spinner.service';
import { catchError, map, startWith, tap } from 'rxjs/operators';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { environment } from '@environments/environment';
import { ConfirmValidParentMatcher } from '@app/validators';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from '@app/shared/dialog/dialog.component';

@Component({
  selector: 'app-new-business',
  templateUrl: './new-business.component.html',
  styleUrls: ['./new-business.component.scss']
})
export class NewBusinessComponent implements OnInit {
  countries: Country[]=environment.countries; 
  subsBusiness: Subscription;

  //Filtered Countries
  filteredCountries$: Observable<Country[]>;

  private geocoder: any;

  language: string = 'EN';
  
  lat: number = 18.3796538;
  lng: number = -66.1989426;
  latLoc: any[] = [];
  lngLoc: any[] = [];
  zoom: number = 12;

  cities = [];
  sectors = [];
  countryCode = '';

  selectable = true;
  removable = true;
  addOnBlur = true;

  //Reasons
  public reasons=[];

  //Categories
  visibleCategory = true;
  selectableCategory = true;
  removableCategory = true;
  categories: Category[]=[];
  categories$: Observable<Category[]>;
  geoLoc$: Observable<any>;
  sectors$: Observable<any[]>;
  filteredCategories$: Observable<Category[]>;

  businessSave$: Observable<any>;
  cities$: Observable<any>;

  allCategories: Category[]=[];
  @ViewChild('categoryInput') categoryInput: ElementRef<HTMLInputElement>;
  @ViewChild('autoCategory') matAutocomplete: MatAutocomplete;
  Categories = new FormControl();

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  
  existLink = false;
  linkValidated: boolean = false;
  availability$: Observable<any>;
  loadingBusiness: boolean = false;
  
  get fBusiness(){
    return this.businessForm.controls;
  }

  confirmValidParentMatcher = new ConfirmValidParentMatcher();

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private categoryService: CategoryService,
    private authService: AuthService,
    private mapLoader: MapsAPILoader,
    private locationService: LocationService,
    private businessService: BusinessService
  ) {
    this.language = this.authService.language();
    this.categories$ = this.categoryService.getCategories(this.language).pipe(
      map(res => {
        this.allCategories = res;
        this.filteredCategories$ = this.Categories.valueChanges.pipe(
          startWith(null),
          map((category: string | null) => category ? this._filterCategory(category)  : this.allCategories.slice()),
          map(cats => {
            return cats.sort((a, b) => (a.CategoryId < b.CategoryId ? -1 : 1))
          })
        );
        return this.allCategories;
      })
    );
  }

  businessForm = this.fb.group({
    BusinessId: [''],
    Name: ['', [Validators.required, Validators.maxLength(500), Validators.minLength(3)]],
    Country: ['', Validators.required],
    Address: ['', [Validators.required, Validators.maxLength(500), Validators.minLength(3)]],
    City: ['', Validators.required],
    Sector: ['', Validators.required],
    ZipCode: ['', [Validators.maxLength(10), Validators.minLength(3)]],
    Geolocation: ['', [Validators.maxLength(100), Validators.minLength(5)]],
    Phone: ['', [Validators.maxLength(15), Validators.minLength(3)]],
    Email: ['', [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]],
    ShortDescription: ['', [Validators.required, Validators.maxLength(75), Validators.minLength(10)]],
    TuCitaLink: ['', [Validators.required, Validators.maxLength(50), Validators.minLength(2)]],
    Categories: ['', [Validators.required]],
    MaxConcurrentCustomer: [''],
    Service_Name: [''],
    Provider_Name: [''],
    First_Name: [''],
    Last_Name: [''],
    Language: ['es'],
    Reasons: ['']
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
    dialogConfig.width ='280px';
    dialogConfig.minWidth = '280px';
    dialogConfig.maxWidth = '280px';
    this.dialog.open(DialogComponent, dialogConfig);
  }

  ngOnInit(): void {
    this.mapLoader.load().then(() => {
      this.geocoder = new google.maps.Geocoder;
    });

    this.sectors[0] = [];
    this.sectors[0].push({SectorId: "0", Name: "N/A"});
    // this.cities.push({CityId: "0", Name: "N/A"});

    this.onValueChanges();

    this.filteredCountries$ = this.businessForm.get('Country').valueChanges
      .pipe(
        startWith(''),
        map(country => typeof country === 'string' ? country : country.n),
        map(country => country ? this._filterCountry(country) : this.countries.slice())
      );
  }

  getCities(countryCode){
    this.countryCode = countryCode.c;
    this.cities$ = this.locationService.getCities(this.countryCode, this.language).pipe(
      map(res => {
        if (res != null) {
          res.forEach(element => {
            this.cities.push(element);
          });
          return res;
        }
      })
    );
  }

  geocodeAddress(location: string){
    console.log("previo a ingres a geocode");
    this.geocoder.geocode({'address': location}, (results, status) => {
      console.log("previo a status === ");
      if (status == google.maps.GeocoderStatus.OK) {
        console.log('Geocoding complete!');
        this.lat = results[0].geometry.location.lat();
        this.lng = results[0].geometry.location.lng();
        console.log(this.lat);
        console.log(this.lng);
      } else {
          console.log('Error - ', results, ' & Status - ', status);
      }
    });
  }

  removeCategory(category: Category): void {
    const index = this.categories.findIndex(res => res.Name ===category.Name); 
    if (index >= 0) {
      this.categories.splice(index, 1);
      this.businessForm.get('Categories').setValue(this.categories);
    }
  }

  selectedCategory(event: MatAutocompleteSelectedEvent): void {
    if (this.categories.length < 1) {
      this.categories.push({CategoryId: event.option.value, Name: event.option.viewValue});
      this.categoryInput.nativeElement.value = '';
      this.Categories.setValue(null);
      this.businessForm.get('Categories').setValue(this.categories);
    }
  }

  private _filterCategory(value: string): Category[] {
    const filterValue = value.toLowerCase();
    return this.allCategories.filter(category => category.Name.toLowerCase().indexOf(filterValue) === 0);
  }

  onValueChanges(): void {
    this.subsBusiness = this.businessForm.valueChanges.subscribe(val=>{
      if (val.Country === null){
        this.businessForm.controls["Country"].setValue('');
      }
    });
  }

  displayFn(country?: Country): string | undefined {
    return country ? country.n : undefined;
  }

  private _filterCountry(value: string): Country[] {
    let filterValue: string = '';
    filterValue = value.toLowerCase();
    return this.countries.filter(country => country.n.toLowerCase().indexOf(filterValue) === 0);
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
          this.businessForm.patchValue({Sector: "0"});
          return res;
        }
      }),
      catchError(err => {
        return throwError(err || err.message);
      })
    )
  }
  
  getErrorMessage(component: string, index: number=0) {
    const min2 = '2';
    const min3 = '3';
    const min4 = '4';
    const min5 = '5';
    const min10 = '10';
    const max15 = '15';
    const max50 = '50';
    const max75 = '75';
    const max100 = '100';
    const max150 = '150';
    const max255 = '255';
    const max500 = '500';
    if (component === 'Name'){
      return this.fBusiness.Name.hasError('required') ? $localize`:@@shared.entervalue:` :
        this.fBusiness.Name.hasError('minlength') ? $localize`:@@shared.minimun: ${min3}` :
          this.fBusiness.Name.hasError('maxlength') ? $localize`:@@shared.maximun: ${max500}` :
            '';
    }
    if (component === 'Country'){
      return this.fBusiness.Country.hasError('required') ? $localize`:@@shared.invalidselectvalue:` :
        this.fBusiness.Country.hasError('validObject') ? $localize`:@@shared.invalidvalue:` :
          '';
    }
    if (component === 'Address'){
      return this.fBusiness.Address.hasError('required') ? $localize`:@@shared.entervalue:` :
        this.fBusiness.Address.hasError('minlength') ? $localize`:@@shared.minimun: ${min3}` :
          this.fBusiness.Address.hasError('maxlength') ? $localize`:@@shared.maximun: ${max500}` :
            '';
    }
    if (component === 'ShortDescription'){
      return this.fBusiness.ShortDescription.hasError('required') ? $localize`:@@shared.entervalue:` :
        this.fBusiness.ShortDescription.hasError('minlength') ? $localize`:@@shared.minimun: ${min10}` :
          this.fBusiness.ShortDescription.hasError('maxlength') ? $localize`:@@shared.maximun: ${max75}` :
            '';
    }
    if (component === 'TuCitaLink'){
      return this.fBusiness.TuCitaLink.hasError('required') ? $localize`:@@shared.entervalue:` :
        this.fBusiness.TuCitaLink.hasError('minlength') ? $localize`:@@shared.minimun: ${min2}` :
          this.fBusiness.TuCitaLink.hasError('maxlength') ? $localize`:@@shared.maximun: ${max50}` :
            '';
    }
    if (component === 'City'){
      return this.fBusiness.State.hasError('required') ? $localize`:@@shared.entervalue:` :
        this.fBusiness.State.hasError('maxlength') ? $localize`:@@shared.maximun: ${max100}` :
          this.fBusiness.State.hasError('minlength') ? $localize`:@@shared.minimun: ${min2}` :
          '';
    }
    if (component === 'ZipCode'){
      return this.fBusiness.ZipCode.hasError('maxlength') ? $localize`:@@shared.maximun: ${min10}` :
        this.fBusiness.ZipCode.hasError('minlength') ? $localize`:@@shared.minimun: ${min3}` :
        '';
    }
    if (component === 'Geolocation'){
      return this.fBusiness.House_No.hasError('maxlength') ? $localize`:@@shared.maximun: ${max50}` :
        this.fBusiness.House_No.hasError('minlength') ? $localize`:@@shared.minimun: ${min5}` :
        '';
    }
    if (component === 'Phone'){
      return this.fBusiness.Phone.hasError('maxlength') ? $localize`:@@shared.maximun: ${max15}` :
        this.fBusiness.Phone.hasError('minlength') ? $localize`:@@shared.minimun: ${min3}` :
        '';
    }
    if (component === 'Email'){
      return this.fBusiness.Email.hasError('required') ? $localize`:@@shared.entervalue:` :
        this.fBusiness.Email.hasError('pattern') ? $localize`:@@forgot.emailformat:` :
        '';
    }
    if (component === 'Service_Name'){
      return this.fBusiness.Service_Name.hasError('required') ? $localize`:@@shared.entervalue:` :
        this.fBusiness.Service_Name.hasError('minlength') ? $localize`:@@shared.minimun: ${min3}` :
          this.fBusiness.Service_Name.hasError('maxlength') ? $localize`:@@shared.maximun: ${max100}` :
            '';
    }
    if (component === 'Provider_Name'){
      return this.fBusiness.Provider_Name.hasError('required') ? $localize`:@@shared.entervalue:` :
        this.fBusiness.Provider_Name.hasError('minlength') ? $localize`:@@shared.minimun: ${min3}` :
          this.fBusiness.Provider_Name.hasError('maxlength') ? $localize`:@@shared.maximun: ${max100}` :
            '';
    }
    if (component === 'First_Name'){
      return this.fBusiness.First_Name.hasError('required') ? $localize`:@@shared.entervalue:` :
        this.fBusiness.First_Name.hasError('minlength') ? $localize`:@@shared.minimun: ${min3}` :
          this.fBusiness.First_Name.hasError('maxlength') ? $localize`:@@shared.maximun: ${max100}` :
            '';
    }
    if (component === 'Last_Name'){
      return this.fBusiness.Last_Name.hasError('required') ? $localize`:@@shared.entervalue:` :
        this.fBusiness.Last_Name.hasError('minlength') ? $localize`:@@shared.minimun: ${min3}` :
          this.fBusiness.Last_Name.hasError('maxlength') ? $localize`:@@shared.maximun: ${max100}` :
            '';
    }
    if (component === 'Categories'){
      return this.fBusiness.Categories.hasError('required') ? $localize`:@@shared.invalidselectvalue:` :
        '';
    }
  }

  onSubmitBusiness(){
    let phone = this.businessForm.value.Phone.replace('+1','');
    phone = phone.replace(/[^0-9]/g,'');
    let countryId = this.businessForm.value.Country;
    let locs = [];
    let dtLocs = {
      "Name": this.businessForm.value.Name,
      "City": this.businessForm.value.City,
      "Sector": this.businessForm.value.Sector,
      "Address": this.businessForm.value.Address,
      "Geolocation": '{"LAT": '+ this.lat+',"LNG": '+this.lng+'}',
      "MaxCustomer": this.businessForm.value.MaxConcurrentCustomer
    }
    locs.push(dtLocs);
    let dataForm =  { 
      "Email": this.businessForm.value.Email,
      "First_Name": this.businessForm.value.First_Name,
      "Last_Name": this.businessForm.value.Last_Name,
      "User_Phone": phone,
      "Address": this.businessForm.value.Address,
      "City": this.businessForm.value.City,
      "Country": countryId.c,
      "CategoryId": this.businessForm.value.Categories[0].CategoryId,
      "CategoryName": this.businessForm.value.Categories[0].Name,
      "Name": this.businessForm.value.Name,
      "Provider": this.businessForm.value.Provider_Name,
      "Phone": phone,
      "Geolocation": '{"LAT": '+ this.lat+',"LNG": '+this.lng+'}',
      "Facebook": "",
      "Instagram": "",
      "Twitter": "",
      "Website": "",
      "Tags": "",
      "TuCitaLink": (this.existLink ? '' : this.businessForm.value.TuCitaLink),
      "ZipCode": this.businessForm.value.ZipCode,
      "Description": this.businessForm.value.ShortDescription,
      "Plan": "FREE",
      "Language": this.businessForm.value.Language,
      "Locations": [dtLocs]
    }
    this.businessSave$ = this.businessService.postBusiness(dataForm).pipe(
      tap((res: any) => { 
        if (res.Code == 200) {
          this.businessForm.reset({BusinessId: '', Categories: '', Name: '', Country: '', Address: '', City: '', ZipCode: '', Geolocation: '', Phone: '', Email: '', Reasons: '', ShortDescription: '', TuCitaLink: '', Sector: '', MaxConcurrentCustomer: '', Service_Name: '', Provider_Name: '', First_Name: '', Last_Name: '', Language: 'es'});
          this.openDialog($localize`:@@business.businesstextpopup:`, $localize`:@@business.businessupdate:`, true, false, false);
        } else {
          this.openDialog($localize`:@@shared.error:`, 'Something goes wrong', false, true, false);
        }
      }),
      catchError(err => {
        this.openDialog($localize`:@@shared.error:`, err.Message, false, true, false);
        return throwError(err || err.message);
      })
    );
  }

  setMarker(data){
    if (data.length >= 5){
      this.geocodeAddress(data);
    }
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

  // removeReason(reason: string){
  //   var data = this.reasons.findIndex(e => e === reason);
  //   this.reasons.splice(data, 1);
  // }

  // addReason(event: MatChipInputEvent){
  //   const input = event.input;
  //   const value = event.value;

  //   if ((value || '').trim()){
  //     this.reasons.push(value);
  //   }
  //   if (input){
  //     input.value = '';
  //   }
  // }

  checkLinkAvailability(data) { 
    this.linkValidated = false;
    if (data.target.value != ''){
      this.loadingBusiness = true;
      this.availability$ = this.businessService.validateLink(data.target.value).pipe(
        tap((result: any) => { 
          this.linkValidated = true;
          if (result.Available == 0){
            this.businessForm.controls.TuCitaLink.setErrors({notUnique: true});
          } else {
            this.businessForm.controls.TuCitaLink.setErrors(null);
          }
          this.loadingBusiness = false;
          return result; 
        })
      );
    }
  }

  getCitaLink(data){
    let text = data.target.value;
    if (text != undefined){
      text = text.toString().toLowerCase();
      text = text.replace(/[^a-zA-ZÀ-ȕ0-9]+/g, '-');
      text = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      this.businessForm.get('TuCitaLink').setValue(text);
    }
  }
}
