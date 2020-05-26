import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LocationService } from '@app/services';
import { AuthService } from '@app/core/services';
import { SpinnerService } from '@app/shared/spinner.service';
import { map, catchError } from 'rxjs/operators';
import { AppointmentService } from '@app/services/appointment.service';
import { Appointment } from '@app/_models';

@Component({
  selector: 'app-host',
  templateUrl: './host.component.html',
  styleUrls: ['./host.component.scss']
})
export class HostComponent implements OnInit {
  locations$: Observable<Location[]>;
  appointments$: Observable<Appointment[]>;

  doors: string[]=[];
  businessId: string = '';

  locationId: string = '';
  doorId: string = '';

  onError: string = '';

  constructor(
    private spinnerService: SpinnerService,
    private _snackBar: MatSnackBar,
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private locationService: LocationService
  ) { }
  schedule = [
    {
      AppId: "12345",
      Name: "ERICK SANTIZO",
      Phone: "+1 (900) 900 9282",
      OnBehalf: 0
    },
    {
      AppId: "67890",
      Name: "LUIS PEREZ",
      Phone: "+1 (123) 900 9282",
      OnBehalf: 0
    }
  ];
  walkIns = [
    {
      AppId: "45456",
      Name: "VALERIE SANTIZO",
      Phone: "+1 (123) 900 9282",
      OnBehalf: 0
    }
  ]
  preCheckIn =[
    {
      AppId: "34256",
      Name: "MELANIE SANTIZO",
      Phone: "+1 (456) 900 9282",
      OnBehalf: 0
    }
  ]

  ngOnInit(): void {
    var spinnerRef = this.spinnerService.start("Loading Appointments...");
    this.businessId = this.authService.businessId();

    this.locations$ = this.locationService.getLocationsHost(this.businessId).pipe(
      map((res: any) => {
        if (res != null) {
          // console.log(res.Locs);
          // console.log(res.Locs.Doors);
          // if (res.Locs.Doors != ''){
          //   this.doors = res.Locs.Doors.split(',');
          // }
          this.spinnerService.stop(spinnerRef);
        }
        return res.Locs;
      }),
      catchError(err => {
        this.onError = err.Message;
        this.spinnerService.stop(spinnerRef);
        return this.onError;
      })
    );
  }

  addAppointment(){
    //AGREGAR WALK IN
  }

  onCancelApp(i: string){
    //CANCELAR APPOINTMENT
  }

  onChangeApp(i: string){
    //CHANGE APPOINTMENT --> CANCEL CURRENT, CREATE NEW ONE WITH THE SAME PARAMETERS
  }

  onNotifyApp(i: string){
    //RE-SEND NOTIFICATION TO APPOINTMENT
  }

  onCheckInApp(i: string){
    //READ QR CODE AND CHECK-IN PROCESS
  }

  setLocation(event){
    this.doors = event.Doors.split(',');
    this.locationId = event.LocationId;
    let dateAppo = new Date();
    let dateAppoStr = dateAppo.getFullYear() + '-' + (dateAppo.getMonth() < 10 ? '0' + dateAppo.getMonth().toString() : dateAppo.getMonth().toString()) + (dateAppo.getDate() < 10 ? '0' + dateAppo.getDate().toString() : dateAppo.getDate().toString())
    var spinnerRef = this.spinnerService.start("Loading Appointments...");
    this.appointments$ = this.appointmentService.getLocations(this.businessId, this.locationId, dateAppoStr).pipe(
      map((res: any) => {
        if (res != null) {
          res.Appos.forEach(item => {
            //CONSULTAR SI SE DEJAN HORAS VIEJAS O SOLO DE LA HORA ACTUAL EN ADELANTE
            if (item['Type'] == 1 && item['Status'] == 1){
              this.schedule.push({
                AppId: item['AppointmentId'],
                Name: item['FirstName'] + ' ' + item['LastName'],
                OnBehalf: item['OnBehalf'],
                Phone: item['Phone']
              });
            }
            if (item['Type'] == 2 && item['Status'] == 1){
              this.walkIns.push({
                AppId: item['AppointmentId'],
                Name: item['FirstName'] + ' ' + item['LastName'],
                OnBehalf: item['OnBehalf'],
                Phone: item['Phone']
              })
            }
            if (item['Type'] == 3 && item['Status'] == 1){
              this.preCheckIn.push({
                AppId: item['AppointmentId'],
                Name: item['FirstName'] + ' ' + item['LastName'],
                OnBehalf: item['OnBehalf'],
                Phone: item['Phone']
              })
            }
          });
          this.spinnerService.stop(spinnerRef);
        }
        return res.Appos;
      }),
      catchError(err => {
        this.onError = err.Message;
        this.spinnerService.stop(spinnerRef);
        return this.onError;
      })
    );
  }

  setDoor(event) {
    this.doorId = event.value;
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      // moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
                        event.container.data,
                        event.previousIndex,
                        event.currentIndex);
    }
  }
}
