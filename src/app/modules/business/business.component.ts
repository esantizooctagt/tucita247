import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { AuthService } from '@core/services';
import { Country, Location, Business, Category } from '@app/_models';
import { Observable, Subscription, throwError } from 'rxjs';
import { startWith, map, shareReplay, catchError, tap, switchMap, mergeMap } from 'rxjs/operators';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from '@app/shared/dialog/dialog.component';
import { BusinessService, LocationService, CategoryService } from '@app/services/index';
import { ConfirmValidParentMatcher } from '@app/validators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { SpinnerService } from '@app/shared/spinner.service';
import { environment } from '@environments/environment';
import { Options, LabelType } from 'ng5-slider';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';

@Component({
  selector: 'app-business',
  templateUrl: './business.component.html',
  styleUrls: ['./business.component.scss']
})
export class BusinessComponent implements OnInit {
  businessId: string='';
  countries: Country[]=environment.countries; //[{"n":"Afghanistan","c":"AFA"},{"n":"Åland Islands","c":"ALA"},{"n":"Albania","c":"ALB"},{"n":"Algeria","c":"DZA"},{"n":"American Samoa","c":"ASM"},{"n":"Andorra","c":"AND"},{"n":"Angola","c":"AGO"},{"n":"Anguilla","c":"AIA"},{"n":"Antarctica","c":"ATA"},{"n":"Antigua and Barbuda","c":"ATG"},{"n":"Argentina","c":"ARG"},{"n":"Armenia","c":"ARM"},{"n":"Aruba","c":"ABW"},{"n":"Australia","c":"AUS"},{"n":"Austria","c":"AUT"},{"n":"Azerbaijan","c":"AZE"},{"n":"Bahamas","c":"BHS"},{"n":"Bahrain","c":"BHR"},{"n":"Bangladesh","c":"BGD"},{"n":"Barbados","c":"BRB"},{"n":"Belarus","c":"BLR"},{"n":"Belgium","c":"BEL"},{"n":"Belize","c":"BLZ"},{"n":"Benin","c":"BEN"},{"n":"Bermuda","c":"BMU"},{"n":"Bhutan","c":"BTN"},{"n":"Bolivia (Plurinational State of)","c":"BOL"},{"n":"Bonaire, Sint Eustatius and Saba","c":"BES"},{"n":"Bosnia and Herzegovina","c":"BIH"},{"n":"Botswana","c":"BWA"},{"n":"Bouvet Island","c":"BVT"},{"n":"Brazil","c":"BRA"},{"n":"British Indian Ocean Territory","c":"IOT"},{"n":"Brunei Darussalam","c":"BRN"},{"n":"Bulgaria","c":"BGR"},{"n":"Burkina Faso","c":"BFA"},{"n":"Burundi","c":"BDI"},{"n":"Cabo Verde","c":"CPV"},{"n":"Cambodia","c":"KHM"},{"n":"Cameroon","c":"CMR"},{"n":"Canada","c":"CAN"},{"n":"Cayman Islands","c":"CYM"},{"n":"Central African Republic","c":"CAF"},{"n":"Chad","c":"TCD"},{"n":"Chile","c":"CHL"},{"n":"China","c":"CHN"},{"n":"Christmas Island","c":"CXR"},{"n":"Cocos (Keeling) Islands","c":"CCK"},{"n":"Colombia","c":"COL"},{"n":"Comoros","c":"COM"},{"n":"Congo","c":"COG"},{"n":"Congo, Democratic Republic of the","c":"COD"},{"n":"Cook Islands","c":"COK"},{"n":"Costa Rica","c":"CRI"},{"n":"Côte d'Ivoire","c":"CIV"},{"n":"Croatia","c":"HRV"},{"n":"Cuba","c":"CUB"},{"n":"Curaçao","c":"CUW"},{"n":"Cyprus","c":"CYP"},{"n":"Czechia","c":"CZE"},{"n":"Denmark","c":"DNK"},{"n":"Djibouti","c":"DJI"},{"n":"Dominica","c":"DMA"},{"n":"Dominican Republic","c":"DOM"},{"n":"Ecuador","c":"ECU"},{"n":"Egypt","c":"EGY"},{"n":"El Salvador","c":"SLV"},{"n":"Equatorial Guinea","c":"GNQ"},{"n":"Eritrea","c":"ERI"},{"n":"Estonia","c":"EST"},{"n":"Eswatini","c":"SWZ"},{"n":"Ethiopia","c":"ETH"},{"n":"Falkland Islands (Malvinas)","c":"FLK"},{"n":"Faroe Islands","c":"FRO"},{"n":"Fiji","c":"FJI"},{"n":"Finland","c":"FIN"},{"n":"France","c":"FRA"},{"n":"French Guiana","c":"GUF"},{"n":"French Polynesia","c":"PYF"},{"n":"French Southern Territories","c":"ATF"},{"n":"Gabon","c":"GAB"},{"n":"Gambia","c":"GMB"},{"n":"Georgia","c":"GEO"},{"n":"Germany","c":"DEU"},{"n":"Ghana","c":"GHA"},{"n":"Gibraltar","c":"GIB"},{"n":"Greece","c":"GRC"},{"n":"Greenland","c":"GRL"},{"n":"Grenada","c":"GRD"},{"n":"Guadeloupe","c":"GLP"},{"n":"Guam","c":"GUM"},{"n":"Guatemala","c":"GTM"},{"n":"Guernsey","c":"GGY"},{"n":"Guinea","c":"GIN"},{"n":"Guinea-Bissau","c":"GNB"},{"n":"Guyana","c":"GUY"},{"n":"Haiti","c":"HTI"},{"n":"Heard Island and McDonald Islands","c":"HMD"},{"n":"Holy See","c":"VAT"},{"n":"Honduras","c":"HND"},{"n":"Hong Kong","c":"HKG"},{"n":"Hungary","c":"HUN"},{"n":"Iceland","c":"ISL"},{"n":"India","c":"IND"},{"n":"Indonesia","c":"IDN"},{"n":"Iran (Islamic Republic of)","c":"IRN"},{"n":"Iraq","c":"IRQ"},{"n":"Ireland","c":"IRL"},{"n":"Isle of Man","c":"IMN"},{"n":"Israel","c":"ISR"},{"n":"Italy","c":"ITA"},{"n":"Jamaica","c":"JAM"},{"n":"Japan","c":"JPN"},{"n":"Jersey","c":"JEY"},{"n":"Jordan","c":"JOR"},{"n":"Kazakhstan","c":"KAZ"},{"n":"Kenya","c":"KEN"},{"n":"Kiribati","c":"KIR"},{"n":"Korea (Democratic People's Republic of)","c":"PRK"},{"n":"Korea, Republic of","c":"KOR"},{"n":"Kuwait","c":"KWT"},{"n":"Kyrgyzstan","c":"KGZ"},{"n":"Lao People's Democratic Republic","c":"LAO"},{"n":"Latvia","c":"LVA"},{"n":"Lebanon","c":"LBN"},{"n":"Lesotho","c":"LSO"},{"n":"Liberia","c":"LBR"},{"n":"Libya","c":"LBY"},{"n":"Liechtenstein","c":"LIE"},{"n":"Lithuania","c":"LTU"},{"n":"Luxembourg","c":"LUX"},{"n":"Macao","c":"MAC"},{"n":"Madagascar","c":"MDG"},{"n":"Malawi","c":"MWI"},{"n":"Malaysia","c":"MYS"},{"n":"Maldives","c":"MDV"},{"n":"Mali","c":"MLI"},{"n":"Malta","c":"MLT"},{"n":"Marshall Islands","c":"MHL"},{"n":"Martinique","c":"MTQ"},{"n":"Mauritania","c":"MRT"},{"n":"Mauritius","c":"MUS"},{"n":"Mayotte","c":"MYT"},{"n":"Mexico","c":"MEX"},{"n":"Micronesia (Federated States of)","c":"FSM"},{"n":"Moldova, Republic of","c":"MDA"},{"n":"Monaco","c":"MCO"},{"n":"Mongolia","c":"MNG"},{"n":"Montenegro","c":"MNE"},{"n":"Montserrat","c":"MSR"},{"n":"Morocco","c":"MAR"},{"n":"Mozambique","c":"MOZ"},{"n":"Myanmar","c":"MMR"},{"n":"Namibia","c":"NAM"},{"n":"Nauru","c":"NRU"},{"n":"Nepal","c":"NPL"},{"n":"Netherlands","c":"NLD"},{"n":"New Caledonia","c":"NCL"},{"n":"New Zealand","c":"NZL"},{"n":"Nicaragua","c":"NIC"},{"n":"Niger","c":"NER"},{"n":"Nigeria","c":"NGA"},{"n":"Niue","c":"NIU"},{"n":"Norfolk Island","c":"NFK"},{"n":"North Macedonia","c":"MKD"},{"n":"Northern Mariana Islands","c":"MNP"},{"n":"Norway","c":"NOR"},{"n":"Oman","c":"OMN"},{"n":"Pakistan","c":"PAK"},{"n":"Palau","c":"PLW"},{"n":"Palestine, State of","c":"PSE"},{"n":"Panama","c":"PAN"},{"n":"Papua New Guinea","c":"PNG"},{"n":"Paraguay","c":"PRY"},{"n":"Peru","c":"PER"},{"n":"Philippines","c":"PHL"},{"n":"Pitcairn","c":"PCN"},{"n":"Poland","c":"POL"},{"n":"Portugal","c":"PRT"},{"n":"Puerto Rico","c":"PRI"},{"n":"Qatar","c":"QAT"},{"n":"Réunion","c":"REU"},{"n":"Romania","c":"ROU"},{"n":"Russian Federation","c":"RUS"},{"n":"Rwanda","c":"RWA"},{"n":"Saint Barthélemy","c":"BLM"},{"n":"Saint Helena, Ascension and Tristan da Cunha","c":"SHN"},{"n":"Saint Kitts and Nevis","c":"KNA"},{"n":"Saint Lucia","c":"LCA"},{"n":"Saint Martin (French part)","c":"MAF"},{"n":"Saint Pierre and Miquelon","c":"SPM"},{"n":"Saint Vincent and the Grenadines","c":"VCT"},{"n":"Samoa","c":"WSM"},{"n":"San Marino","c":"SMR"},{"n":"Sao Tome and Principe","c":"STP"},{"n":"Saudi Arabia","c":"SAU"},{"n":"Senegal","c":"SEN"},{"n":"Serbia","c":"SRB"},{"n":"Seychelles","c":"SYC"},{"n":"Sierra Leone","c":"SLE"},{"n":"Singapore","c":"SGP"},{"n":"Sint Maarten (Dutch part)","c":"SXM"},{"n":"Slovakia","c":"SVK"},{"n":"Slovenia","c":"SVN"},{"n":"Solomon Islands","c":"SLB"},{"n":"Somalia","c":"SOM"},{"n":"South Africa","c":"ZAF"},{"n":"South Georgia and the South Sandwich Islands","c":"SGS"},{"n":"South Sudan","c":"SSD"},{"n":"Spain","c":"ESP"},{"n":"Sri Lanka","c":"LKA"},{"n":"Sudan","c":"SDN"},{"n":"Surin","c":"SUR"},{"n":"Svalbard and Jan Mayen","c":"SJM"},{"n":"Sweden","c":"SWE"},{"n":"Switzerland","c":"CHE"},{"n":"Syrian Arab Republic","c":"SYR"},{"n":"Taiwan, Province of China","c":"TWN"},{"n":"Tajikistan","c":"TJK"},{"n":"Tanzania, United Republic of","c":"TZA"},{"n":"Thailand","c":"THA"},{"n":"Timor-Leste","c":"TLS"},{"n":"Togo","c":"TGO"},{"n":"Tokelau","c":"TKL"},{"n":"Tonga","c":"TON"},{"n":"Trinidad and Tobago","c":"TTO"},{"n":"Tunisia","c":"TUN"},{"n":"Turkey","c":"TUR"},{"n":"Turkmenistan","c":"TKM"},{"n":"Turks and Caicos Islands","c":"TCA"},{"n":"Tuvalu","c":"TUV"},{"n":"Uganda","c":"UGA"},{"n":"Ukraine","c":"UKR"},{"n":"United Arab Emirates","c":"ARE"},{"n":"United Kingdom of Great Britain and Northern Ireland","c":"GBR"},{"n":"United States of America","c":"USA"},{"n":"United States Minor Outlying Islands","c":"UMI"},{"n":"Uruguay","c":"URY"},{"n":"Uzbekistan","c":"UZB"},{"n":"Vanuatu","c":"VUT"},{"n":"Venezuela (Bolivarian Republic of)","c":"VEN"},{"n":"Viet Nam","c":"VNM"},{"n":"Virgin Islands (British)","c":"VGB"},{"n":"Virgin Islands (U.S.)","c":"VIR"},{"n":"Wallis and Futuna","c":"WLF"},{"n":"Western Sahara","c":"ESH"},{"n":"Yemen","c":"YEM"},{"n":"Zambia","c":"ZMB"},{"n":"Zimbabwe","c":"ZWE"}];
   
  subsBusiness: Subscription;

  //Filtered Countries
  filteredCountries$: Observable<Country[]>;

  //Save Data Business and Location
  businessSave$: Observable<object>;
  locationSave$: Observable<object>;
  imgBusiness$: Observable<any>;
  business$: Observable<any>;
  location$: Observable<any>;
  savingBusiness: boolean = false;
  savingLocation: boolean = false;
  displayBusiness: boolean = true;
  displayLocation: boolean = true;

  //Tags
  public tags =[];
  
  //Categories
  visibleCategory = true;
  selectableCategory = true;
  removableCategory = true;
  categories: Category[]=[];
  categories$: Observable<Category[]>;
  sectors$: Observable<any[]>;
  parentBus$: Observable<any[]>;
  filteredCategories$: Observable<Category[]>;
  allCategories: Category[]=[];
  @ViewChild('categoryInput') categoryInput: ElementRef<HTMLInputElement>;
  @ViewChild('autoCategory') matAutocomplete: MatAutocomplete;

  //Maps  API KEY colocarlo en app.modules  AIzaSyCyKdLcjPnI3n5Eb2VmMJk-sgan83LEsCM
  lat: number = 18.3796538;
  lng: number = -66.1989426;
  latLoc: any[] = [];
  lngLoc: any[] = [];
  zoom: number = 15;

  fileName: string= '';
  fileString: any;
  readonly imgPath = environment.bucket;

  cities = [];
  sectors = [];
  countryCode = '';

  //Doors
  noItemsLoc = 0;
  doors: any[] = [];
  selectable = true;
  removable = true;
  addOnBlur = true;
  
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  //Generic Option for ng5-slider
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
  //Business Operation Hours
  options: Options[] = [];
  options02: Options[] = [];
  newInterval: any[] = [];

  //Location Operation Hours
  optionsMonLoc: Options[]= [];
  optionsTueLoc: Options[]= [];
  optionsWedLoc: Options[]= [];
  optionsThuLoc: Options[]= [];
  optionsFriLoc: Options[]= [];
  optionsSatLoc: Options[]= [];
  optionsSunLoc: Options[]= [];

  optionsMonLoc02: Options[]=[];
  optionsTueLoc02: Options[]=[];
  optionsWedLoc02: Options[]=[];
  optionsThuLoc02: Options[]=[];
  optionsFriLoc02: Options[]=[];
  optionsSatLoc02: Options[]=[];
  optionsSunLoc02: Options[]=[];

  newIntervalLoc: any[][] = [];

  businessParent = [];

  get fBusiness(){
    return this.businessForm.controls;
  }

  get fLocations(){
    return this.locationForm.get('locations') as FormArray;
  }

  get fImage(){
    return this.imageForm.controls;
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
    LongDescription: ['', [Validators.required, Validators.maxLength(255), Validators.minLength(10)]],
    ShortDescription: ['', [Validators.required, Validators.maxLength(75), Validators.minLength(10)]],
    OperationHours: ['', [Validators.required]],
    Categories: ['', [Validators.required]],
    ParentBusiness: [''],
    Imagen: [''],
    Tags: [''],
    Status: [''],
    Mon: new FormControl([8, 17]),
    Mon02: new FormControl([8, 17]),
    MonEnabled: [0],
    Tue: new FormControl([8, 17]),
    Tue02: new FormControl([8, 17]),
    TueEnabled: [0],
    Wed: new FormControl([8, 17]),
    Wed02: new FormControl([8, 17]),
    WedEnabled: [0],
    Thu: new FormControl([8, 17]),
    Thu02: new FormControl([8, 17]),
    ThuEnabled: [0],
    Fri: new FormControl([8, 17]),
    Fri02: new FormControl([8, 17]),
    FriEnabled: [0],
    Sat: new FormControl([8, 12]),
    Sat02: new FormControl([8, 17]),
    SatEnabled: [0],
    Sun: new FormControl([8, 12]),
    Sun02: new FormControl([8, 17]),
    SunEnabled: [0]
  });

  imageForm = this.fb.group({
    Imagen: [null, Validators.required]
  });

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
      TotalPiesTransArea: ['',[Validators.required]],
      LocationDensity: ['',[Validators.required, Validators.min(1)]],
      MaxNumberEmployeesLocation: ['',[Validators.required, Validators.min(1)]],
      MaxConcurrentCustomerLocation:['',[Validators.required, Validators.min(1)]],
      BucketInterval: ['',[Validators.required, Validators.min(0.5), Validators.max(5)]],
      TotalCustPerBucketInter: ['',[Validators.required, Validators.min(1)]],
      Doors: ['',[Validators.required]],
      Status: [1],
      OperationHours: [''],
      Mon: new FormControl([8, 17]),
      Mon02: new FormControl([0, 0]),
      MonEnabled: [false],
      Tue: new FormControl([8, 17]),
      Tue02: new FormControl([0, 0]),
      TueEnabled: [false],
      Wed: new FormControl([8, 17]),
      Wed02: new FormControl([0, 0]),
      WedEnabled: [false],
      Thu: new FormControl([8, 17]),
      Thu02: new FormControl([0, 0]),
      ThuEnabled: [false],
      Fri: new FormControl([8, 17]),
      Fri02: new FormControl([0, 0]),
      FriEnabled: [false],
      Sat: new FormControl([8, 12]),
      Sat02: new FormControl([0, 0]),
      SatEnabled: [false],
      Sun: new FormControl([8, 12]),
      Sun02: new FormControl([0, 0]),
      SunEnabled: [false]
    });
    let gens
    gens = Object.assign({}, this.genOption, {disabled: 1});
    this.doors[this.noItemsLoc] = "";
    this.optionsMonLoc.push(gens);
    this.optionsTueLoc.push(gens);
    this.optionsWedLoc.push(gens);
    this.optionsThuLoc.push(gens);
    this.optionsFriLoc.push(gens);
    this.optionsSatLoc.push(gens);
    this.optionsSunLoc.push(gens);

    this.optionsMonLoc02.push(gens);
    this.optionsTueLoc02.push(gens);
    this.optionsWedLoc02.push(gens);
    this.optionsThuLoc02.push(gens);
    this.optionsFriLoc02.push(gens);
    this.optionsSatLoc02.push(gens);
    this.optionsSunLoc02.push(gens);

    this.newIntervalLoc.push([]);
    this.latLoc[this.noItemsLoc] = 18.3796538;
    this.lngLoc[this.noItemsLoc] = -66.1989426;

    this.sectors[this.noItemsLoc] = [];
    this.sectors[this.noItemsLoc].push({SectorId: "0", Name: "N/A"});
    
    this.newIntervalLoc[this.noItemsLoc].push("0","0","0","0","0","0","0");
    this.noItemsLoc = this.noItemsLoc+1;
    return items;
  }

  ngOnInit() {
    var spinnerRef = this.spinnerService.start("Loading Business...");
    this.businessId = this.authService.businessId();
    this.options[0] = Object.assign({}, this.genOption);
    this.options[1] = Object.assign({}, this.genOption);
    this.options[2] = Object.assign({}, this.genOption);
    this.options[3] = Object.assign({}, this.genOption);
    this.options[4] = Object.assign({}, this.genOption);
    this.options[5] = Object.assign({}, this.genOption);
    this.options[6] = Object.assign({}, this.genOption);

    this.options02[0] = Object.assign({}, this.genOption);
    this.options02[1] = Object.assign({}, this.genOption);
    this.options02[2] = Object.assign({}, this.genOption);
    this.options02[3] = Object.assign({}, this.genOption);
    this.options02[4] = Object.assign({}, this.genOption);
    this.options02[5] = Object.assign({}, this.genOption);
    this.options02[6] = Object.assign({}, this.genOption);

    this.newInterval[0] = "0";
    this.newInterval[1] = "0";
    this.newInterval[2] = "0";
    this.newInterval[3] = "0";
    this.newInterval[4] = "0";
    this.newInterval[5] = "0";
    this.newInterval[6] = "0";

    this.sectors[0] = [];
    this.sectors[0].push({SectorId: "0", Name: "N/A"});
    this.cities.push({CityId: "0", Name: "N/A"});

    this.onValueChanges();

    this.categories$ = this.categoryService.getCategories().pipe(
      map(res => {
        this.allCategories = res;
        this.filteredCategories$ = this.businessForm.get('Categories').valueChanges
          .pipe(
            startWith(null),
            map((category: Category | null) => category ? this._filterCategory(category) : this.allCategories.slice())
        );
        return this.allCategories;
      })
    ); 

    this.parentBus$ = this.businessService.getBusinessParent().pipe(
      map(res => {
        if (res != null){
          this.businessParent.push({BusinessId: "0", Name: "N/A"});
          this.businessParent.push(res[0]);
          return res;
        }
      })
    );

    this.filteredCountries$ = this.businessForm.get('Country').valueChanges
      .pipe(
        startWith(''),
        map(country => typeof country === 'string' ? country : country.n),
        map(country => country ? this._filterCountry(country) : this.countries.slice())
      );
    
    let item = 0;
    this.businessForm.reset({BusinessId: '', Name: '', Country: '', Address: '', City: '', ZipCode: '', Geolocation: '', Phone: '', WebSite: '', Facebook: '', Twitter: '', Instagram: '', Email: '', OperationHours: '', Tags: '', LongDescription: '', ShortDescription: '', Imagen: '', ParentBusiness: 0, Status: 1, Mon:[8,17], Mon02:[18,24], MonEnabled: 0, Tue:[8,17], Tue02:[18,24], TueEnabled: 0, Wed:[8,17], Wed02:[18,24], WedEnabled: 0, Thu:[8,17], Thu02:[18,24], ThuEnabled: 0, Fri:[8,17], Fri02:[18,24], FriEnabled: 0, Sat:[8,17], Sat02:[18,24], SatEnabled: 0, Sun:[8,17], Sun02:[18,24], SunEnabled: 0});
    this.business$ = this.businessService.getBusiness(this.businessId).pipe(
      tap((res: any) => {
        if (res != null){
          let countryValue : Country[];
          if (res.Country != '' && res.Country != undefined){
            countryValue = this.countries.filter(country => country.c.indexOf(res.Country) === 0);
          }
          var opeHour = JSON.parse(res.OperationHours);
          var locMap = JSON.parse(res.Geolocation);
          if ("LAT" in locMap) {
            this.lat = locMap['LAT'];
          } else {
            this.lat = 0;
          }
          if ("LNG" in locMap){
            this.lng = locMap['LNG'];
          } else {
            this.lng = 0;
          }
          this.countryCode = (countryValue != undefined ? countryValue[0].c : '')
          this.businessForm.setValue({
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
            LongDescription: res.LongDescription, 
            ShortDescription: res.ShortDescription,
            Imagen: res.Imagen,
            ParentBusiness: res.ParentBusiness,
            Tags: res.Tags,
            Status: res.Status,
            Mon: ("MON" in opeHour ? [+opeHour.MON[0].I, +opeHour.MON[0].F] : [8, 12]),
            Mon02: ("MON" in opeHour ? (opeHour.MON.length > 1 ? [+opeHour.MON[1].I, +opeHour.MON[1].F] : [0,0]) : [0, 0]),
            MonEnabled: ("MON" in opeHour ? 1 : 0),
            Tue: ("TUE" in opeHour ? [+opeHour.TUE[0].I, +opeHour.TUE[0].F] : [8, 12]),
            Tue02: ("TUE" in opeHour ? (opeHour.TUE.length > 1 ? [+opeHour.TUE[1].I, +opeHour.TUE[1].F] : [0,0]) : [0, 0]),
            TueEnabled: ("TUE" in opeHour ? 1 : 0),
            Wed: ("WED" in opeHour ? [+opeHour.WED[0].I, +opeHour.WED[0].F] : [8, 12]),
            Wed02: ("WED" in opeHour ? (opeHour.WED.length > 1 ? [+opeHour.WED[1].I, +opeHour.WED[1].F] : [0,0]) : [0, 0]),
            WedEnabled: ("WED" in opeHour ? 1 : 0),
            Thu: ("THU" in opeHour ? [+opeHour.THU[0].I, +opeHour.THU[0].F] : [8, 12]),
            Thu02: ("THU" in opeHour ? (opeHour.THU.length > 1 ? [+opeHour.THU[1].I, +opeHour.THU[1].F] : [0,0]) : [0, 0]),
            ThuEnabled: ("THU" in opeHour ? 1 : 0),
            Fri: ("FRI" in opeHour ? [+opeHour.FRI[0].I, +opeHour.FRI[0].F] : [8, 12]),
            Fri02: ("FRI" in opeHour ? (opeHour.FRI.length > 1 ? [+opeHour.FRI[1].I, +opeHour.FRI[1].F] : [0,0]) : [0, 0]),
            FriEnabled: ("FRI" in opeHour ? 1 : 0),
            Sat: ("SAT" in opeHour ? [+opeHour.SAT[0].I, +opeHour.SAT[0].F] : [8, 12]),
            Sat02: ("SAT" in opeHour ? (opeHour.SAT.length > 1 ? [+opeHour.SAT[1].I, +opeHour.SAT[1].F] : [0,0]) : [0, 0]),
            SatEnabled: ("SAT" in opeHour ? 1 : 0),
            Sun: ("SUN" in opeHour ? [+opeHour.SUN[0].I, +opeHour.SUN[0].F] : [8, 12]),
            Sun02: ("SUN" in opeHour ? (opeHour.SUN.length > 1 ? [+opeHour.SUN[1].I, +opeHour.TUE[1].F] : [0,0]) : [0, 0]),
            SunEnabled: ("SUN" in opeHour ? 1 : 0),
          });

          if (this.businessForm.value.Mon02[0] > 0){
            this.newInterval[0] = "1";
            let iniGenOption = {
              floor: 0,
              ceil: this.businessForm.value.Mon02[0]-1,
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
            let locGenOption = {
              floor: this.businessForm.value.Mon02[0],
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
            this.options[0] = Object.assign({}, iniGenOption, {disabled: ("MON" in opeHour ? 0 : 1)});
            this.options02[0] = Object.assign({}, locGenOption, {disabled: ("MON" in opeHour ? 0 : 1)});
          } else {
            this.options[0] = Object.assign({}, this.genOption, {disabled: ("MON" in opeHour ? 0 : 1)});
          }
          if (this.businessForm.value.Tue02[0] > 0){
            this.newInterval[1] = "1";
            let iniGenOption = {
              floor: 0,
              ceil: this.businessForm.value.Tue02[0]-1,
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
            let locGenOption = {
              floor: this.businessForm.value.Tue02[0],
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
            this.options[1] = Object.assign({}, iniGenOption, {disabled: ("TUE" in opeHour ? 0 : 1)});
            this.options02[1] = Object.assign({}, locGenOption, {disabled: ("TUE" in opeHour ? 0 : 1)});
          } else {
            this.options[1] = Object.assign({}, this.genOption, {disabled: ("TUE" in opeHour ? 0 : 1)});
          }
          if (this.businessForm.value.Wed02[0] > 0){
            this.newInterval[2] = "1";
            let iniGenOption = {
              floor: 0,
              ceil: this.businessForm.value.Wed02[0]-1,
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
            let locGenOption = {
              floor: this.businessForm.value.Wed02[0],
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
            this.options[2] = Object.assign({}, iniGenOption, {disabled: ("WED" in opeHour ? 0 : 1)});
            this.options02[2] = Object.assign({}, locGenOption, {disabled: ("WED" in opeHour ? 0 : 1)});
          } else {
            this.options[2] = Object.assign({}, this.genOption, {disabled: ("WED" in opeHour ? 0 : 1)});
          }
          if (this.businessForm.value.Thu02[0] > 0){
            this.newInterval[3] = "1";
            let iniGenOption = {
              floor: 0,
              ceil: this.businessForm.value.Thu02[0]-1,
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
            let locGenOption = {
              floor: this.businessForm.value.Thu02[0],
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
            this.options[3] = Object.assign({}, iniGenOption, {disabled: ("THU" in opeHour ? 0 : 1)});
            this.options02[3] = Object.assign({}, locGenOption, {disabled: ("THU" in opeHour ? 0 : 1)});
          } else {
            this.options[3] = Object.assign({}, this.genOption, {disabled: ("THU" in opeHour ? 0 : 1)});
          }
          if (this.businessForm.value.Fri02[0] > 0){
            this.newInterval[4] = "1";
            let iniGenOption = {
              floor: 0,
              ceil: this.businessForm.value.Fri02[0]-1,
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
            let locGenOption = {
              floor: this.businessForm.value.Fri02[0],
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
            this.options[4] = Object.assign({}, iniGenOption, {disabled: ("FRI" in opeHour ? 0 : 1)});
            this.options02[4] = Object.assign({}, locGenOption, {disabled: ("FRI" in opeHour ? 0 : 1)});
          } else {
            this.options[4] = Object.assign({}, this.genOption, {disabled: ("FRI" in opeHour ? 0 : 1)});
          }
          if (this.businessForm.value.Sat02[0] > 0){
            this.newInterval[5] = "1";
            let iniGenOption = {
              floor: 0,
              ceil: this.businessForm.value.Sat02[0]-1,
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
            let locGenOption = {
              floor: this.businessForm.value.Sat02[0],
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
            this.options[5] = Object.assign({}, iniGenOption, {disabled: ("SAT" in opeHour ? 0 : 1)});
            this.options02[5] = Object.assign({}, locGenOption, {disabled: ("SAT" in opeHour ? 0 : 1)});
          } else {
            this.options[5] = Object.assign({}, this.genOption, {disabled: ("SAT" in opeHour ? 0 : 1)});
          }
          if (this.businessForm.value.Sun02[0] > 0){
            this.newInterval[6] = "1";
            let iniGenOption = {
              floor: 0,
              ceil: this.businessForm.value.Sun02[0]-1,
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
            let locGenOption = {
              floor: this.businessForm.value.Sun02[0],
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
            this.options[6] = Object.assign({}, iniGenOption, {disabled: ("SUN" in opeHour ? 0 : 1)});
            this.options02[6] = Object.assign({}, locGenOption, {disabled: ("SUN" in opeHour ? 0 : 1)});
          } else {
            this.options[6] = Object.assign({}, this.genOption, {disabled: ("SUN" in opeHour ? 0 : 1)});
          }

          this.categories = res.Categories;
          this.tags = res.Tags.split(',');
          this.spinnerService.stop(spinnerRef);
        } else {
          this.spinnerService.stop(spinnerRef);
          this.businessForm.reset({BusinessId: '', Name: '', Country: '', Address: '', City: '', ZipCode: '', Geolocation: '', Phone: '', WebSite: '', Facebook: '', Twitter: '', Instagram: '', Email: '', OperationHours: '', LongDescription: '', ShortDescription: '', Imagen:'', Tags: '', ParentBusiness: 0, Status: 1, Mon:[8,17], Mon02:[18,24], MonEnabled: 0, Tue:[8,17], Tue02:[18,24], TueEnabled: 0, Wed:[8,17], Wed02:[18,24], WedEnabled: 0, Thu:[8,17], Thu02:[18,24], ThuEnabled: 0, Fri:[8,17], Fri02:[18,24], FriEnabled: 0, Sat:[8,17], Sat02:[18,24], SatEnabled: 0, Sun:[8,17], Sun02:[18,24], SunEnabled: 0});
        }
      }),
      switchMap(val => this.locationService.getCities(this.countryCode).pipe(
        map(res => {
          if (res != null){
            res.forEach(element => {
              this.cities.push(element);
            });  
            return res;
          }
        })
      )),
      switchMap(v => this.locationService.getLocations(this.businessId, this.countryCode).pipe(
        tap((res: any) => {
          if (res != null){
            this.locationForm.setControl('locations', this.setLocations(res.Locations));
            this.loadScheduleDays(this.locationForm.value.locations);
          }
          this.spinnerService.stop(spinnerRef);
          return v;
        })
      )),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        this.businessForm.reset({BusinessId: '', Name: '', Country: '', Address: '', City: '', ZipCode: '', Geolocation: '', Phone: '', WebSite: '', Facebook: '', Twitter: '', Instagram: '', Email: '', OperationHours: '', LongDescription: '', ShortDescription: '', Imagen:'', Tags: '', ParentBusiness: 0, Status: 1, Mon:[8,17], Mon02:[18,24], MonEnabled: 0, Tue:[8,17], Tue02:[18,24], TueEnabled: 0, Wed:[8,17], Wed02:[18,24], WedEnabled: 0, Thu:[8,17], Thu02:[18,24], ThuEnabled: 0, Fri:[8,17], Fri02:[18,24], FriEnabled: 0, Sat:[8,17], Sat02:[18,24], SatEnabled: 0, Sun:[8,17], Sun02:[18,24], SunEnabled: 0});
        this.openDialog('Error !', err.Message, false, true, false);
        return throwError(err || err.message);
      })
    );
  }

  setLocations(res: Observable<any[]>){
    const formArray = new FormArray([]);
    let index: number =0;
    res.forEach((s: any) => {
      var opeHour = JSON.parse(s.OperationHours);
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
      if (index > 0){
        let gens
        gens = Object.assign({}, this.genOption, {disabled: 1});
        this.doors[this.noItemsLoc] = "";
        this.optionsMonLoc.push(gens);
        this.optionsTueLoc.push(gens);
        this.optionsWedLoc.push(gens);
        this.optionsThuLoc.push(gens);
        this.optionsFriLoc.push(gens);
        this.optionsSatLoc.push(gens);
        this.optionsSunLoc.push(gens);

        this.optionsMonLoc02.push(gens);
        this.optionsTueLoc02.push(gens);
        this.optionsWedLoc02.push(gens);
        this.optionsThuLoc02.push(gens);
        this.optionsFriLoc02.push(gens);
        this.optionsSatLoc02.push(gens);
        this.optionsSunLoc02.push(gens);

        this.newIntervalLoc.push([]);
        this.latLoc[this.noItemsLoc] = 18.3796538;
        this.lngLoc[this.noItemsLoc] = -66.1989426;

        this.sectors[this.noItemsLoc] = [];

        this.newIntervalLoc[this.noItemsLoc].push("0","0","0","0","0","0","0");
        this.noItemsLoc = this.noItemsLoc+1;
      }
      
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
          TotalPiesTransArea: s.TotalPiesTransArea,
          LocationDensity: s.LocationDensity,
          City: s.City,
          Sector: s.Sector,
          MaxNumberEmployeesLocation: s.MaxNumberEmployeesLocation,
          MaxConcurrentCustomerLocation: s.MaxConcurrentCustomerLocation,
          BucketInterval: s.BucketInterval,
          TotalCustPerBucketInter: s.TotalCustPerBucketInter,
          OperationHours: s.OperationHours,
          Doors: '',
          Status: (s.Status == "1" ? true : false),
          Mon: new FormControl("MON" in opeHour ? [+opeHour.MON[0].I, +opeHour.MON[0].F] : [8, 12]),
          Mon02: new FormControl("MON" in opeHour ? (opeHour.MON.length > 1 ? [+opeHour.MON[1].I, +opeHour.MON[1].F] : [0,0]) : [0, 0]),
          MonEnabled: ("MON" in opeHour ? true : false),
          Tue: new FormControl("TUE" in opeHour ? [+opeHour.TUE[0].I, +opeHour.TUE[0].F] : [8, 12]),
          Tue02: new FormControl("TUE" in opeHour ? (opeHour.TUE.length > 1 ? [+opeHour.TUE[1].I, +opeHour.TUE[1].F] : [0,0]) : [0, 0]),
          TueEnabled: ("TUE" in opeHour ? true : false),
          Wed: new FormControl("WED" in opeHour ? [+opeHour.WED[0].I, +opeHour.WED[0].F] : [8, 12]),
          Wed02: new FormControl("WED" in opeHour ? (opeHour.WED.length > 1 ? [+opeHour.WED[1].I, +opeHour.WED[1].F] : [0,0]) : [0, 0]),
          WedEnabled: ("WED" in opeHour ? true : false),
          Thu: new FormControl("THU" in opeHour ? [+opeHour.THU[0].I, +opeHour.THU[0].F] : [8, 12]),
          Thu02: new FormControl("THU" in opeHour ? (opeHour.THU.length > 1 ? [+opeHour.THU[1].I, +opeHour.THU[1].F] : [0,0]) : [0, 0]),
          ThuEnabled: ("THU" in opeHour ? true : false),
          Fri: new FormControl("FRI" in opeHour ? [+opeHour.FRI[0].I, +opeHour.FRI[0].F] : [8, 12]),
          Fri02: new FormControl("FRI" in opeHour ? (opeHour.FRI.length > 1 ? [+opeHour.FRI[1].I, +opeHour.FRI[1].F] : [0,0]) : [0, 0]),
          FriEnabled: ("FRI" in opeHour ? true : false),
          Sat: new FormControl("SAT" in opeHour ? [+opeHour.SAT[0].I, +opeHour.SAT[0].F] : [8, 12]),
          Sat02: new FormControl("SAT" in opeHour ? (opeHour.SAT.length > 1 ? [+opeHour.SAT[1].I, +opeHour.SAT[1].F] : [0,0]) : [0, 0]),
          SatEnabled: ("SAT" in opeHour ? true : false),
          Sun: new FormControl("SUN" in opeHour ? [+opeHour.SUN[0].I, +opeHour.SUN[0].F] : [8, 12]),
          Sun02: new FormControl("SUN" in opeHour ? (opeHour.SUN.length > 1 ? [+opeHour.SUN[1].I, +opeHour.TUE[1].F] : [0,0]) : [0, 0]),
          SunEnabled: ("SUN" in opeHour ? true : false)
        })
      );
      this.doors[index] = s.Doors;
      index = index+1;
    });
    return formArray;
  }

  loadScheduleDays(res: any){
    let index = 0;
    res.forEach(s => {
      var opeHour = JSON.parse(s.OperationHours);
      //POSTERIOR A SETEAR DATOS 
      ("MON" in opeHour ? (opeHour.MON.length > 1 ? this.newIntervalLoc[index][0] = "1" : this.newIntervalLoc[index][0] = "0") : this.newIntervalLoc[index][0] = "0");
      ("TUE" in opeHour ? (opeHour.TUE.length > 1 ? this.newIntervalLoc[index][1] = "1" : this.newIntervalLoc[index][1] = "0") : this.newIntervalLoc[index][1] = "0");
      ("WED" in opeHour ? (opeHour.WED.length > 1 ? this.newIntervalLoc[index][2] = "1" : this.newIntervalLoc[index][2] = "0") : this.newIntervalLoc[index][2] = "0");
      ("THU" in opeHour ? (opeHour.THU.length > 1 ? this.newIntervalLoc[index][3] = "1" : this.newIntervalLoc[index][3] = "0") : this.newIntervalLoc[index][3] = "0");
      ("FRI" in opeHour ? (opeHour.FRI.length > 1 ? this.newIntervalLoc[index][4] = "1" : this.newIntervalLoc[index][4] = "0") : this.newIntervalLoc[index][4] = "0");
      ("SAT" in opeHour ? (opeHour.SAT.length > 1 ? this.newIntervalLoc[index][5] = "1" : this.newIntervalLoc[index][5] = "0") : this.newIntervalLoc[index][5] = "0");
      ("SUN" in opeHour ? (opeHour.SUN.length > 1 ? this.newIntervalLoc[index][6] = "1" : this.newIntervalLoc[index][6] = "0") : this.newIntervalLoc[index][6] = "0");

      if (s.Mon02[0] > 0){
        this.newIntervalLoc[index][0] = "1";
        let iniGenOption = {
          floor: 0,
          ceil: s.Mon02[0]-1,
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
        let locGenOption = {
          floor: s.Mon02[0],
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
        this.optionsMonLoc[index] = Object.assign({}, iniGenOption, {disabled: ("MON" in opeHour ? 0 : 1)});
        this.optionsMonLoc02[index] = Object.assign({}, locGenOption, {disabled: ("MON" in opeHour ? 0 : 1)});
      } else {
        this.optionsMonLoc[index] = Object.assign({}, this.genOption, {disabled: ("MON" in opeHour ? 0 : 1)});
      }
      if (s.Tue02[0] > 0){
        this.newIntervalLoc[index][1] = "1";
        let iniGenOption = {
          floor: 0,
          ceil: s.Tue02[0]-1,
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
        let locGenOption = {
          floor: s.Tue02[0],
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
        this.optionsTueLoc[index] = Object.assign({}, iniGenOption, {disabled: ("TUE" in opeHour ? 0 : 1)});
        this.optionsTueLoc02[index] = Object.assign({}, locGenOption, {disabled: ("TUE" in opeHour ? 0 : 1)});
      } else {
        this.optionsTueLoc[index] = Object.assign({}, this.genOption, {disabled: ("TUE" in opeHour ? 0 : 1)});
      }
      if (s.Wed02[0] > 0){
        this.newIntervalLoc[index][2] = "1";
        let iniGenOption = {
          floor: 0,
          ceil: s.Wed02[0]-1,
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
        let locGenOption = {
          floor: s.Wed02[0],
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
        this.optionsWedLoc[index] = Object.assign({}, iniGenOption, {disabled: ("WED" in opeHour ? 0 : 1)});
        this.optionsWedLoc02[index] = Object.assign({}, locGenOption, {disabled: ("WED" in opeHour ? 0 : 1)});
      } else {
        this.optionsWedLoc[index] = Object.assign({}, this.genOption, {disabled: ("WED" in opeHour ? 0 : 1)});
      }
      if (s.Thu02[0] > 0){
        this.newIntervalLoc[index][3] = "1";
        let iniGenOption = {
          floor: 0,
          ceil: s.Thu02[0]-1,
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
        let locGenOption = {
          floor: s.Thu02[0],
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
        this.optionsThuLoc[index] = Object.assign({}, iniGenOption, {disabled: ("THU" in opeHour ? 0 : 1)});
        this.optionsThuLoc02[index] = Object.assign({}, locGenOption, {disabled: ("THU" in opeHour ? 0 : 1)});
      } else {
        this.optionsThuLoc[index] = Object.assign({}, this.genOption, {disabled: ("THU" in opeHour ? 0 : 1)});
      }
      if (s.Fri02[0] > 0){
        this.newIntervalLoc[index][4] = "1";
        let iniGenOption = {
          floor: 0,
          ceil: s.Fri02[0]-1,
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
        let locGenOption = {
          floor: s.Fri02[0],
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
        this.optionsFriLoc[index] = Object.assign({}, iniGenOption, {disabled: ("FRI" in opeHour ? 0 : 1)});
        this.optionsFriLoc02[index] = Object.assign({}, locGenOption, {disabled: ("FRI" in opeHour ? 0 : 1)});
      } else {
        this.optionsFriLoc[index] = Object.assign({}, this.genOption, {disabled: ("FRI" in opeHour ? 0 : 1)});
      }
      if (s.Sat02[0] > 0){
        this.newIntervalLoc[index][5] = "1";
        let iniGenOption = {
          floor: 0,
          ceil: s.Sat02[0]-1,
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
        let locGenOption = {
          floor: s.Sat02[0],
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
        this.optionsSatLoc[index] = Object.assign({}, iniGenOption, {disabled: ("SAT" in opeHour ? 0 : 1)});
        this.optionsSatLoc02[index] = Object.assign({}, locGenOption, {disabled: ("SAT" in opeHour ? 0 : 1)});
      } else {
        this.optionsSatLoc[index] = Object.assign({}, this.genOption, {disabled: ("SAT" in opeHour ? 0 : 1)});
      }
      if (s.Sun02[0] > 0){
        this.newIntervalLoc[index][6] = "1";
        let iniGenOption = {
          floor: 0,
          ceil: s.Sun02[0]-1,
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
        let locGenOption = {
          floor: s.Sun02[0],
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
        this.optionsSunLoc[index] = Object.assign({}, iniGenOption, {disabled: ("SUN" in opeHour ? 0 : 1)});
        this.optionsSunLoc02[index] = Object.assign({}, locGenOption, {disabled: ("SUN" in opeHour ? 0 : 1)});
      } else {
        this.optionsSunLoc[index] = Object.assign({}, this.genOption, {disabled: ("SUN" in opeHour ? 0 : 1)});
      }
      index= index +1;
    });
  }

  loadSectorsInit(locs: Observable<any>){
    let index  = 0;
    this.sectors[index] = [];
    // console.log(locs);
    locs.forEach((s: any) => {
      this.locationService.getSectors(this.countryCode, s.City).pipe(
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

  onSearchImage(){
    const fileUpload = document.getElementById('fileUpload') as HTMLInputElement;
    fileUpload.onchange = () => {
      const file = fileUpload.files[0];
      if (file === undefined) {return;}
      this.fileName = file['name'];
      if (file['type'] != "image/png" && file['type'] != "image/jpg" && file['type'] != "image/jpeg") { 
        this.openDialog('User', 'File extension not allowed', false, true, false);
        return; 
      }
      
      const reader: FileReader = new FileReader();
      reader.onload = (event: Event) => {
        let dimX = 75;
        let dimY = 75;
        if (file['size'] > 60000){
          this.openDialog('User', 'File exced maximun allowed', false, true, false);
          return;
        }
        this.fileString = reader.result;
        this.onSubmitImage();
      }
      reader.readAsDataURL(fileUpload.files[0]);
    };
    fileUpload.click();
  }

  onSubmitImage(){
    const formData: FormData = new FormData();
    var spinnerRef = this.spinnerService.start("Loading Profile Image...");
    formData.append('Image', this.fileString);
    let type: string ='';
    if (this.fileString.toString().indexOf('data:image/') >= 0){
      type = this.fileString.toString().substring(11,15);
    }
    if (type === 'jpeg' || type === 'jpg;'){
      type = '.jpg';
    }
    if (type === 'png;'){
      type = '.png';
    }
    this.imgBusiness$ = this.businessService.uploadBusinessImg(this.businessId, formData).pipe(
      tap(response =>  {
          this.spinnerService.stop(spinnerRef);
          this.businessForm.patchValue({'Imagen': this.businessId+'/img/mobile/'+this.businessId+type});
          this.authService.setUserAvatar(this.businessId+'/img/mobile/'+this.businessId+type);
          this.imageForm.reset({'Imagen':null});
          this.fileString = null;
          this.openDialog('Business', 'Image uploaded successful', true, false, false);
        }
      ),
      catchError(err => { 
        this.spinnerService.stop(spinnerRef);
        this.openDialog('Error !', err.Message, false, true, false);
        return throwError(err || err.message);
      })
    );
  }

  onChangeDisabled(item: number, event: any){
    this.options[item] = Object.assign({}, this.genOption, {disabled: !event.checked});
    if (event.checked == false){
      this.newInterval[item] = "0";
    }
  }

  removeCategory(category: Category): void {
    const index = this.categories.findIndex(res => res.Name ===category.Name); 
    if (index >= 0) {
      this.categories.splice(index, 1);
    }
  }

  selectedCategory(event: MatAutocompleteSelectedEvent): void {
    this.categories.push({CategoryId: event.option.value, Name: event.option.viewValue});
    this.categoryInput.nativeElement.value = '';
    this.businessForm.get('Categories').setValue(this.categories);
  }

  private _filterCategory(value: Category): Category[] {
    const filterValue = value[0].CategoryId;
    return this.allCategories.filter(category => category.CategoryId.indexOf(filterValue) === 0);
  }

  displayFn(country?: Country): string | undefined {
    return country ? country.n : undefined;
  }

  private _filterCountry(value: string): Country[] {
    let filterValue: string = '';
    filterValue = value.toLowerCase();
    return this.countries.filter(country => country.n.toLowerCase().indexOf(filterValue) === 0);
  }

  onValueChanges(): void {
    this.subsBusiness = this.businessForm.valueChanges.subscribe(val=>{
      if (val.Country === null){
        this.businessForm.controls["Country"].setValue('');
      }
      if (val.MonEnabled === true) {
        this.businessForm.controls["MonEnabled"].setValue(1);
      }
      if (val.MonEnabled === false){
        this.businessForm.controls["MonEnabled"].setValue(0);
      }
      if (val.TueEnabled === true) {
        this.businessForm.controls["TueEnabled"].setValue(1);
      }
      if (val.TueEnabled === false){
        this.businessForm.controls["TueEnabled"].setValue(0);
      }
      if (val.WedEnabled === true) {
        this.businessForm.controls["WedEnabled"].setValue(1);
      }
      if (val.WedEnabled === false){
        this.businessForm.controls["WedEnabled"].setValue(0);
      }
      if (val.ThuEnabled === true) {
        this.businessForm.controls["ThuEnabled"].setValue(1);
      }
      if (val.ThuEnabled === false){
        this.businessForm.controls["ThuEnabled"].setValue(0);
      }
      if (val.FriEnabled === true) {
        this.businessForm.controls["FriEnabled"].setValue(1);
      }
      if (val.FriEnabled === false){
        this.businessForm.controls["FriEnabled"].setValue(0);
      }
      if (val.SatEnabled === true) {
        this.businessForm.controls["SatEnabled"].setValue(1);
      }
      if (val.SatEnabled === false){
        this.businessForm.controls["SatEnabled"].setValue(0);
      }
      if (val.SunEnabled === true) {
        this.businessForm.controls["SunEnabled"].setValue(1);
      }
      if (val.SunEnabled === false){
        this.businessForm.controls["SunEnabled"].setValue(0);
      }
    });
  }

  getErrorMessage(component: string, index: number=0) {
    if (component === 'Name'){
      return this.fBusiness.Name.hasError('required') ? 'You must enter a value' :
        this.fBusiness.Name.hasError('minlength') ? 'Minimun length 3' :
          this.fBusiness.Name.hasError('maxlength') ? 'Maximum length 500' :
            '';
    }
    if (component === 'Country'){
      return this.fBusiness.Country.hasError('required') ? 'You must select a valid value' :
        this.fBusiness.Country.hasError('validObject') ? 'Invalid value' :
          '';
    }
    if (component === 'Address'){
      return this.fBusiness.Address.hasError('required') ? 'You must enter a value' :
        this.fBusiness.Address.hasError('minlength') ? 'Minimun length 3' :
          this.fBusiness.Address.hasError('maxlength') ? 'Maximum length 500' :
            '';
    }
    if (component === 'LongDescription'){
      return this.fBusiness.LongDescription.hasError('required') ? 'You must enter a value' :
        this.fBusiness.LongDescription.hasError('minlength') ? 'Minimun length 10' :
          this.fBusiness.LongDescription.hasError('maxlength') ? 'Maximum length 255' :
            '';
    }
    if (component === 'ShortDescription'){
      return this.fBusiness.ShortDescription.hasError('required') ? 'You must enter a value' :
        this.fBusiness.ShortDescription.hasError('minlength') ? 'Minimun length 10' :
          this.fBusiness.ShortDescription.hasError('maxlength') ? 'Maximum length 100' :
            '';
    }
    if (component === 'City'){
      return this.fBusiness.State.hasError('required') ? 'You must enter a value' :
        this.fBusiness.State.hasError('maxlength') ? 'Maximun length 100' :
          this.fBusiness.State.hasError('minlength') ? 'Minimun length 2' :
          '';
    }
    if (component === 'ZipCode'){
      return this.fBusiness.ZipCode.hasError('maxlength') ? 'Maximun length 10' :
        this.fBusiness.ZipCode.hasError('minlength') ? 'Minimun length 3' :
        '';
    }
    if (component === 'Geolocation'){
      return this.fBusiness.House_No.hasError('maxlength') ? 'Maximun length 50' :
        this.fBusiness.House_No.hasError('minlength') ? 'Minimun length 5' :
        '';
    }
    if (component === 'Phone'){
      return this.fBusiness.Phone.hasError('maxlength') ? 'Maximun length 15' :
        this.fBusiness.Phone.hasError('minlength') ? 'Minimun length 3' :
        '';
    }
    if (component === 'Website'){
      return this.fBusiness.Phone.hasError('maxlength') ? 'Maximun length 150' :
        this.fBusiness.Phone.hasError('minlength') ? 'Minimun length 4' :
        '';
    }
    if (component === 'Facebook'){
      return this.fBusiness.Phone.hasError('maxlength') ? 'Maximun length 150' :
        this.fBusiness.Phone.hasError('minlength') ? 'Minimun length 4' :
        '';
    }
    if (component === 'Twitter'){
      return this.fBusiness.Phone.hasError('maxlength') ? 'Maximun length 150' :
        this.fBusiness.Phone.hasError('minlength') ? 'Minimun length 4' :
        '';
    }
    if (component === 'Instagram'){
      return this.fBusiness.Phone.hasError('maxlength') ? 'Maximun length 150' :
        this.fBusiness.Phone.hasError('minlength') ? 'Minimun length 4' :
        '';
    }
    if (component === 'Email'){
      return this.fBusiness.Email.hasError('required') ? 'You must enter a value' :
        this.fBusiness.Email.hasError('pattern') ? 'Email invalid' :
        '';
    }
    if (component === 'OperationHours'){
      return this.fBusiness.OperationHours.hasError('required') ? 'You must enter a value' :
        '';
    }
    if (component === 'Categories'){
      return this.fBusiness.OperationHours.hasError('required') ? 'You must enter a value' :
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
    if (component === 'TotalPiesTransArea'){
      let totalPiesTransArea = (<FormArray>this.locationForm.get('locations')).controls[index].get('TotalPiesTransArea');
      return totalPiesTransArea.hasError('required') ? 'You must enter a value':
        '';
    }
    if (component === 'LocationDensity'){
      let locationDensity = (<FormArray>this.locationForm.get('locations')).controls[index].get('LocationDensity');
      return locationDensity.hasError('required') ? 'You must enter a value' :
        locationDensity.hasError('min') ? 'Minimun value 2' :
          '';
    }
    if (component === 'MaxNumberEmployeesLocation'){
      let maxNumberEmployeesLocation = (<FormArray>this.locationForm.get('locations')).controls[index].get('MaxNumberEmployeesLocation');
      return maxNumberEmployeesLocation.hasError('required') ? 'You must enter a value' :
        maxNumberEmployeesLocation.hasError('min') ? 'Minimun value 1' :
          '';
    }
    if (component === 'MaxConcurrentCustomerLocation'){
      let maxConcurrentCustomerLocation = (<FormArray>this.locationForm.get('locations')).controls[index].get('MaxConcurrentCustomerLocation');
      return maxConcurrentCustomerLocation.hasError('required') ? 'You must enter a value':
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

  onAddInterval(dayNum: number){
    let maxValue;
    switch (dayNum) {
      case 0: maxValue = this.businessForm.value.Mon[1]; break;
      case 1: maxValue = this.businessForm.value.Tue[1]; break;
      case 2: maxValue = this.businessForm.value.Wed[1]; break;
      case 3: maxValue = this.businessForm.value.Thu[1]; break;
      case 4: maxValue = this.businessForm.value.Fri[1]; break;
      case 5: maxValue = this.businessForm.value.Sat[1]; break;
      case 6: maxValue = this.businessForm.value.Sun[1]; break;
    }
    if (maxValue < 23){
      this.newInterval[dayNum] = "1";
      let iniGenOption = {
        floor: 0,
        ceil: maxValue,
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
      let locGenOption = {
        floor: maxValue+1,
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
      this.options02[dayNum] = Object.assign({}, locGenOption, {disabled: 0});
      this.options[dayNum] = Object.assign({}, iniGenOption, {disabled: 0});
    }
  }

  onRemInterval(dayNum: number){
    this.newInterval[dayNum] = "0";
    let locGenOption = {
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
    this.options[dayNum] = Object.assign({}, locGenOption, {disabled: 0});
  }

  onSubmitBusiness(){
    if (!this.businessForm.valid){
      return;
    }
    console.log("entro business");
    // if (this.businessForm.touched){
    let countryId = this.businessForm.value.Country;
    let mon: any[] = [];
    let tue: any[] = [];
    let wed: any[] = [];
    let thu: any[] = [];
    let fri: any[] = [];
    let sat: any[] = [];
    let sun: any[] = [];

    let opeHours = {}
    if (this.businessForm.value.MonEnabled === 1) {
      mon.push({"I": this.businessForm.value.Mon[0].toString(), "F": this.businessForm.value.Mon[1].toString()});
      if (this.newInterval[0] == "1"){
        mon.push({"I": this.businessForm.value.Mon02[0].toString(), "F": this.businessForm.value.Mon02[1].toString()});
      }
      opeHours["MON"] = mon
    }
    if (this.businessForm.value.TueEnabled === 1) {
      tue.push({"I": this.businessForm.value.Tue[0].toString(), "F": this.businessForm.value.Tue[1].toString()});
      if (this.newInterval[1] == "1"){
        tue.push({"I": this.businessForm.value.Tue02[0].toString(), "F": this.businessForm.value.Tue02[1].toString()});
      }
      opeHours["TUE"] = tue
    }
    if (this.businessForm.value.WedEnabled === 1) {
      wed.push({"I": this.businessForm.value.Wed[0].toString(), "F": this.businessForm.value.Wed[1].toString()});
      if (this.newInterval[2] == "1"){
        wed.push({"I": this.businessForm.value.Wed02[0].toString(), "F": this.businessForm.value.Wed02[1].toString()});
      }
      opeHours["WED"] = wed
    }
    if (this.businessForm.value.ThuEnabled === 1) {
      thu.push({"I": this.businessForm.value.Thu[0].toString(), "F": this.businessForm.value.Thu[1].toString()});
      if (this.newInterval[3] == "1"){
        thu.push({"I": this.businessForm.value.Thu02[0].toString(), "F": this.businessForm.value.Thu02[1].toString()});
      }
      opeHours["THU"] = thu
    }
    if (this.businessForm.value.FriEnabled === 1) {
      fri.push({"I": this.businessForm.value.Fri[0].toString(), "F": this.businessForm.value.Fri[1].toString()});
      if (this.newInterval[4] == "1"){
        fri.push({"I": this.businessForm.value.Fri02[0].toString(), "F": this.businessForm.value.Fri02[1].toString()});
      }
      opeHours["FRI"] = fri
    }
    if (this.businessForm.value.SatEnabled === 1) {
      sat.push({"I": this.businessForm.value.Sat[0].toString(), "F": this.businessForm.value.Sat[1].toString()});
      if (this.newInterval[5] == "1"){
        sat.push({"I": this.businessForm.value.Sat02[0].toString(), "F": this.businessForm.value.Sat02[1].toString()});
      }
      opeHours["SAT"] = sat
    }
    if (this.businessForm.value.SunEnabled === 1) {
      sun.push({"I": this.businessForm.value.Sun[0].toString(), "F": this.businessForm.value.Sun[1].toString()});
      if (this.newInterval[6] == "1"){
        sun.push({"I": this.businessForm.value.Sun02[0].toString(), "F": this.businessForm.value.Sun02[1].toString()});
      }
      opeHours["SUN"] = sun
    }
    
    let dataForm =  { 
      "Name": this.businessForm.value.Name,
      "Country": countryId.c,
      "Address": this.businessForm.value.Address,
      "City": this.businessForm.value.City,
      "ZipCode": this.businessForm.value.ZipCode,
      "Geolocation": '{"LAT": '+ this.lat+',"LNG": '+this.lng+'}',
      "Phone": this.businessForm.value.Phone.replace('+1',''),
      "LongDescription": this.businessForm.value.LongDescription, 
      "ShortDescription": this.businessForm.value.ShortDescription,
      "Website": this.businessForm.value.WebSite,
      "Facebook": this.businessForm.value.Facebook,
      "Twitter": this.businessForm.value.Twitter,
      "Instagram": this.businessForm.value.Instagram,
      "Email": this.businessForm.value.Email,
      "OperationHours": JSON.stringify(opeHours),
      "Tags": this.tags.toString(),
      "Categories": this.businessForm.value.Categories,
      "ParentBusiness": (this.businessForm.value.ParentBusiness ? 1 : 0)
    }
    var spinnerRef = this.spinnerService.start("Saving Business...");
    this.businessSave$ = this.businessService.updateBusiness(this.businessId, dataForm).pipe(
      tap(res => { 
        this.spinnerService.stop(spinnerRef);
        this.savingBusiness = true;
        this.businessForm.markAsPristine();
        this.businessForm.markAsUntouched();
        this.openDialog('Business', 'Business updated successful', true, false, false);
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        this.savingBusiness = false;
        this.openDialog('Error !', err.Message, false, true, false);
        return throwError(err || err.message);
      })
    );
    // }
  }

  loadSectors(cityId: string, i: number){
    this.sectors$ = this.locationService.getSectors(this.countryCode, cityId).pipe(
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

  onChangeDisabledLoc(item: number, i: number, event: any){
    switch (item) {
      case 0:
        this.optionsMonLoc[i] = Object.assign({}, this.optionsMonLoc[i], {disabled: !event.checked});
        break;
      case 1:
        this.optionsTueLoc[i] = Object.assign({}, this.optionsTueLoc[i], {disabled: !event.checked});
        break;
      case 2:
        this.optionsWedLoc[i] = Object.assign({}, this.optionsWedLoc[i], {disabled: !event.checked});
        break;
      case 3:
        this.optionsThuLoc[i] = Object.assign({}, this.optionsThuLoc[i], {disabled: !event.checked});
        break;
      case 4:
        this.optionsFriLoc[i] = Object.assign({}, this.optionsFriLoc[i], {disabled: !event.checked});
        break;
      case 5:
        this.optionsSatLoc[i] = Object.assign({}, this.optionsSatLoc[i], {disabled: !event.checked});
        break;
      case 6:
        this.optionsSunLoc[i] = Object.assign({}, this.optionsSunLoc[i], {disabled: !event.checked});
        break;
    }
    if (event.checked == false){
      this.newIntervalLoc[i][item] = "0";
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

  onAddIntervalLoc(dayNum: number, index: number){
    let maxValue;
    let loca =  this.locationForm.get('locations') as FormArray;

    switch (dayNum) {
      case 0: maxValue = loca.at(index).value.Mon[1]; break;
      case 1: maxValue = loca.at(index).value.Tue[1]; break;
      case 2: maxValue = loca.at(index).value.Wed[1]; break;
      case 3: maxValue = loca.at(index).value.Thu[1]; break;
      case 4: maxValue = loca.at(index).value.Fri[1]; break;
      case 5: maxValue = loca.at(index).value.Sat[1]; break;
      case 6: maxValue = loca.at(index).value.Sun[1]; break;
    }

    if (maxValue < 23){
      this.newIntervalLoc[index][dayNum] = "1";
      let iniGenOption = {
        floor: 0,
        ceil: maxValue,
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
      let locGenOption = {
        floor: maxValue+1,
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
      switch (dayNum){
        case 0: 
          this.optionsMonLoc[index] = Object.assign({}, iniGenOption, {disabled: 0});
          this.optionsMonLoc02[index] = Object.assign({}, locGenOption, {disabled: 0});
          break;
        case 1: 
          this.optionsTueLoc[index] = Object.assign({}, iniGenOption, {disabled: 0});
          this.optionsTueLoc02[index] = Object.assign({}, locGenOption, {disabled: 0});
          break;
        case 2: 
          this.optionsWedLoc[index] = Object.assign({}, iniGenOption, {disabled: 0});
          this.optionsWedLoc02[index] = Object.assign({}, locGenOption, {disabled: 0});
          break;
        case 3: 
          this.optionsThuLoc[index] = Object.assign({}, iniGenOption, {disabled: 0});
          this.optionsThuLoc02[index] = Object.assign({}, locGenOption, {disabled: 0});
          break;
        case 4: 
          this.optionsFriLoc[index] = Object.assign({}, iniGenOption, {disabled: 0});
          this.optionsFriLoc02[index] = Object.assign({}, locGenOption, {disabled: 0});
          break;
        case 5: 
          this.optionsSatLoc[index] = Object.assign({}, iniGenOption, {disabled: 0});
          this.optionsSatLoc02[index] = Object.assign({}, locGenOption, {disabled: 0});
          break;
        case 6: 
          this.optionsSunLoc[index] = Object.assign({}, iniGenOption, {disabled: 0});
          this.optionsSunLoc02[index] = Object.assign({}, locGenOption, {disabled: 0});
          break;
      }
    }
  }

  onRemIntervalLoc(dayNum: number, index: number){
    this.newIntervalLoc[index][dayNum] = "0";
    let locGenOption = {
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
    switch (dayNum){
      case 0: this.optionsMonLoc[index] = Object.assign({}, locGenOption, {disabled: 0}); break;
      case 1: this.optionsTueLoc[index] = Object.assign({}, locGenOption, {disabled: 0}); break;
      case 2: this.optionsWedLoc[index] = Object.assign({}, locGenOption, {disabled: 0}); break;
      case 3: this.optionsThuLoc[index] = Object.assign({}, locGenOption, {disabled: 0}); break;
      case 4: this.optionsFriLoc[index] = Object.assign({}, locGenOption, {disabled: 0}); break;
      case 5: this.optionsSatLoc[index] = Object.assign({}, locGenOption, {disabled: 0}); break;
      case 6: this.optionsSunLoc[index] = Object.assign({}, locGenOption, {disabled: 0}); break;
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
        let mon: any[] = [];
        let tue: any[] = [];
        let wed: any[] = [];
        let thu: any[] = [];
        let fri: any[] = [];
        let sat: any[] = [];
        let sun: any[] = [];

        let opeHours = {}
        let item = loca.at(i);
        if (item.value.MonEnabled == true){
          mon.push({"I": item.value.Mon[0].toString(), "F": item.value.Mon[1].toString()});
          if (this.newIntervalLoc[i][0] == "1"){
            mon.push({"I": item.value.Mon02[0].toString(), "F": item.value.Mon02[1].toString()});
          }
          opeHours["MON"] = mon;
        }
        if (item.value.TueEnabled == true){
          tue.push({"I": item.value.Tue[0].toString(), "F": item.value.Tue[1].toString()});
          if (this.newIntervalLoc[i][1] == "1"){
            tue.push({"I": item.value.Tue02[0].toString(), "F": item.value.Tue02[1].toString()});
          }
          opeHours["TUE"] = tue;
        }
        if (item.value.WedEnabled == true){
          wed.push({"I": item.value.Wed[0].toString(), "F": item.value.Wed[1].toString()});
          if (this.newIntervalLoc[i][2] == "1"){
            wed.push({"I": item.value.Wed02[0].toString(), "F": item.value.Wed02[1].toString()});
          }
          opeHours["WED"] = wed;
        }
        if (item.value.ThuEnabled == true){
          thu.push({"I": item.value.Thu[0].toString(), "F": item.value.Thu[1].toString()});
          if (this.newIntervalLoc[i][3] == "1"){
            thu.push({"I": item.value.Thu02[0].toString(), "F": item.value.Thu02[1].toString()});
          }
          opeHours["THU"] = thu;
        }
        if (item.value.FriEnabled == true){
          fri.push({"I": item.value.Fri[0].toString(), "F": item.value.Fri[1].toString()});
          if (this.newIntervalLoc[i][4] == "1"){
            fri.push({"I": item.value.Fri02[0].toString(), "F": item.value.Fri02[1].toString()});
          }
          opeHours["FRI"] = fri;
        }
        if (item.value.SatEnabled == true){
          sat.push({"I": item.value.Sat[0].toString(), "F": item.value.Sat[1].toString()});
          if (this.newIntervalLoc[i][5] == "1"){
            sat.push({"I": item.value.Sat02[0].toString(), "F": item.value.Sat02[1].toString()});
          }
          opeHours["SAT"] = sat;
        }
        if (item.value.SunEnabled == true){
          sun.push({"I": item.value.Sun[0].toString(), "F": item.value.Sun[1].toString()});
          if (this.newIntervalLoc[i][6] == "1"){
            sun.push({"I": item.value.Sun02[0].toString(), "F": item.value.Sun02[1].toString()});
          }
          opeHours["SUN"] = sun;
        }
        let location = {
          LocationId: item.value.LocationId,
          Name: item.value.Name,
          Address: item.value.Address,
          City: item.value.City,
          Sector: item.value.Sector,
          Geolocation: '{"LAT": '+ this.latLoc[i]+',"LNG": '+this.lngLoc[i]+'}',
          ParentLocation: item.value.ParentLocation,
          TotalPiesTransArea: item.value.TotalPiesTransArea,
          LocationDensity: item.value.LocationDensity,
          MaxNumberEmployeesLocation: item.value.MaxNumberEmployeesLocation,
          MaxConcurrentCustomerLocation: item.value.MaxConcurrentCustomerLocation,
          BucketInterval: item.value.BucketInterval,
          TotalCustPerBucketInter: item.value.TotalCustPerBucketInter,
          Status: (item.value.Status == true ? 1: 0),
          Doors: this.doors[i].toString(),
          OperationHours: JSON.stringify(opeHours)
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

  ngOnDestroy() {
    if (this.subsBusiness){
      this.subsBusiness.unsubscribe();
    }
  }

}
