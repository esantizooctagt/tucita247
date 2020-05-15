import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { AuthService } from '@core/services';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Country, Location, Business } from '@app/_models';
import { Observable, Subscription, throwError } from 'rxjs';
import { startWith, map, shareReplay, catchError, tap, finalize } from 'rxjs/operators';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from '@app/shared/dialog/dialog.component';
import { BusinessService, LocationService } from '@app/services/index';
import { ConfirmValidParentMatcher } from '@app/validators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { SpinnerService } from '@app/shared/spinner.service';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-business',
  templateUrl: './business.component.html',
  styleUrls: ['./business.component.scss']
})
export class BusinessComponent implements OnInit {
  companyId: string='';
  countries: Country[]=environment.countries; //[{"n":"Afghanistan","c":"AFA"},{"n":"Åland Islands","c":"ALA"},{"n":"Albania","c":"ALB"},{"n":"Algeria","c":"DZA"},{"n":"American Samoa","c":"ASM"},{"n":"Andorra","c":"AND"},{"n":"Angola","c":"AGO"},{"n":"Anguilla","c":"AIA"},{"n":"Antarctica","c":"ATA"},{"n":"Antigua and Barbuda","c":"ATG"},{"n":"Argentina","c":"ARG"},{"n":"Armenia","c":"ARM"},{"n":"Aruba","c":"ABW"},{"n":"Australia","c":"AUS"},{"n":"Austria","c":"AUT"},{"n":"Azerbaijan","c":"AZE"},{"n":"Bahamas","c":"BHS"},{"n":"Bahrain","c":"BHR"},{"n":"Bangladesh","c":"BGD"},{"n":"Barbados","c":"BRB"},{"n":"Belarus","c":"BLR"},{"n":"Belgium","c":"BEL"},{"n":"Belize","c":"BLZ"},{"n":"Benin","c":"BEN"},{"n":"Bermuda","c":"BMU"},{"n":"Bhutan","c":"BTN"},{"n":"Bolivia (Plurinational State of)","c":"BOL"},{"n":"Bonaire, Sint Eustatius and Saba","c":"BES"},{"n":"Bosnia and Herzegovina","c":"BIH"},{"n":"Botswana","c":"BWA"},{"n":"Bouvet Island","c":"BVT"},{"n":"Brazil","c":"BRA"},{"n":"British Indian Ocean Territory","c":"IOT"},{"n":"Brunei Darussalam","c":"BRN"},{"n":"Bulgaria","c":"BGR"},{"n":"Burkina Faso","c":"BFA"},{"n":"Burundi","c":"BDI"},{"n":"Cabo Verde","c":"CPV"},{"n":"Cambodia","c":"KHM"},{"n":"Cameroon","c":"CMR"},{"n":"Canada","c":"CAN"},{"n":"Cayman Islands","c":"CYM"},{"n":"Central African Republic","c":"CAF"},{"n":"Chad","c":"TCD"},{"n":"Chile","c":"CHL"},{"n":"China","c":"CHN"},{"n":"Christmas Island","c":"CXR"},{"n":"Cocos (Keeling) Islands","c":"CCK"},{"n":"Colombia","c":"COL"},{"n":"Comoros","c":"COM"},{"n":"Congo","c":"COG"},{"n":"Congo, Democratic Republic of the","c":"COD"},{"n":"Cook Islands","c":"COK"},{"n":"Costa Rica","c":"CRI"},{"n":"Côte d'Ivoire","c":"CIV"},{"n":"Croatia","c":"HRV"},{"n":"Cuba","c":"CUB"},{"n":"Curaçao","c":"CUW"},{"n":"Cyprus","c":"CYP"},{"n":"Czechia","c":"CZE"},{"n":"Denmark","c":"DNK"},{"n":"Djibouti","c":"DJI"},{"n":"Dominica","c":"DMA"},{"n":"Dominican Republic","c":"DOM"},{"n":"Ecuador","c":"ECU"},{"n":"Egypt","c":"EGY"},{"n":"El Salvador","c":"SLV"},{"n":"Equatorial Guinea","c":"GNQ"},{"n":"Eritrea","c":"ERI"},{"n":"Estonia","c":"EST"},{"n":"Eswatini","c":"SWZ"},{"n":"Ethiopia","c":"ETH"},{"n":"Falkland Islands (Malvinas)","c":"FLK"},{"n":"Faroe Islands","c":"FRO"},{"n":"Fiji","c":"FJI"},{"n":"Finland","c":"FIN"},{"n":"France","c":"FRA"},{"n":"French Guiana","c":"GUF"},{"n":"French Polynesia","c":"PYF"},{"n":"French Southern Territories","c":"ATF"},{"n":"Gabon","c":"GAB"},{"n":"Gambia","c":"GMB"},{"n":"Georgia","c":"GEO"},{"n":"Germany","c":"DEU"},{"n":"Ghana","c":"GHA"},{"n":"Gibraltar","c":"GIB"},{"n":"Greece","c":"GRC"},{"n":"Greenland","c":"GRL"},{"n":"Grenada","c":"GRD"},{"n":"Guadeloupe","c":"GLP"},{"n":"Guam","c":"GUM"},{"n":"Guatemala","c":"GTM"},{"n":"Guernsey","c":"GGY"},{"n":"Guinea","c":"GIN"},{"n":"Guinea-Bissau","c":"GNB"},{"n":"Guyana","c":"GUY"},{"n":"Haiti","c":"HTI"},{"n":"Heard Island and McDonald Islands","c":"HMD"},{"n":"Holy See","c":"VAT"},{"n":"Honduras","c":"HND"},{"n":"Hong Kong","c":"HKG"},{"n":"Hungary","c":"HUN"},{"n":"Iceland","c":"ISL"},{"n":"India","c":"IND"},{"n":"Indonesia","c":"IDN"},{"n":"Iran (Islamic Republic of)","c":"IRN"},{"n":"Iraq","c":"IRQ"},{"n":"Ireland","c":"IRL"},{"n":"Isle of Man","c":"IMN"},{"n":"Israel","c":"ISR"},{"n":"Italy","c":"ITA"},{"n":"Jamaica","c":"JAM"},{"n":"Japan","c":"JPN"},{"n":"Jersey","c":"JEY"},{"n":"Jordan","c":"JOR"},{"n":"Kazakhstan","c":"KAZ"},{"n":"Kenya","c":"KEN"},{"n":"Kiribati","c":"KIR"},{"n":"Korea (Democratic People's Republic of)","c":"PRK"},{"n":"Korea, Republic of","c":"KOR"},{"n":"Kuwait","c":"KWT"},{"n":"Kyrgyzstan","c":"KGZ"},{"n":"Lao People's Democratic Republic","c":"LAO"},{"n":"Latvia","c":"LVA"},{"n":"Lebanon","c":"LBN"},{"n":"Lesotho","c":"LSO"},{"n":"Liberia","c":"LBR"},{"n":"Libya","c":"LBY"},{"n":"Liechtenstein","c":"LIE"},{"n":"Lithuania","c":"LTU"},{"n":"Luxembourg","c":"LUX"},{"n":"Macao","c":"MAC"},{"n":"Madagascar","c":"MDG"},{"n":"Malawi","c":"MWI"},{"n":"Malaysia","c":"MYS"},{"n":"Maldives","c":"MDV"},{"n":"Mali","c":"MLI"},{"n":"Malta","c":"MLT"},{"n":"Marshall Islands","c":"MHL"},{"n":"Martinique","c":"MTQ"},{"n":"Mauritania","c":"MRT"},{"n":"Mauritius","c":"MUS"},{"n":"Mayotte","c":"MYT"},{"n":"Mexico","c":"MEX"},{"n":"Micronesia (Federated States of)","c":"FSM"},{"n":"Moldova, Republic of","c":"MDA"},{"n":"Monaco","c":"MCO"},{"n":"Mongolia","c":"MNG"},{"n":"Montenegro","c":"MNE"},{"n":"Montserrat","c":"MSR"},{"n":"Morocco","c":"MAR"},{"n":"Mozambique","c":"MOZ"},{"n":"Myanmar","c":"MMR"},{"n":"Namibia","c":"NAM"},{"n":"Nauru","c":"NRU"},{"n":"Nepal","c":"NPL"},{"n":"Netherlands","c":"NLD"},{"n":"New Caledonia","c":"NCL"},{"n":"New Zealand","c":"NZL"},{"n":"Nicaragua","c":"NIC"},{"n":"Niger","c":"NER"},{"n":"Nigeria","c":"NGA"},{"n":"Niue","c":"NIU"},{"n":"Norfolk Island","c":"NFK"},{"n":"North Macedonia","c":"MKD"},{"n":"Northern Mariana Islands","c":"MNP"},{"n":"Norway","c":"NOR"},{"n":"Oman","c":"OMN"},{"n":"Pakistan","c":"PAK"},{"n":"Palau","c":"PLW"},{"n":"Palestine, State of","c":"PSE"},{"n":"Panama","c":"PAN"},{"n":"Papua New Guinea","c":"PNG"},{"n":"Paraguay","c":"PRY"},{"n":"Peru","c":"PER"},{"n":"Philippines","c":"PHL"},{"n":"Pitcairn","c":"PCN"},{"n":"Poland","c":"POL"},{"n":"Portugal","c":"PRT"},{"n":"Puerto Rico","c":"PRI"},{"n":"Qatar","c":"QAT"},{"n":"Réunion","c":"REU"},{"n":"Romania","c":"ROU"},{"n":"Russian Federation","c":"RUS"},{"n":"Rwanda","c":"RWA"},{"n":"Saint Barthélemy","c":"BLM"},{"n":"Saint Helena, Ascension and Tristan da Cunha","c":"SHN"},{"n":"Saint Kitts and Nevis","c":"KNA"},{"n":"Saint Lucia","c":"LCA"},{"n":"Saint Martin (French part)","c":"MAF"},{"n":"Saint Pierre and Miquelon","c":"SPM"},{"n":"Saint Vincent and the Grenadines","c":"VCT"},{"n":"Samoa","c":"WSM"},{"n":"San Marino","c":"SMR"},{"n":"Sao Tome and Principe","c":"STP"},{"n":"Saudi Arabia","c":"SAU"},{"n":"Senegal","c":"SEN"},{"n":"Serbia","c":"SRB"},{"n":"Seychelles","c":"SYC"},{"n":"Sierra Leone","c":"SLE"},{"n":"Singapore","c":"SGP"},{"n":"Sint Maarten (Dutch part)","c":"SXM"},{"n":"Slovakia","c":"SVK"},{"n":"Slovenia","c":"SVN"},{"n":"Solomon Islands","c":"SLB"},{"n":"Somalia","c":"SOM"},{"n":"South Africa","c":"ZAF"},{"n":"South Georgia and the South Sandwich Islands","c":"SGS"},{"n":"South Sudan","c":"SSD"},{"n":"Spain","c":"ESP"},{"n":"Sri Lanka","c":"LKA"},{"n":"Sudan","c":"SDN"},{"n":"Surin","c":"SUR"},{"n":"Svalbard and Jan Mayen","c":"SJM"},{"n":"Sweden","c":"SWE"},{"n":"Switzerland","c":"CHE"},{"n":"Syrian Arab Republic","c":"SYR"},{"n":"Taiwan, Province of China","c":"TWN"},{"n":"Tajikistan","c":"TJK"},{"n":"Tanzania, United Republic of","c":"TZA"},{"n":"Thailand","c":"THA"},{"n":"Timor-Leste","c":"TLS"},{"n":"Togo","c":"TGO"},{"n":"Tokelau","c":"TKL"},{"n":"Tonga","c":"TON"},{"n":"Trinidad and Tobago","c":"TTO"},{"n":"Tunisia","c":"TUN"},{"n":"Turkey","c":"TUR"},{"n":"Turkmenistan","c":"TKM"},{"n":"Turks and Caicos Islands","c":"TCA"},{"n":"Tuvalu","c":"TUV"},{"n":"Uganda","c":"UGA"},{"n":"Ukraine","c":"UKR"},{"n":"United Arab Emirates","c":"ARE"},{"n":"United Kingdom of Great Britain and Northern Ireland","c":"GBR"},{"n":"United States of America","c":"USA"},{"n":"United States Minor Outlying Islands","c":"UMI"},{"n":"Uruguay","c":"URY"},{"n":"Uzbekistan","c":"UZB"},{"n":"Vanuatu","c":"VUT"},{"n":"Venezuela (Bolivarian Republic of)","c":"VEN"},{"n":"Viet Nam","c":"VNM"},{"n":"Virgin Islands (British)","c":"VGB"},{"n":"Virgin Islands (U.S.)","c":"VIR"},{"n":"Wallis and Futuna","c":"WLF"},{"n":"Western Sahara","c":"ESH"},{"n":"Yemen","c":"YEM"},{"n":"Zambia","c":"ZMB"},{"n":"Zimbabwe","c":"ZWE"}];
  currencies: Currency[]=environment.currencies.sort((a, b) => (a.name > b.name) ? 1 : -1); //[{"n":"Q", "c":"GTQ"},{"n":"EUR", "c":"EUR"}];
  
  subsCompany: Subscription;
  noStores: number=0;
  noCashiers: number =0;
  listStores: Store[]=[];
  listCashiers: Cashier[]=[];
  connectedTo: string[] =[];
  savingCompany: boolean = false;
  savingStore: boolean = false;
  savingCashier: boolean = false;
  displayCompany: boolean = true;
  displayStore: boolean = true;

  filteredCountries$: Observable<Country[]>;
  filteredCurrencies$: Observable<Currency[]>;
  companySave$: Observable<object>;
  storeSave$: Observable<object>;
  cashierSave$: Observable<object>;
  company$: Observable<Company>;
  store$: Observable<Store[]>;

  get fCompany(){
    return this.companyForm.controls;
  }

  get fStores(){
    return this.storeForm.get('stores') as FormArray;
  }

  get fCashier(): FormArray {
    return this.storeForm.get('stores') as FormArray;
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
    private companyService: CompanyService,
    private storeService: StoresService,
    private cashierService: CashiersService,
    private spinnerService: SpinnerService,
    private breakpointObserver: BreakpointObserver
  ) { 

  }

  companyForm = this.fb.group({
    CompanyId: [''],
    Name: ['', [Validators.required, Validators.maxLength(500), Validators.minLength(3)]],
    Address: ['', [Validators.required, Validators.maxLength(500), Validators.minLength(3)]],
    House_No: ['', [Validators.maxLength(10), Validators.minLength(2)]],
    Country: ['', Validators.required],
    Currency: ['', Validators.required],
    State: ['', [Validators.required, Validators.maxLength(100), Validators.minLength(3)]],
    Phone: ['', [Validators.maxLength(30), Validators.minLength(3)]],
    Postal_Code: ['', [Validators.maxLength(50), Validators.minLength(3)]],
    Tax_Number: ['', [Validators.required, Validators.maxLength(50), Validators.minLength(2)]],
    Email: ['', [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$")]],
    Store_No: [''],
    Cashier_No: ['']
  });
  storeForm = this.fb.group({ 
    stores : this.fb.array([this.createStore()])
  });

  createStore(): FormGroup {
    const items = this.fb.group({
      StoreId: [''],
      CompanyId: [this.companyId],
      Name: ['', [Validators.required, Validators.maxLength(500), Validators.minLength(3)]],
      Address: ['', [Validators.required, Validators.maxLength(500), Validators.minLength(3)]],
      Postal_Code: ['', [Validators.maxLength(50), Validators.minLength(3)]],
      Tax_Number: ['', [Validators.required, Validators.maxLength(50), Validators.minLength(2)]],
      Cashier_No: [0],
      Status: [1]
    });
    return items;
  }

  ngOnInit() {
    var spinnerRef = this.spinnerService.start("Loading Company...");
    this.companyId = this.authService.companyId();
    this.onValueChanges();

    this.filteredCountries$ = this.companyForm.get('Country').valueChanges
      .pipe(
        startWith(''),
        map(country => typeof country === 'string' ? country : country.n),
        map(country => country ? this._filter(country) : this.countries.slice())
      );
    
    this.filteredCurrencies$ = this.companyForm.get('Currency').valueChanges
      .pipe(
        startWith(''),
        map(currency => typeof currency === 'string' ? currency : currency.name),
        map(currency => currency ? this._filterCurrency(currency) : this.currencies.slice())
      );

    this.company$ = this.companyService.getCompany(this.companyId).pipe(
      tap((res: any) => {
        if (res != null){
          let countryValue : Country[];
          if (res.Country != '' && res.Country != undefined){
            countryValue = this.countries.filter(country => country.c.indexOf(res.Country) === 0);
          }
          let currencyValue: Currency[];
          if (res.Currency != '' && res.Currency != undefined){
            currencyValue = this.currencies.filter(currency => currency.c.indexOf(res.Currency) === 0);
          } 
          this.companyForm.patchValue({
            CompanyId: res.Company_Id,
            Name: res.Name,
            Address: res.Address,
            House_No: res.House_No,
            Country: (countryValue != undefined ? countryValue[0] : ''),
            State: res.State,
            Phone: res.Phone,
            Postal_Code: res.Postal_Code,
            Tax_Number: res.Tax_Number,
            Email: res.Email,
            Store_No: res.Store_No,
            Cashier_No: res.Cashier_No,
            Status: res.Status,
            Currency: (currencyValue != undefined ? currencyValue[0] : ''),
          });
          this.noStores = res.Store_No;
          this.noCashiers = res.Cashier_No;
        }
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        this.openDialog('Error !', err.Message, false, true, false);
        return throwError(err || err.message);
      })
    );

    //Load Stores Stepper 2
    this.store$ =  this.storeService.getStores(this.companyId).pipe(
      tap((res: any) => {
        const item = this.storeForm.controls.stores as FormArray;
        item.at(0).patchValue({
          CompanyId: this.companyId
        });
        if (res != null){
          this.listStores = res.map(response => {
            return {
              StoreId: response.StoreId,
              Name: response.Name,
              Cashier_No: response.Cashier_No,
              Cashiers : response.Cashiers.map(res => {
                return {
                  CashierId: res.CashierId,
                  StoreId: res.StoreId,
                  CompanyId: res.CompanyId,
                  Description: res.Description,
                  Status: res.Status,
                  Disabled: (res.Disabled  == 0 ? true : false)
                }
              })
            }
          });

          let ele:number=0;
          this.listStores.forEach(element => {
            ele += element.Cashiers.length;
          });
          //Create listCashiers init data
          for (var i=1; i<= this.noCashiers-ele; i++){
            const data = {
              CashierId:'',
              StoreId:'',
              CompanyId:'',
              Description:'No. ' + i, 
              Status: 1
            }
            this.listCashiers.push(data);
          }

          //link store info to reactive form
          this.storeForm.setControl('stores', this.setStores(res));

          //Drag & Drop connectedTo variable
          this.listStores.forEach(s=> {
            this.connectedTo.push(s.StoreId);
          });
          this.connectedTo.push('cashierList');
        }else{
          //Add new stores to the view
          if (this.noStores > 1 && this.storeForm.value.stores.length == 1){
            for(var i = 1; i <= this.noStores-1; i++){
              (<FormArray>this.storeForm.get('stores')).push(this.createStore());
            }
          }
        }
        this.spinnerService.stop(spinnerRef);
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        this.openDialog('Error !', err.Message, false, true, false);
        return throwError(err || err.message);
      })
    );
  }

  getErrorMessage(component: string, index: number=0) {
    if (component === 'Name'){
      return this.fCompany.Name.hasError('required') ? 'You must enter a value' :
        this.fCompany.Name.hasError('minlength') ? 'Minimun length 3' :
          this.fCompany.Name.hasError('maxlength') ? 'Maximum length 500' :
            '';
    }
    if (component === 'Address'){
      return this.fCompany.Address.hasError('required') ? 'You must enter a value' :
        this.fCompany.Address.hasError('minlength') ? 'Minimun length 3' :
          this.fCompany.Address.hasError('maxlength') ? 'Maximum length 500' :
            '';
    }
    if (component === 'House_No'){
      return this.fCompany.House_No.hasError('maxlength') ? 'Maximun length 10' :
        this.fCompany.House_No.hasError('minlength') ? 'Minimun length 2' :
        '';
    }
    if (component === 'Country'){
      return this.fCompany.Country.hasError('required') ? 'You must select a valid value' :
        this.fCompany.Country.hasError('validObject') ? 'Invalid value' :
          '';
    }
    if (component === 'State'){
      return this.fCompany.State.hasError('required') ? 'You must enter a value' :
        this.fCompany.State.hasError('maxlength') ? 'Maximun length 100' :
          this.fCompany.State.hasError('minlength') ? 'Minimun length 3' :
          '';
    }
    if (component === 'Phone'){
      return this.fCompany.Phone.hasError('maxlength') ? 'Maximun length 30' :
        this.fCompany.Phone.hasError('minlength') ? 'Minimun length 3' :
        '';
    }
    if (component === 'Postal_Code'){
      return this.fCompany.Postal_Code.hasError('maxlength') ? 'Maximun length 50' :
        this.fCompany.Postal_Code.hasError('minlength') ? 'Minimun length 3' :
        '';
    }
    if (component === 'Tax_Number'){
      return this.fCompany.Tax_Number.hasError('required') ? 'You must enter a value' :
        this.fCompany.Tax_Number.hasError('minlength') ? 'Minimun length 2' :
          this.fCompany.Tax_Number.hasError('maxlength') ? 'Maximun length 50' :
            '';
    }
    if (component === 'Email'){
      return this.fCompany.Email.hasError('required') ? 'You must enter a value' :
        this.fCompany.Email.hasError('pattern') ? 'Email invalid' :
        '';
    }
    if (component === 'SName'){
      let sName = (<FormArray>this.storeForm.get('stores')).controls[index].get('Name');
      return sName.hasError('required') ? 'You must enter a value' :
        sName.hasError('minlength') ? 'Minimun length 3' :
          sName.hasError('maxlength') ? 'Maximum length 500' :
            '';
    }
    if (component === 'SAddress'){
      let sAddress = (<FormArray>this.storeForm.get('stores')).controls[index].get('Address');
      return sAddress.hasError('required') ? 'You must enter a value' :
        sAddress.hasError('minlength') ? 'Minimun length 3' :
          sAddress.hasError('maxlength') ? 'Maximum length 500' :
            '';
    }
    if (component === 'SPostal_Code'){
      let sPostal = (<FormArray>this.storeForm.get('stores')).controls[index].get('Postal_Code');
      return sPostal.hasError('maxlength') ? 'Maximun length 50' :
        sPostal.hasError('minlength') ? 'Minimun length 3' :
        '';
    }
    if (component === 'STax_Number'){
      let sTax = (<FormArray>this.storeForm.get('stores')).controls[index].get('Tax_Number');
      return sTax.hasError('required') ? 'You must enter a value' :
        sTax.hasError('minlength') ? 'Minimun length 2' :
          sTax.hasError('maxlength') ? 'Maximun length 50' :
            '';
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
                        event.container.data,
                        event.previousIndex,
                        event.currentIndex);
    }
  }

  setStores(stores: Store[]): FormArray{
    const formStoresArray = new FormArray([]);
    stores.forEach(s => {
      formStoresArray.push(this.fb.group({
        StoreId: s.StoreId,
        Name: s.Name,
        CompanyId: this.companyId,
        Address: s.Address,
        Postal_Code: s.Postal_Code,
        Tax_Number: s.Tax_Number,
        Cashier_No: s.Cashier_No,
        Status: s.Status
      }));
    });
    return formStoresArray;
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

  displayFnCurrency(currency?: Currency): string | undefined {
    return currency ? currency.n : undefined;
  }

  private _filterCurrency(value: string): Currency[] {
    let filterValue: string = '';
    filterValue = value.toLowerCase();
    return this.currencies.filter(currency => currency.name.toLowerCase().indexOf(filterValue) === 0);
  }

  onValueChanges(): void {
    this.subsCompany = this.companyForm.valueChanges.subscribe(val=>{
      if (val.Country === null){
        this.companyForm.controls["Country"].setValue('');
      }
      if (val.Currency === null) {
        this.companyForm.controls["Currency"].setValue('');
      }
    });
  }

  onSubmitCompany(){
    if (!this.companyForm.valid){
      return;
    }
    if (this.companyForm.touched){
      let countryId = this.companyForm.value.Country;
      let currencyId = this.companyForm.value.Currency;
      let dataForm =  { 
        "Name": this.companyForm.value.Name,
        "Address": this.companyForm.value.Address,
        "House_No": this.companyForm.value.House_No,
        "Country": countryId.c,
        "State": this.companyForm.value.State,
        "Phone": this.companyForm.value.Phone,
        "Postal_Code": this.companyForm.value.Postal_Code,
        "Tax_Number": this.companyForm.value.Tax_Number,
        "Currency": currencyId.c,
        "Email": this.companyForm.value.Email
      }
      var spinnerRef = this.spinnerService.start("Saving Company...");
      this.companySave$ = this.companyService.updateCompany(this.companyId, dataForm).pipe(
        tap(res => { 
          this.spinnerService.stop(spinnerRef);
          this.savingCompany = true;
          this.companyForm.markAsPristine();
          this.companyForm.markAsUntouched();
          this.openDialog('Company', 'Company updated successful', true, false, false);
        }),
        catchError(err => {
          this.spinnerService.stop(spinnerRef);
          this.savingCompany = false;
          this.openDialog('Error !', err.Message, false, true, false);
          return throwError(err || err.message);
        })
      );
    }
  }

  onSubmitStores(){
    if (!this.storeForm.valid){ // && this.validCashier === false){
      return;
    }
    // this.validCashier = false;
    if (this.storeForm.touched){
      var spinnerRef = this.spinnerService.start("Saving Stores...");
      this.storeSave$ = this.storeService.updateStores(this.storeForm.value).pipe(
        tap(res => {
          this.spinnerService.stop(spinnerRef);
          this.savingStore = true;
          this.storeForm.markAsPristine();
          this.storeForm.markAsUntouched();
          this.openDialog('Stores', 'Store created successful', true, false, false);
        }),
        catchError(err => {
          this.spinnerService.stop(spinnerRef);
          this.savingStore = false;
          this.openDialog('Error !', err.Message, false, true, false);
          return throwError(err || err.message);
        })
      ); 
    }
  }

  onSubmitCashiers(){
    var spinnerRef = this.spinnerService.start("Saving Cashiers...");
    let updCashier: Cashier[]=[];
    this.listStores.forEach(element => {
      element.Cashier_No = element.Cashiers.length;
      if (element.Cashiers.length > 0) {
        element.Cashiers.map(result => {
          result.StoreId = element.StoreId;
          result.CompanyId = this.companyId;
          updCashier.push(result);
        });
      }
    });

    const updStores = this.listStores.map(res => {
      return {
        StoreId : res.StoreId,
        Cashier_No: res.Cashier_No
      }
    });
    const upStores = {
      stores: updStores
    }
    const upCashier = {
      cashiers: updCashier
    }
    this.cashierSave$ = this.storeService.updateStoreCashier(upStores).pipe(
      tap(res =>{
        if(res !=null){
          this.cashierService.updateCashiers(upCashier).pipe(
            finalize(() => {
              this.savingCashier = true;
              this.spinnerService.stop(spinnerRef);
              this.openDialog('Cashiers', 'Cashier updated successful', true, false, false);
            }),
            catchError(err => {
              this.spinnerService.stop(spinnerRef);
              this.savingCashier = false;
              this.openDialog('Error !', err.Message, false, true, false);
              return throwError(err || err.message); 
            })
          );
        }
      }),
      catchError(err => {
        this.spinnerService.stop(spinnerRef);
        this.savingCashier = false;
        this.openDialog('Error !', err.Message, false, true, false);
        return throwError(err || err.message);
      })
    );    
  }

  ngOnDestroy() {
    if (this.subsCompany){
      this.subsCompany.unsubscribe();
    }
  }

}
