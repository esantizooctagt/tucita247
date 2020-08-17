import { Component, OnInit } from '@angular/core';
import { BusinessService } from '@app/services';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { map, catchError } from 'rxjs/operators';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  business$: Observable<any>;
  link: string = '';
  readonly imgPath = environment.bucket;
  
  constructor(
    private route: ActivatedRoute,
    private businessService: BusinessService
  ) { }

  ngOnInit(): void {
    this.link = this.route.snapshot.paramMap.get('landing');

    this.business$ = this.businessService.getBusinessLanding(this.link).pipe(
      map((res: any) => {
        if (res != null){
          return res;
        }
      }),
      catchError(err => {
        return err.message;
      })
    );
  }

}
