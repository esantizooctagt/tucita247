import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { Options, LabelType } from 'ng5-slider';

@Component({
  selector: 'app-business-ope',
  templateUrl: './business-ope.component.html',
  styleUrls: ['./business-ope.component.scss']
})
export class BusinessOpeComponent implements OnInit {
  //Generic Option for ng5-slider
  genOption = {
    floor: 0,
    ceil: 24,
    disabled: false,
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

  get fBusiness(){
    return this.businessForm.controls;
  }

  links = [{label:'Opening hours',link:'/businessope',active:1}, {label:'Special days',link:'/businessdays',active:0}];
  activeLink = this.links[0];
  background: ThemePalette = undefined;

  constructor(
    private fb: FormBuilder
  ) { }

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
    OperationHours: ['', [Validators.required]],
    Categories: ['', [Validators.required]],
    ParentBusiness: [''],
    Imagen: [''],
    ImagenLink:[''],
    Tags: [''],
    ApposPurpose: [''],
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

  ngOnInit(): void {
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
  }

  onChangeDisabled(item: number, event: any){
    this.options[item] = Object.assign({}, this.genOption, {disabled: !event.checked});
    if (event.checked == false){
      this.newInterval[item] = "0";
    }
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
        disabled: false,
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
        disabled: false,
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
      disabled: false,
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

}