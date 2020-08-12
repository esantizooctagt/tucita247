import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { LocationService, ProviderService, AppointmentService } from '@app/services';
import { AuthService } from '@app/core/services';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import * as XLSX from 'xlsx';
import { FormArray, FormBuilder } from '@angular/forms';
import { MatTable } from '@angular/material/table';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  @ViewChild('TABLE') table: ElementRef;
  @ViewChild(MatTable) aveTable :MatTable<any>;

  businessId: string = '';
  locationId: string = '_';
  providerId: string = '_';
  locations$: Observable<any[]>;
  providers$: Observable<any[]>;
  report$: Observable<any[]>;
  report: number = 1;
  maxDate: Date;
  minDate: Date;
  dateIni: Date;
  dateFin: Date;
  aveColumns = ['Qty', 'Time'];

  constructor(
    private fb: FormBuilder,
    private locationService: LocationService,
    private providerService: ProviderService,
    private appointmentService: AppointmentService,
    private authService: AuthService
  ) { }

  get fAverage(){
    return this.averageForm.get('Average') as FormArray;
  }

  averageForm = this.fb.group({
    Average: this.fb.array([])
  });

  ngOnInit(): void {
    this.businessId = this.authService.businessId();

    const currentYear = new Date().getFullYear();
    const currMonth = new Date().getMonth();
    const currDay = new Date().getDate();
    this.maxDate = new Date(currentYear, currMonth, currDay);
    this.minDate = new Date(2020, 7, 1);

    this.locations$ = this.locationService.getLocationsCode(this.businessId).pipe(
      map((res: any) => {
        return res.locs;
      }), 
      catchError(res =>{
        return res;
      })
    )
  }

  onLocationChange(event){
    this.locationId = event.value;
    this.providers$ = this.providerService.getProvidersLoc(this.businessId, event.value).pipe(
      map((res: any) => {
        return res.providers;
      }), 
      catchError(res =>{
        return res;
      })
    )
  }

  genReporte(){
    if (this.report == 0) {return;}
    if (this.report == 1){
      this.generateProm();
    }
    if (this.report == 2){
      this.generateVisitas();
    }
    if (this.report == 3){
      this.generateCancels();
    }
  }

  generateProm(){
    let initD = this.dateIni.getFullYear() + '-' + (this.dateIni.getMonth()+1 < 10 ? (this.dateIni.getMonth()+1).toString().padStart(2, '0') : (this.dateIni.getDate() < 10 ? this.dateIni.getDate().toString().padStart(2,'0') : this.dateIni.getDate()));
    let finD = this.dateFin.getFullYear() + '-' + (this.dateFin.getMonth()+1 < 10 ? (this.dateFin.getMonth()+1).toString().padStart(2, '0') : (this.dateFin.getDate() < 10 ? this.dateFin.getDate().toString().padStart(2,'0') : this.dateFin.getDate()));
    if (this.providerId == '') { this.providerId = '_';}
    if (this.locationId == '') { this.locationId = '_'; }
    this.report$ = this.appointmentService.getRepoAverage(this.businessId, this.locationId, this.providerId, initD, finD).pipe(
      map((res: any) => {
        if (res != null){
          if (res.Code == 200){
            this.averageForm.setControl('Average', this.setAverageData(res.Result));
            return res.Result;
          }
        }
      })
    )
  }

  setAverageData(data: any[]): FormArray{
    const formArray = new FormArray([]);
    data.forEach(res => {
      formArray.push(this.fb.group({
          Qty: res.Qty,
          Time: res.Time
        })
      );
      this.aveTable.renderRows();
    });
    return formArray;
  }

  generateVisitas(){

  }

  generateCancels(){

  }

  exportExcel(){
    const ws: XLSX.WorkSheet=XLSX.utils.table_to_sheet(this.table.nativeElement);//converts a DOM TABLE element to a worksheet
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    XLSX.writeFile(wb, 'tucita247.xlsx');
  }

}
