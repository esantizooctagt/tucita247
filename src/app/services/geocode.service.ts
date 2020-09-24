import { Injectable } from '@angular/core';
import { MapsAPILoader } from '@agm/core';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { tap, map, switchMap } from 'rxjs/operators';
import { fromPromise } from 'rxjs/observable/fromPromise';

@Injectable()
export class GeocodeService {
  private geocoder: any;

  constructor(private mapLoader: MapsAPILoader) {}

  private initGeocoder() {
    console.log('Initialize');
    // this.geocoder = new google.maps.Geocoder();
    this.mapLoader.load().then(() => {
      console.log("ejecuto map load");
      this.geocoder = new google.maps.Geocoder();  
   });
  }

  // private waitForMapsToLoad(): Observable<boolean> {
  //   if(!this.geocoder) {
  //     console.log("entro");
  //     return fromPromise(this.mapLoader.load())
  //     .pipe(
  //       tap(() => this.initGeocoder()),
  //       map(() => true)
  //     );
  //   }
  //   return of(true);
  // }

  geocodeAddress(location: string): Observable<any> {
    this.initGeocoder();
    console.log('Get Address');
    const address = location;
    return new Observable(observer => {
      this.geocoder.geocode({'address': address}, (results, status) => {
            if (status === 'OK') {
              let data
              observer.next({
                "lat": results[0].geometry.location.lat(),
                "lng": results[0].geometry.location.lng()
              });
            } else {
              observer.next({ lat: 0, lng: 0 });
              alert('Geocode was not successful for the following reason: ' + status);
            }
      });
    });
    // return this.waitForMapsToLoad().pipe(
    //   // filter(loaded => loaded),
    //   map(() => {console.log("wait response");}),
    //   switchMap(() => {
    //     return new Observable(observer => {
    //       this.geocoder.geocode({'address': location}, (results, status) => {
    //         if (status == google.maps.GeocoderStatus.OK) {
    //           console.log('Geocoding complete!');
    //           observer.next({
    //             lat: results[0].geometry.location.lat(), 
    //             lng: results[0].geometry.location.lng()
    //           });
    //         } else {
    //             console.log('Error - ', results, ' & Status - ', status);
    //             observer.next({ lat: 0, lng: 0 });
    //         }
    //         observer.complete();
    //       });
    //     })        
    //   })
    // )
  }
  
}