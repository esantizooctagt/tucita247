import { Component, OnInit } from '@angular/core';
import { BusinessService } from '@app/services';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { map, catchError } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import { AppowiDialogComponent } from '@app/shared/appowi-dialog/appowi-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  business$: Observable<any>;
  servs: []=[];
  link: string = '';
  readonly imgPath = environment.bucket;
  
  constructor(
    private route: ActivatedRoute,
    private businessService: BusinessService,
    private dialog: MatDialog,
    iconRegistry: MatIconRegistry, 
    sanitizer: DomSanitizer
  ) {
    iconRegistry.addSvgIcon(
      'twitter',
      sanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/twitter.svg'));
    iconRegistry.addSvgIcon(
      'instagram',
      sanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/instagram.svg'));
    iconRegistry.addSvgIcon(
      'facebook',
      sanitizer.bypassSecurityTrustResourceUrl('assets/images/icon/facebook.svg'));
   }

  ngOnInit(): void {
    this.link = this.route.snapshot.paramMap.get('landing');

    this.business$ = this.businessService.getBusinessLanding(this.link).pipe(
      map((res: any) => {
        if (res != null){
          this.servs = res.Services;
          return res;
        }
      }),
      catchError(err => {
        return err.message;
      })
    );
  }

  openLink(link){
    window.open(link, "_blank");
  }

  newAppo(busObj, busId){
    console.log("datos prueba");
    console.log(busObj);

    const dialogRef = this.dialog.open(AppowiDialogComponent, {
      width: '450px',
      height: '700px',
      data: {timeZone: busObj.TimeZone, door: '', businessId: busId, locationId: busObj.LocationId, providerId: '0', services: this.servs, buckets: [], hours: [], providers: busObj.Provs, tipo: 2}
    });
  }

}
