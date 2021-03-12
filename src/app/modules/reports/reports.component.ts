import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { LocationService, ProviderService, AppointmentService } from '@app/services';
import { AuthService } from '@app/core/services';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import * as XLSX from 'xlsx';
import { FormArray, FormBuilder } from '@angular/forms';
import { MatTable } from '@angular/material/table';
import { SpinnerService } from '@app/shared/spinner.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  @ViewChild('TABLE') table: ElementRef;
  @ViewChild(MatTable) dataTable :MatTable<any>;

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
  lastItem: string = '_';
  
  public length: number = 0;
  public pageSize: number = 10;
  public _page: number;
  private _currentPage: any[] = [];

  aveColumns = ['Date', 'Qty', 'Time'];
  visitaColumns = ['Date', 'Name', 'Phone', 'Door', 'Qty', 'Type', 'CheckIn', 'CheckOut', 'Priority'];
  cancelColumns = ['Date', 'Cancel', 'Name', 'Phone', 'Door', 'Qty', 'Type', 'Priority'];

  constructor(
    private fb: FormBuilder,
    private locationService: LocationService,
    private providerService: ProviderService,
    private appointmentService: AppointmentService,
    private spinnerService: SpinnerService,
    private authService: AuthService
  ) { }

  get fAverage(){
    return this.averageForm.get('Average') as FormArray;
  }

  get fVisitas(){
    return this.visitasForm.get('Visitas') as FormArray;
  }

  get fCancel(){
    return this.cancelForm.get('Cancel') as FormArray;
  }

  averageForm = this.fb.group({
    Average: this.fb.array([])
  });

  visitasForm = this.fb.group({
    Visitas: this.fb.array([])
  });

  cancelForm = this.fb.group({
    Cancel: this.fb.array([])
  });

  ngOnInit(): void {
    this.businessId = this.authService.businessId();

    const currentYear = new Date().getFullYear();
    const currMonth = new Date().getMonth();
    const currDay = new Date().getDate();
    this.maxDate = new Date(currentYear, currMonth, currDay);
    this.minDate = new Date(2020, 7, 1);

    this._page = 1;
    this._currentPage.push({page: this._page, id: ''});

    this.locations$ = this.locationService.getLocationsCode(this.businessId).pipe(
      map((res: any) => {
        return res.locs.sort((a, b) => (a.Name < b.Name ? -1 : 1));;
      }), 
      catchError(res =>{
        return res;
      })
    )
  }

  ngAfterViewChecked() {
    //change style page number
    const list = document.getElementsByClassName('mat-paginator-range-label');
    list[0].innerHTML = this._page.toString();
  }

  onLocationChange(event){
    this.locationId = event.value;
    this.providers$ = this.providerService.getProvidersLoc(this.businessId, event.value).pipe(
      map((res: any) => {
        return res.providers.sort((a, b) => (a.Name < b.Name ? -1 : 1));;
      }), 
      catchError(res =>{
        return res;
      })
    )
  }

  genReporte(){
    if (this.report == 0) {return;}
    this._currentPage = [];
    this.length = 0;
    this._page = 1;
    this.lastItem = '_';

    this._currentPage.push({page: this._page, id: ''});
    if (this.report == 1){
      this.generateAvg();
    }
    if (this.report == 2){
      this.generateVisitas();
    }
    if (this.report == 3){
      this.generateCancels();
    }
  }

  generateAvg(){
    let initD = this.dateIni.getFullYear() + '-' + (this.dateIni.getMonth()+1 < 10 ? (this.dateIni.getMonth()+1).toString().padStart(2, '0') : this.dateIni.getMonth()+1) + '-' + (this.dateIni.getDate() < 10 ? this.dateIni.getDate().toString().padStart(2,'0') : this.dateIni.getDate());
    let finD = this.dateFin.getFullYear() + '-' + (this.dateFin.getMonth()+1 < 10 ? (this.dateFin.getMonth()+1).toString().padStart(2, '0') : this.dateIni.getMonth()+1) + '-' + (this.dateFin.getDate() < 10 ? this.dateFin.getDate().toString().padStart(2,'0') : this.dateFin.getDate());
    if (this.providerId == '') { this.providerId = '_';}
    if (this.locationId == '') { this.locationId = '_'; }
    var spinnerRef = this.spinnerService.start($localize`:@@lite.loadingdata:`);
    this.report$ = this.appointmentService.getRepoAverage(this.businessId, this.locationId, this.providerId, initD, finD, this.lastItem).pipe(
      map((res: any) => {
        if (res != null){
          if (res.Code == 200){
            if (res.lastItem != '_'){
              this.lastItem = res.lastItem;
              this.length = (this.pageSize*this._page)+1;
              this._currentPage.push({page: this._page+1, id: res.lastItem});
            }
            this.spinnerService.stop(spinnerRef);
            this.averageForm.setControl('Average', this.setAverageData(res.Result));
            return res.Result;
          }
        }
        this.spinnerService.stop(spinnerRef);
      })
    )
  }

  setAverageData(data: any[]): FormArray{
    const formArray = new FormArray([]);
    data.forEach(res => {
      formArray.push(this.fb.group({
          Date: res.Date,
          Qty: res.Qty,
          Time: res.Time
        })
      );
      this.dataTable.renderRows();
    });
    return formArray;
  }

  public goToPage(page: number, elements: number): void {
    if (this.pageSize != elements){
      this.pageSize = elements;
      this._page = 1;
    } else {
      this._page = page+1;
    }
    if (this.report == 1){
      this.generateAvg();
    }
    if (this.report == 2){
      this.generateVisitas();
    }
    if (this.report == 3){
      this.generateCancels();
    }
  }

  generateVisitas(){
    let initD = this.dateIni.getFullYear() + '-' + (this.dateIni.getMonth()+1 < 10 ? (this.dateIni.getMonth()+1).toString().padStart(2, '0') : this.dateIni.getMonth()+1) + '-' + (this.dateIni.getDate() < 10 ? this.dateIni.getDate().toString().padStart(2,'0') : this.dateIni.getDate());
    let finD = this.dateFin.getFullYear() + '-' + (this.dateFin.getMonth()+1 < 10 ? (this.dateFin.getMonth()+1).toString().padStart(2, '0') : this.dateIni.getMonth()+1) + '-' + (this.dateFin.getDate() < 10 ? this.dateFin.getDate().toString().padStart(2,'0') : this.dateFin.getDate());
    if (this.providerId == '') { this.providerId = '_';}
    if (this.locationId == '') { this.locationId = '_'; }
    var spinnerRef = this.spinnerService.start($localize`:@@lite.loadingdata:`);
    this.report$ = this.appointmentService.getRepoVisitas(this.businessId, this.locationId, this.providerId, initD, finD, this.lastItem).pipe(
      map((res: any) => {
        if (res != null){
          if (res.Code == 200){
            if (res.lastItem != '_'){
              this.lastItem = res.lastItem;
              this.length = (this.pageSize*this._page)+1;
              this._currentPage.push({page: this._page+1, id: res.lastItem});
            }
            this.spinnerService.stop(spinnerRef);
            this.visitasForm.setControl('Visitas', this.setVisitasData(res.Result));
            return res.Result;
          }
        }
        this.spinnerService.stop(spinnerRef);
      })
    )
  }

  setVisitasData(data: any[]): FormArray{
    const formArray = new FormArray([]);
    data.forEach(res => {
      formArray.push(this.fb.group({
          Date: res.Date,
          Name: res.Name,
          Phone: res.Phone,
          Door: res.Door,
          Qty: res.Qty,
          Type: res.Type,
          CheckIn: res.CheckIn,
          CheckOut: res.CheckOut,
          Priority: res.Priority
        })
      );
      this.dataTable.renderRows();
    });
    return formArray;
  }

  generateCancels(){
    let initD = this.dateIni.getFullYear() + '-' + (this.dateIni.getMonth()+1 < 10 ? (this.dateIni.getMonth()+1).toString().padStart(2, '0') : this.dateIni.getMonth()+1) + '-' + (this.dateIni.getDate() < 10 ? this.dateIni.getDate().toString().padStart(2,'0') : this.dateIni.getDate());
    let finD = this.dateFin.getFullYear() + '-' + (this.dateFin.getMonth()+1 < 10 ? (this.dateFin.getMonth()+1).toString().padStart(2, '0') : this.dateIni.getMonth()+1) + '-' + (this.dateFin.getDate() < 10 ? this.dateFin.getDate().toString().padStart(2,'0') : this.dateFin.getDate());
    if (this.providerId == '') { this.providerId = '_';}
    if (this.locationId == '') { this.locationId = '_'; }
    var spinnerRef = this.spinnerService.start($localize`:@@lite.loadingdata:`);
    this.report$ = this.appointmentService.getRepoCancel(this.businessId, this.locationId, this.providerId, initD, finD, this.lastItem).pipe(
      map((res: any) => {
        if (res != null){
          if (res.Code == 200){
            if (res.lastItem != '_'){
              this.lastItem = res.lastItem;
              this.length = (this.pageSize*this._page)+1;
              this._currentPage.push({page: this._page+1, id: res.lastItem});
            }
            this.spinnerService.stop(spinnerRef);
            this.visitasForm.setControl('Cancel', this.setVisitasData(res.Result));
            return res.Result;
          }
        }
        this.spinnerService.stop(spinnerRef);
      })
    )
  }

  setCancelData(data: any[]): FormArray{
    const formArray = new FormArray([]);
    data.forEach(res => {
      formArray.push(this.fb.group({
          Date: res.Date,
          Name: res.Name,
          Phone: res.Phone,
          Door: res.Door,
          Qty: res.Qty,
          Type: res.Type,
          Priority: res.Priority,
          Cancel: res.Cancel
        })
      );
      this.dataTable.renderRows();
    });
    return formArray;
  }

  exportExcel(){
    const ws: XLSX.WorkSheet=XLSX.utils.table_to_sheet(this.table.nativeElement);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    XLSX.writeFile(wb, 'tucita247.xlsx');
  }

  cleanFields(){
    this._currentPage = [];
    this.length = 0;
    this._page = 1;
    this.lastItem = '_';
    this.report = 1;
    this.locationId = '_';
    this.providerId = '_';
    this.dateIni = undefined;
    this.dateFin = undefined;
    
    this.averageForm = this.fb.group({
      Average: this.fb.array([])
    });
    this.visitasForm = this.fb.group({
      Visitas: this.fb.array([])
    });
    this.cancelForm = this.fb.group({
      Cancel: this.fb.array([])
    });
    this.dataTable.renderRows();

    this._currentPage.push({page: this._page, id: ''});
    this.locations$ = this.locationService.getLocationsCode(this.businessId).pipe(
      map((res: any) => {
        return res.locs;
      }), 
      catchError(res =>{
        return res;
      })
    )
  }

  repoChange(event){
    this._currentPage = [];
    this.length = 0;
    this._page = 1;
    this.lastItem = '_';

    this.averageForm = this.fb.group({
      Average: this.fb.array([])
    });
    this.visitasForm = this.fb.group({
      Visitas: this.fb.array([])
    });
    this.cancelForm = this.fb.group({
      Cancel: this.fb.array([])
    });
    this.dataTable.renderRows();
  }
}
