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
import { WeblinkComponent } from '../weblink/weblink.component';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  business$: Observable<any>;
  business: any;
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
          this.business = res;
          this.business.Locs.sort((a, b) => (a.Name < b.Name ? -1 : 1));
          this.servs = res.Services;
          return this.business;
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
    // const dialogRef = this.dialog.open(AppowiDialogComponent, {
    //   width: '450px',
    //   height: '700px',
    //   data: {timeZone: busObj.TimeZone, business: this.business, businessId: busId, locationId: busObj.LocationId}
    // });
    const dialogRef = this.dialog.open(WeblinkComponent, {
      width: '450px',
      height: '700px',
      data: {timeZone: busObj.TimeZone, business: this.business, businessId: busId, locationId: busObj.LocationId}
    });
  }

}
