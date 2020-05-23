import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { AuthService } from '@core/services';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Country, Location, Business, Category } from '@app/_models';
import { Observable, Subscription, throwError } from 'rxjs';
import { startWith, map, shareReplay, catchError, tap, finalize } from 'rxjs/operators';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from '@app/shared/dialog/dialog.component';
import { BusinessService, LocationService, CategoryService } from '@app/services/index';
import { ConfirmValidParentMatcher } from '@app/validators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { SpinnerService } from '@app/shared/spinner.service';
import { environment } from '@environments/environment';
import { Options, LabelType } from 'ng5-slider';
import {MatChipInputEvent} from '@angular/material/chips';
import {COMMA, ENTER} from '@angular/cdk/keycodes';

@Component({
  selector: 'app-business',
  templateUrl: './business.component.html',
  styleUrls: ['./business.component.scss']
})
export class BusinessComponent implements OnInit {
  businessId: string='';
  countries: Country[]=environment.countries; //[{"n":"Afghanistan","c":"AFA"},{"n":"Åland Islands","c":"ALA"},{"n":"Albania","c":"ALB"},{"n":"Algeria","c":"DZA"},{"n":"American Samoa","c":"ASM"},{"n":"Andorra","c":"AND"},{"n":"Angola","c":"AGO"},{"n":"Anguilla","c":"AIA"},{"n":"Antarctica","c":"ATA"},{"n":"Antigua and Barbuda","c":"ATG"},{"n":"Argentina","c":"ARG"},{"n":"Armenia","c":"ARM"},{"n":"Aruba","c":"ABW"},{"n":"Australia","c":"AUS"},{"n":"Austria","c":"AUT"},{"n":"Azerbaijan","c":"AZE"},{"n":"Bahamas","c":"BHS"},{"n":"Bahrain","c":"BHR"},{"n":"Bangladesh","c":"BGD"},{"n":"Barbados","c":"BRB"},{"n":"Belarus","c":"BLR"},{"n":"Belgium","c":"BEL"},{"n":"Belize","c":"BLZ"},{"n":"Benin","c":"BEN"},{"n":"Bermuda","c":"BMU"},{"n":"Bhutan","c":"BTN"},{"n":"Bolivia (Plurinational State of)","c":"BOL"},{"n":"Bonaire, Sint Eustatius and Saba","c":"BES"},{"n":"Bosnia and Herzegovina","c":"BIH"},{"n":"Botswana","c":"BWA"},{"n":"Bouvet Island","c":"BVT"},{"n":"Brazil","c":"BRA"},{"n":"British Indian Ocean Territory","c":"IOT"},{"n":"Brunei Darussalam","c":"BRN"},{"n":"Bulgaria","c":"BGR"},{"n":"Burkina Faso","c":"BFA"},{"n":"Burundi","c":"BDI"},{"n":"Cabo Verde","c":"CPV"},{"n":"Cambodia","c":"KHM"},{"n":"Cameroon","c":"CMR"},{"n":"Canada","c":"CAN"},{"n":"Cayman Islands","c":"CYM"},{"n":"Central African Republic","c":"CAF"},{"n":"Chad","c":"TCD"},{"n":"Chile","c":"CHL"},{"n":"China","c":"CHN"},{"n":"Christmas Island","c":"CXR"},{"n":"Cocos (Keeling) Islands","c":"CCK"},{"n":"Colombia","c":"COL"},{"n":"Comoros","c":"COM"},{"n":"Congo","c":"COG"},{"n":"Congo, Democratic Republic of the","c":"COD"},{"n":"Cook Islands","c":"COK"},{"n":"Costa Rica","c":"CRI"},{"n":"Côte d'Ivoire","c":"CIV"},{"n":"Croatia","c":"HRV"},{"n":"Cuba","c":"CUB"},{"n":"Curaçao","c":"CUW"},{"n":"Cyprus","c":"CYP"},{"n":"Czechia","c":"CZE"},{"n":"Denmark","c":"DNK"},{"n":"Djibouti","c":"DJI"},{"n":"Dominica","c":"DMA"},{"n":"Dominican Republic","c":"DOM"},{"n":"Ecuador","c":"ECU"},{"n":"Egypt","c":"EGY"},{"n":"El Salvador","c":"SLV"},{"n":"Equatorial Guinea","c":"GNQ"},{"n":"Eritrea","c":"ERI"},{"n":"Estonia","c":"EST"},{"n":"Eswatini","c":"SWZ"},{"n":"Ethiopia","c":"ETH"},{"n":"Falkland Islands (Malvinas)","c":"FLK"},{"n":"Faroe Islands","c":"FRO"},{"n":"Fiji","c":"FJI"},{"n":"Finland","c":"FIN"},{"n":"France","c":"FRA"},{"n":"French Guiana","c":"GUF"},{"n":"French Polynesia","c":"PYF"},{"n":"French Southern Territories","c":"ATF"},{"n":"Gabon","c":"GAB"},{"n":"Gambia","c":"GMB"},{"n":"Georgia","c":"GEO"},{"n":"Germany","c":"DEU"},{"n":"Ghana","c":"GHA"},{"n":"Gibraltar","c":"GIB"},{"n":"Greece","c":"GRC"},{"n":"Greenland","c":"GRL"},{"n":"Grenada","c":"GRD"},{"n":"Guadeloupe","c":"GLP"},{"n":"Guam","c":"GUM"},{"n":"Guatemala","c":"GTM"},{"n":"Guernsey","c":"GGY"},{"n":"Guinea","c":"GIN"},{"n":"Guinea-Bissau","c":"GNB"},{"n":"Guyana","c":"GUY"},{"n":"Haiti","c":"HTI"},{"n":"Heard Island and McDonald Islands","c":"HMD"},{"n":"Holy See","c":"VAT"},{"n":"Honduras","c":"HND"},{"n":"Hong Kong","c":"HKG"},{"n":"Hungary","c":"HUN"},{"n":"Iceland","c":"ISL"},{"n":"India","c":"IND"},{"n":"Indonesia","c":"IDN"},{"n":"Iran (Islamic Republic of)","c":"IRN"},{"n":"Iraq","c":"IRQ"},{"n":"Ireland","c":"IRL"},{"n":"Isle of Man","c":"IMN"},{"n":"Israel","c":"ISR"},{"n":"Italy","c":"ITA"},{"n":"Jamaica","c":"JAM"},{"n":"Japan","c":"JPN"},{"n":"Jersey","c":"JEY"},{"n":"Jordan","c":"JOR"},{"n":"Kazakhstan","c":"KAZ"},{"n":"Kenya","c":"KEN"},{"n":"Kiribati","c":"KIR"},{"n":"Korea (Democratic People's Republic of)","c":"PRK"},{"n":"Korea, Republic of","c":"KOR"},{"n":"Kuwait","c":"KWT"},{"n":"Kyrgyzstan","c":"KGZ"},{"n":"Lao People's Democratic Republic","c":"LAO"},{"n":"Latvia","c":"LVA"},{"n":"Lebanon","c":"LBN"},{"n":"Lesotho","c":"LSO"},{"n":"Liberia","c":"LBR"},{"n":"Libya","c":"LBY"},{"n":"Liechtenstein","c":"LIE"},{"n":"Lithuania","c":"LTU"},{"n":"Luxembourg","c":"LUX"},{"n":"Macao","c":"MAC"},{"n":"Madagascar","c":"MDG"},{"n":"Malawi","c":"MWI"},{"n":"Malaysia","c":"MYS"},{"n":"Maldives","c":"MDV"},{"n":"Mali","c":"MLI"},{"n":"Malta","c":"MLT"},{"n":"Marshall Islands","c":"MHL"},{"n":"Martinique","c":"MTQ"},{"n":"Mauritania","c":"MRT"},{"n":"Mauritius","c":"MUS"},{"n":"Mayotte","c":"MYT"},{"n":"Mexico","c":"MEX"},{"n":"Micronesia (Federated States of)","c":"FSM"},{"n":"Moldova, Republic of","c":"MDA"},{"n":"Monaco","c":"MCO"},{"n":"Mongolia","c":"MNG"},{"n":"Montenegro","c":"MNE"},{"n":"Montserrat","c":"MSR"},{"n":"Morocco","c":"MAR"},{"n":"Mozambique","c":"MOZ"},{"n":"Myanmar","c":"MMR"},{"n":"Namibia","c":"NAM"},{"n":"Nauru","c":"NRU"},{"n":"Nepal","c":"NPL"},{"n":"Netherlands","c":"NLD"},{"n":"New Caledonia","c":"NCL"},{"n":"New Zealand","c":"NZL"},{"n":"Nicaragua","c":"NIC"},{"n":"Niger","c":"NER"},{"n":"Nigeria","c":"NGA"},{"n":"Niue","c":"NIU"},{"n":"Norfolk Island","c":"NFK"},{"n":"North Macedonia","c":"MKD"},{"n":"Northern Mariana Islands","c":"MNP"},{"n":"Norway","c":"NOR"},{"n":"Oman","c":"OMN"},{"n":"Pakistan","c":"PAK"},{"n":"Palau","c":"PLW"},{"n":"Palestine, State of","c":"PSE"},{"n":"Panama","c":"PAN"},{"n":"Papua New Guinea","c":"PNG"},{"n":"Paraguay","c":"PRY"},{"n":"Peru","c":"PER"},{"n":"Philippines","c":"PHL"},{"n":"Pitcairn","c":"PCN"},{"n":"Poland","c":"POL"},{"n":"Portugal","c":"PRT"},{"n":"Puerto Rico","c":"PRI"},{"n":"Qatar","c":"QAT"},{"n":"Réunion","c":"REU"},{"n":"Romania","c":"ROU"},{"n":"Russian Federation","c":"RUS"},{"n":"Rwanda","c":"RWA"},{"n":"Saint Barthélemy","c":"BLM"},{"n":"Saint Helena, Ascension and Tristan da Cunha","c":"SHN"},{"n":"Saint Kitts and Nevis","c":"KNA"},{"n":"Saint Lucia","c":"LCA"},{"n":"Saint Martin (French part)","c":"MAF"},{"n":"Saint Pierre and Miquelon","c":"SPM"},{"n":"Saint Vincent and the Grenadines","c":"VCT"},{"n":"Samoa","c":"WSM"},{"n":"San Marino","c":"SMR"},{"n":"Sao Tome and Principe","c":"STP"},{"n":"Saudi Arabia","c":"SAU"},{"n":"Senegal","c":"SEN"},{"n":"Serbia","c":"SRB"},{"n":"Seychelles","c":"SYC"},{"n":"Sierra Leone","c":"SLE"},{"n":"Singapore","c":"SGP"},{"n":"Sint Maarten (Dutch part)","c":"SXM"},{"n":"Slovakia","c":"SVK"},{"n":"Slovenia","c":"SVN"},{"n":"Solomon Islands","c":"SLB"},{"n":"Somalia","c":"SOM"},{"n":"South Africa","c":"ZAF"},{"n":"South Georgia and the South Sandwich Islands","c":"SGS"},{"n":"South Sudan","c":"SSD"},{"n":"Spain","c":"ESP"},{"n":"Sri Lanka","c":"LKA"},{"n":"Sudan","c":"SDN"},{"n":"Surin","c":"SUR"},{"n":"Svalbard and Jan Mayen","c":"SJM"},{"n":"Sweden","c":"SWE"},{"n":"Switzerland","c":"CHE"},{"n":"Syrian Arab Republic","c":"SYR"},{"n":"Taiwan, Province of China","c":"TWN"},{"n":"Tajikistan","c":"TJK"},{"n":"Tanzania, United Republic of","c":"TZA"},{"n":"Thailand","c":"THA"},{"n":"Timor-Leste","c":"TLS"},{"n":"Togo","c":"TGO"},{"n":"Tokelau","c":"TKL"},{"n":"Tonga","c":"TON"},{"n":"Trinidad and Tobago","c":"TTO"},{"n":"Tunisia","c":"TUN"},{"n":"Turkey","c":"TUR"},{"n":"Turkmenistan","c":"TKM"},{"n":"Turks and Caicos Islands","c":"TCA"},{"n":"Tuvalu","c":"TUV"},{"n":"Uganda","c":"UGA"},{"n":"Ukraine","c":"UKR"},{"n":"United Arab Emirates","c":"ARE"},{"n":"United Kingdom of Great Britain and Northern Ireland","c":"GBR"},{"n":"United States of America","c":"USA"},{"n":"United States Minor Outlying Islands","c":"UMI"},{"n":"Uruguay","c":"URY"},{"n":"Uzbekistan","c":"UZB"},{"n":"Vanuatu","c":"VUT"},{"n":"Venezuela (Bolivarian Republic of)","c":"VEN"},{"n":"Viet Nam","c":"VNM"},{"n":"Virgin Islands (British)","c":"VGB"},{"n":"Virgin Islands (U.S.)","c":"VIR"},{"n":"Wallis and Futuna","c":"WLF"},{"n":"Western Sahara","c":"ESH"},{"n":"Yemen","c":"YEM"},{"n":"Zambia","c":"ZMB"},{"n":"Zimbabwe","c":"ZWE"}];
   
  subsBusiness: Subscription;
  noLocations: number=0;

  listLocations: Location[]=[];
  connectedTo: string[] =[];
  savingBusiness: boolean = false;
  savingLocation: boolean = false;
  displayBusiness: boolean = true;
  displayLocation: boolean = true;

  filteredCountries$: Observable<Country[]>;
  filteredCategories$: Observable<Category[]>;
  businessSave$: Observable<object>;
  locationSave$: Observable<object>;
  business$: Observable<Business>;
  location$: Observable<Location[]>;
  categories$: Observable<Category[]>;

  public tags: any[]=[];
  public categories: any[]=[];

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  genOption = {
    floor: 0,
    ceil: 24,
    translate: (value: number, label: LabelType): string => {
      switch (label) {
        case LabelType.Low:
          return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
        case LabelType.High:
          return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : value) + ' ' + (value >= 12 ? 'PM' : 'AM');
        default: 
          return (value > 12 ? ((value == 24 ? '11:59' : value-12).toString()) : (value).toString());
      }
    }
  };

  optionsMon: Options = this.genOption;
  optionsTue: Options = this.genOption;
  optionsWed: Options = this.genOption;
  optionsThu: Options = this.genOption;
  optionsFri: Options = this.genOption;
  optionsSat: Options = this.genOption;
  optionsSun: Options = this.genOption;

  get fBusiness(){
    return this.businessForm.controls;
  }

  get fLocations(){
    return this.locationForm.get('locations') as FormArray;
  }

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  confirmValidParentMatcher = new ConfirmValidParentMatcher();
  
  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private authService: AuthService,
    private _snackBar: MatSnackBar,
    private businessService: BusinessService,
    private locationService: LocationService,
    private categoryService: CategoryService,
    private spinnerService: SpinnerService,
    private breakpointObserver: BreakpointObserver
  ) { 

  }

  businessForm = this.fb.group({
    BusinessId: [''],
    Name: ['', [Validators.required, Validators.maxLength(500), Validators.minLength(3)]],
    Country: ['', Validators.required],
    Address: ['', [Validators.required, Validators.maxLength(500), Validators.minLength(3)]],
    City: ['', [Validators.maxLength(100), Validators.minLength(2)]],
    ZipCode: ['', [Validators.maxLength(10), Validators.minLength(3)]],
    Geolocation: ['', [Validators.maxLength(50), Validators.minLength(5)]],
    Phone: ['', [Validators.maxLength(15), Validators.minLength(3)]],
    WebSite: ['', [Validators.maxLength(150), Validators.minLength(4)]],
    Facebook: ['', [Validators.maxLength(150), Validators.minLength(4)]],
    Twitter: ['', [Validators.maxLength(150), Validators.minLength(4)]],
    Instagram: ['', [Validators.maxLength(150), Validators.minLength(4)]],
    Email: ['', [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]],
    OperationHours: [''],
    Categories: [''],
    Tags: [''],
    Status: [''],
    Mon: new FormControl([8, 17]),
    MonEnabled: [0],
    Tue: new FormControl([8, 17]),
    TueEnabled: [0],
    Wed: new FormControl([8, 17]),
    WedEnabled: [0],
    Thu: new FormControl([8, 17]),
    ThuEnabled: [0],
    Fri: new FormControl([8, 17]),
    FriEnabled: [0],
    Sat: new FormControl([8, 12]),
    SatEnabled: [0],
    Sun: new FormControl([8, 12]),
    SunEnabled: [0]
  });
  locationForm = this.fb.group({ 
    locations : this.fb.array([this.createLocation()])
  });

  createLocation(): FormGroup {
    const items = this.fb.group({
      LocationId: [''],
      BusinessId: [this.businessId],
      Name: ['', [Validators.required, Validators.maxLength(500), Validators.minLength(3)]],
      Address: ['', [Validators.required, Validators.maxLength(500), Validators.minLength(3)]],
      Postal_Code: ['', [Validators.maxLength(50), Validators.minLength(3)]],
      Tax_Number: ['', [Validators.required, Validators.maxLength(50), Validators.minLength(2)]],
      Status: [1]
    });
    return items;
  }

  ngOnInit() {
    var spinnerRef = this.spinnerService.start("Loading Business...");
    this.businessId = this.authService.businessId();
    this.onValueChanges();

    this.filteredCountries$ = this.businessForm.get('Country').valueChanges
      .pipe(
        startWith(''),
        map(country => typeof country === 'string' ? country : country.n),
        map(country => country ? this._filter(country) : this.countries.slice())
      );

    this.categoryService.getCategories();
    this.filteredCategories$ = this.businessForm.get('Categories').valueChanges
      .pipe(
        startWith(''),
        map(category => typeof category === 'string' ? category : category.Name)
        // map(category => category ? this._filterCat(category) : this.categories$.slice())
      );

    this.business$ = this.businessService.getBusiness(this.businessId).pipe(
      tap((res: any) => {
        if (res != null){
          let countryValue : Country[];
          if (res.Country != '' && res.Country != undefined){
            countryValue = this.countries.filter(country => country.c.indexOf(res.Country) === 0);
          }
          var opeHour = JSON.parse(res.OperationHours);
          this.businessForm.patchValue({
            BusinessId: res.Business_Id,
            Name: res.Name,
            Country: (countryValue != undefined ? countryValue[0] : ''),
            Address: res.Address,
            City: res.City,
            ZipCode: res.ZipCode,
            Geolocation: res.Geolocation,
            Phone: res.Phone,
            WebSite: res.WebSite,
            Facebook: res.Facebook,
            Twitter: res.Twitter,
            Instagram: res.Instagram,
            Email: res.Email,
            OperationHours: res.OperationHours,
            Categories: res.Categories,
            Tags: res.Tags,
            Status: res.Status,
            Mon: ("MON" in opeHour ? [+opeHour.MON[0].I, +opeHour.MON[0].F] : [8, 12]),
            MonEnabled: ("MON" in opeHour ? 1 : 0),
            Tue: ("TUE" in opeHour ? [+opeHour.TUE[0].I, +opeHour.TUE[0].F] : [8, 12]),
            TueEnabled: ("TUE" in opeHour ? 1 : 0),
            Wed: ("WED" in opeHour ? [+opeHour.WED[0].I, +opeHour.WED[0].F] : [8, 12]),
            WedEnabled: ("WED" in opeHour ? 1 : 0),
            Thu: ("THU" in opeHour ? [+opeHour.THU[0].I, +opeHour.THU[0].F] : [8, 12]),
            ThuEnabled: ("THU" in opeHour ? 1 : 0),
            Fri: ("FRI" in opeHour ? [+opeHour.FRI[0].I, +opeHour.FRI[0].F] : [8, 12]),
            FriEnabled: ("FRI" in opeHour ? 1 : 0),
            Sat: ("SAT" in opeHour ? [+opeHour.SAT[0].I, +opeHour.SAT[0].F] : [8, 12]),
            SatEnabled: ("SAT" in opeHour ? 1 : 0),
            Sun: ("SUN" in opeHour ? [+opeHour.SUN[0].I, +opeHour.SUN[0].F] : [8, 12]),
            SunEnabled: ("SUN" in opeHour ? 1 : 0),
          });

          this.optionsMon = Object.assign({}, this.optionsSat, {disabled: ("MON" in opeHour ? 0 : 1)});
          this.optionsTue = Object.assign({}, this.optionsSat, {disabled: ("TUE" in opeHour ? 0 : 1)});
          this.optionsWed = Object.assign({}, this.optionsSat, {disabled: ("WED" in opeHour ? 0 : 1)});
          this.optionsThu = Object.assign({}, this.optionsSat, {disabled: ("THU" in opeHour ? 0 : 1)});
          this.optionsFri = Object.assign({}, this.optionsSat, {disabled: ("FRI" in opeHour ? 0 : 1)});
          this.optionsSat = Object.assign({}, this.optionsSat, {disabled: ("SAT" in opeHour ? 0 : 1)});
          this.optionsSun = Object.assign({}, this.optionsSat, {disabled: ("SUN" in opeHour ? 0 : 1)});

          this.categories = res.Categories;
          // console.log(res.Tags);
          this.tags = res.Tags.split('#');
          this.spinnerService.stop(spinnerRef);
        } 
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        this.openDialog('Error !', err.Message, false, true, false);
        return throwError(err || err.message);
      })
    );

  
    //Load Locations Stepper 2
  //   this.location$ =  this.locationService.getLocations(this.businessId).pipe(
  //     tap((res: any) => {
  //       const item = this.locationForm.controls.locations as FormArray;
  //       item.at(0).patchValue({
  //         BusinessId: this.businessId
  //       });
  //       if (res != null){
  //         this.listLocations = res.map(response => {
  //           return {
  //             LocationId: response.LocationId,
  //             Name: response.Name
  //           }
  //         });

  //         //link location info to reactive form
  //         this.locationForm.setControl('locations', this.setLocations(res));

  //         //Drag & Drop connectedTo variable
  //         this.listLocations.forEach(s=> {
  //           this.connectedTo.push(s.LocationId);
  //         });
          
  //       }else{
  //         //Add new locations to the view
  //         if (this.noLocations > 1 && this.locationForm.value.locations.length == 1){
  //           for(var i = 1; i <= this.noLocations-1; i++){
  //             (<FormArray>this.locationForm.get('locations')).push(this.createLocation());
  //           }
  //         }
  //       }
  //       this.spinnerService.stop(spinnerRef);
  //     }),
  //     catchError(err => {
  //       this.spinnerService.stop(spinnerRef);
  //       this.openDialog('Error !', err.Message, false, true, false);
  //       return throwError(err || err.message);
  //     })
  //   );
  }

  onChangeDisabled(item: number, event: any){
    switch (item) {
      case 0:
        this.optionsMon = Object.assign({}, this.optionsMon, {disabled: !event.checked});
        break;
      case 1:
        this.optionsTue = Object.assign({}, this.optionsTue, {disabled: !event.checked});
        break;
      case 2:
        this.optionsWed = Object.assign({}, this.optionsWed, {disabled: !event.checked});
        break;
      case 3:
        this.optionsThu = Object.assign({}, this.optionsThu, {disabled: !event.checked});
        break;
      case 4:
        this.optionsFri = Object.assign({}, this.optionsFri, {disabled: !event.checked});
        break;
      case 5:
        this.optionsSat = Object.assign({}, this.optionsSat, {disabled: !event.checked});
        break;
      case 6:
        this.optionsSun = Object.assign({}, this.optionsSun, {disabled: !event.checked});
        break;
    }
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our fruit
    if ((value || '').trim()) {
      this.tags.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  remove(tag: string): void {
    const index = this.tags.indexOf(tag);

    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

  getErrorMessage(component: string, index: number=0) {
    if (component === 'Name'){
      return this.fBusiness.Name.hasError('required') ? 'You must enter a value' :
        this.fBusiness.Name.hasError('minlength') ? 'Minimun length 3' :
          this.fBusiness.Name.hasError('maxlength') ? 'Maximum length 500' :
            '';
    }
    if (component === 'Address'){
      return this.fBusiness.Address.hasError('required') ? 'You must enter a value' :
        this.fBusiness.Address.hasError('minlength') ? 'Minimun length 3' :
          this.fBusiness.Address.hasError('maxlength') ? 'Maximum length 500' :
            '';
    }
    if (component === 'House_No'){
      return this.fBusiness.House_No.hasError('maxlength') ? 'Maximun length 10' :
        this.fBusiness.House_No.hasError('minlength') ? 'Minimun length 2' :
        '';
    }
    if (component === 'Country'){
      return this.fBusiness.Country.hasError('required') ? 'You must select a valid value' :
        this.fBusiness.Country.hasError('validObject') ? 'Invalid value' :
          '';
    }
    if (component === 'State'){
      return this.fBusiness.State.hasError('required') ? 'You must enter a value' :
        this.fBusiness.State.hasError('maxlength') ? 'Maximun length 100' :
          this.fBusiness.State.hasError('minlength') ? 'Minimun length 3' :
          '';
    }
    if (component === 'Phone'){
      return this.fBusiness.Phone.hasError('maxlength') ? 'Maximun length 30' :
        this.fBusiness.Phone.hasError('minlength') ? 'Minimun length 3' :
        '';
    }
    if (component === 'Postal_Code'){
      return this.fBusiness.Postal_Code.hasError('maxlength') ? 'Maximun length 50' :
        this.fBusiness.Postal_Code.hasError('minlength') ? 'Minimun length 3' :
        '';
    }
    if (component === 'Tax_Number'){
      return this.fBusiness.Tax_Number.hasError('required') ? 'You must enter a value' :
        this.fBusiness.Tax_Number.hasError('minlength') ? 'Minimun length 2' :
          this.fBusiness.Tax_Number.hasError('maxlength') ? 'Maximun length 50' :
            '';
    }
    if (component === 'Email'){
      return this.fBusiness.Email.hasError('required') ? 'You must enter a value' :
        this.fBusiness.Email.hasError('pattern') ? 'Email invalid' :
        '';
    }
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
    if (component === 'SPostal_Code'){
      let sPostal = (<FormArray>this.locationForm.get('locations')).controls[index].get('Postal_Code');
      return sPostal.hasError('maxlength') ? 'Maximun length 50' :
        sPostal.hasError('minlength') ? 'Minimun length 3' :
        '';
    }
    if (component === 'STax_Number'){
      let sTax = (<FormArray>this.locationForm.get('locations')).controls[index].get('Tax_Number');
      return sTax.hasError('required') ? 'You must enter a value' :
        sTax.hasError('minlength') ? 'Minimun length 2' :
          sTax.hasError('maxlength') ? 'Maximun length 50' :
            '';
    }
  }

  setLocations(locations: Location[]): FormArray{
    const formLocationsArray = new FormArray([]);
    locations.forEach(s => {
      formLocationsArray.push(this.fb.group({
        LocationId: s.LocationId,
        Name: s.Name,
        BusinessId: this.businessId,
        Address: s.Address,
        Postal_Code: s.Postal_Code,
        Tax_Number: s.Tax_Number,
        Status: s.Status
      }));
    });
    return formLocationsArray;
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

  displayFn(country?: Country): string | undefined {
    return country ? country.n : undefined;
  }

  private _filter(value: string): Country[] {
    let filterValue: string = '';
    filterValue = value.toLowerCase();
    return this.countries.filter(country => country.n.toLowerCase().indexOf(filterValue) === 0);
  }

  displayFnCat(category?: Category): string | undefined {
    return category ? category.Name : undefined;
  }

  private _filterCat(value: string): Category[] {
    let filterValue: string = '';
    filterValue = value.toLowerCase();
    return this.categories.filter(category => category.Name.toLowerCase().indexOf(filterValue) === 0);
  }

  onValueChanges(): void {
    this.subsBusiness = this.businessForm.valueChanges.subscribe(val=>{
      if (val.Country === null){
        this.businessForm.controls["Country"].setValue('');
      }
    });
  }

  onSubmitBusiness(){
    if (!this.businessForm.valid){
      return;
    }
    if (this.businessForm.touched){
      // let countryId = this.businessForm.value.Country;
    
      // let dataForm =  { 
      //   "Name": this.businessForm.value.Name,
      //   "Address": this.businessForm.value.Address,
      //   "House_No": this.businessForm.value.House_No,
      //   "Country": countryId.c,
      //   "State": this.businessForm.value.State,
      //   "Phone": this.businessForm.value.Phone,
      //   "Postal_Code": this.businessForm.value.Postal_Code,
      //   "Tax_Number": this.businessForm.value.Tax_Number,
      //   "Email": this.businessForm.value.Email
      // }
      // var spinnerRef = this.spinnerService.start("Saving Business...");
      // this.businessSave$ = this.businessService.updateBusiness(this.businessId, dataForm).pipe(
      //   tap(res => { 
      //     this.spinnerService.stop(spinnerRef);
      //     this.savingBusiness = true;
      //     this.businessForm.markAsPristine();
      //     this.businessForm.markAsUntouched();
      //     this.openDialog('Business', 'Business updated successful', true, false, false);
      //   }),
      //   catchError(err => {
      //     this.spinnerService.stop(spinnerRef);
      //     this.savingBusiness = false;
      //     this.openDialog('Error !', err.Message, false, true, false);
      //     return throwError(err || err.message);
      //   })
      // );
    }
  }

  onSubmitLocations(){
    if (!this.locationForm.valid){ // && this.validCashier === false){
      return;
    }
    // this.validCashier = false;
    if (this.locationForm.touched){
      // var spinnerRef = this.spinnerService.start("Saving Locations...");
      // this.locationSave$ = this.locationService.updateLocations(this.locationForm.value).pipe(
      //   tap(res => {
      //     this.spinnerService.stop(spinnerRef);
      //     this.savingLocation = true;
      //     this.locationForm.markAsPristine();
      //     this.locationForm.markAsUntouched();
      //     this.openDialog('Locations', 'Location created successful', true, false, false);
      //   }),
      //   catchError(err => {
      //     this.spinnerService.stop(spinnerRef);
      //     this.savingLocation = false;
      //     this.openDialog('Error !', err.Message, false, true, false);
      //     return throwError(err || err.message);
      //   })
      // ); 
    }
  }

  

  ngOnDestroy() {
    if (this.subsBusiness){
      this.subsBusiness.unsubscribe();
    }
  }

}
