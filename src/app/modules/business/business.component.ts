import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '@core/services';
import { Country, Category } from '@app/_models';
import { Observable, Subscription, throwError } from 'rxjs';
import { startWith, map, shareReplay, catchError, tap } from 'rxjs/operators';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from '@app/shared/dialog/dialog.component';
import { BusinessService, LocationService, CategoryService } from '@app/services/index';
import { ConfirmValidParentMatcher } from '@app/validators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { SpinnerService } from '@app/shared/spinner.service';
import { environment } from '@environments/environment';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';

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
  imgBusiness$: Observable<any>;
  business$: Observable<any>;
  savingBusiness: boolean = false;
  displayBusiness: boolean = true;

  //Tags
  public tags =[];
  
  language: string = 'EN';

  //Categories
  visibleCategory = true;
  selectableCategory = true;
  removableCategory = true;
  categories: Category[]=[];
  categories$: Observable<Category[]>;
  sectors$: Observable<any[]>;
  filteredCategories$: Observable<Category[]>;
  allCategories: Category[]=[];
  @ViewChild('categoryInput') categoryInput: ElementRef<HTMLInputElement>;
  @ViewChild('autoCategory') matAutocomplete: MatAutocomplete;

  lat: number = 18.3796538;
  lng: number = -66.1989426;
  latLoc: any[] = [];
  lngLoc: any[] = [];
  zoom: number = 15;

  fileName: string= '';
  fileString: any;
  readonly imgPath = environment.bucket;

  fileNameLink: string = '';
  fileStringLink: any;

  cities = [];
  sectors = [];
  countryCode = '';

  selectable = true;
  removable = true;
  addOnBlur = true;

  existLink = false;
  linkValidated: boolean = false;
  availability$: Observable<any>;
  loadingBusiness: boolean = false;
  
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  get fBusiness(){
    return this.businessForm.controls;
  }
  
  get fImage(){
    return this.imageForm.controls;
  }

  get fImageLink(){
    return this.imageFormLink.controls;
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
    TuCitaLink: ['', [Validators.required, Validators.maxLength(50), Validators.minLength(2)]],
    Categories: ['', [Validators.required]],
    ParentBusiness: [''],
    Imagen: [''],
    ImagenLink:[''],
    Tags: [''],
    Status: ['']
  });

  imageForm = this.fb.group({
    Imagen: [null, Validators.required]
  });

  imageFormLink = this.fb.group({
    Imagen_Link: [null, Validators.required]
  })

  ngOnInit() {
    var spinnerRef = this.spinnerService.start("Loading Business...");
    this.businessId = this.authService.businessId();

    this.sectors[0] = [];
    this.sectors[0].push({SectorId: "0", Name: "N/A"});
    this.cities.push({CityId: "0", Name: "N/A"});

    this.onValueChanges();

    this.categories$ = this.categoryService.getCategories(this.language).pipe(
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

    this.filteredCountries$ = this.businessForm.get('Country').valueChanges
      .pipe(
        startWith(''),
        map(country => typeof country === 'string' ? country : country.n),
        map(country => country ? this._filterCountry(country) : this.countries.slice())
      );
    
    let item = 0;
    this.businessForm.reset({BusinessId: '', Name: '', Country: '', Address: '', City: '', ZipCode: '', Geolocation: '', Phone: '', WebSite: '', Facebook: '', Twitter: '', Instagram: '', Email: '', Tags: '', LongDescription: '', ShortDescription: '', TuCitaLink: '', Imagen: '', ParentBusiness: 0, Status: 1});
    this.business$ = this.businessService.getBusiness(this.businessId).pipe(
      tap((res: any) => {
        if (res != null){
          let countryValue : Country[];
          if (res.Country != '' && res.Country != undefined){
            countryValue = this.countries.filter(country => country.c.indexOf(res.Country) === 0);
          }
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
          this.countryCode = (countryValue != undefined ? countryValue[0].c : '');
          if (res.TuCitaLink != ''){
            this.existLink = true;
          }
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
            Categories: res.Categories,
            LongDescription: res.LongDescription, 
            ShortDescription: res.ShortDescription,
            TuCitaLink: res.TuCitaLink,
            Imagen: res.Imagen,
            ImagenLink: res.ImagenLink,
            ParentBusiness: res.ParentBusiness,
            Tags: res.Tags,
            Status: res.Status
          });

          this.categories = res.Categories;
          this.tags = (res.Tags != '' ? res.Tags.split(',') : []);
          this.spinnerService.stop(spinnerRef);
        } else {
          this.spinnerService.stop(spinnerRef);
          this.businessForm.reset({BusinessId: '', Name: '', Country: '', Address: '', City: '', ZipCode: '', Geolocation: '', Phone: '', WebSite: '', Facebook: '', Twitter: '', Instagram: '', Email: '', LongDescription: '', ShortDescription: '', TuCitaLink: '', Imagen:'', Tags: '', ParentBusiness: 0, Status: 1});
        }
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        this.businessForm.reset({BusinessId: '', Name: '', Country: '', Address: '', City: '', ZipCode: '', Geolocation: '', Phone: '', WebSite: '', Facebook: '', Twitter: '', Instagram: '', Email: '', LongDescription: '', ShortDescription: '', TuCitaLink: '', Imagen:'', Tags: '', ParentBusiness: 0, Status: 1});
        this.openDialog('Error !', err.Message, false, true, false);
        return throwError(err || err.message);
      })
    );
  }

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

  onSearchImage(){
    const fileUpload = document.getElementById('fileUpload') as HTMLInputElement;
    fileUpload.onchange = () => {
      const file = fileUpload.files[0];
      if (file === undefined) {return;}
      this.fileName = file['name'];
      if (file['type'] != "image/png" && file['type'] != "image/jpg" && file['type'] != "image/jpeg") { 
        this.openDialog('Business', 'File extension not allowed', false, true, false);
        return; 
      }
      
      const reader: FileReader = new FileReader();
      reader.onload = (event: Event) => {
        let dimX = 75;
        let dimY = 75;
        if (file['size'] > 60000){
          this.openDialog('Business', 'File exced maximun allowed', false, true, false);
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
    var spinnerRef = this.spinnerService.start("Loading Monile App Image...");
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
          // this.authService.setUserAvatar(this.businessId+'/img/mobile/'+this.businessId+type);
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

  onSearchImageLink(){
    const fileUpload = document.getElementById('fileUploadLink') as HTMLInputElement;
    fileUpload.onchange = () => {
      const file = fileUpload.files[0];
      if (file === undefined) {return;}
      this.fileNameLink = file['name'];
      if (file['type'] != "image/png" && file['type'] != "image/jpg" && file['type'] != "image/jpeg") { 
        this.openDialog('Business', 'File extension not allowed', false, true, false);
        return; 
      }
      
      const reader: FileReader = new FileReader();
      reader.onload = (event: Event) => {
        let dimX = 75;
        let dimY = 75;
        if (file['size'] > 900000){
          this.openDialog('Business', 'File exced maximun allowed', false, true, false);
          return;
        }
        this.fileStringLink = reader.result;
        this.onSubmitImageLink();
      }
      reader.readAsDataURL(fileUpload.files[0]);
    };
    fileUpload.click();
  }

  onSubmitImageLink(){
    const formData: FormData = new FormData();
    var spinnerRef = this.spinnerService.start("Loading Web Link Image...");
    formData.append('Image', this.fileStringLink);
    let type: string ='';
    if (this.fileStringLink.toString().indexOf('data:image/') >= 0){
      type = this.fileStringLink.toString().substring(11,15);
    }
    if (type === 'jpeg' || type === 'jpg;'){
      type = '.jpg';
    }
    if (type === 'png;'){
      type = '.png';
    }
    this.imgBusiness$ = this.businessService.uploadBusinessImgLink(this.businessId, formData).pipe(
      tap(response =>  {
          this.spinnerService.stop(spinnerRef);
          this.businessForm.patchValue({'ImagenLink': this.businessId+'/img/link/'+this.businessId+type});
          this.imageFormLink.reset({'Imagen_Link':null});
          this.fileStringLink = null;
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
    if (component === 'TuCitaLink'){
      return this.fBusiness.TuCitaLink.hasError('required') ? 'You must enter a value' :
        this.fBusiness.TuCitaLink.hasError('minlength') ? 'Minimun length 2' :
          this.fBusiness.TuCitaLink.hasError('maxlength') ? 'Maximum length 50' :
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
    if (component === 'Categories'){
      return this.fBusiness.OperationHours.hasError('required') ? 'You must enter a value' :
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

  onSubmitBusiness(){
    if (!this.businessForm.valid){
      return;
    }
    // if (this.businessForm.touched){
    let countryId = this.businessForm.value.Country;
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
      "TuCitaLink": (this.existLink ? '' : this.businessForm.value.TuCitaLink),
      "Website": this.businessForm.value.WebSite,
      "Facebook": this.businessForm.value.Facebook,
      "Twitter": this.businessForm.value.Twitter,
      "Instagram": this.businessForm.value.Instagram,
      "Email": this.businessForm.value.Email,
      "Tags": this.tags.toString(),
      "Categories": this.businessForm.value.Categories,
      "ParentBusiness": (this.businessForm.value.ParentBusiness ? 1 : 0)
    }
    var spinnerRef = this.spinnerService.start("Saving Business...");
    this.businessSave$ = this.businessService.updateBusiness(this.businessId, dataForm).pipe(
      tap(res => { 
        this.spinnerService.stop(spinnerRef);
        this.savingBusiness = true;
        this.linkValidated = false;
        this.businessForm.controls.TuCitaLink.enable();
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

  removeTag(tag: string){
    var data = this.tags.findIndex(e => e === tag);
    this.tags.splice(data, 1);
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
