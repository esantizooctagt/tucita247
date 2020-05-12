import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { Store } from '@app/_models';  //StoreDocto
import { catchError } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StoresService {
  readonly apiURL = environment.apiUrl;
    constructor(private http: HttpClient) { }

    getStore(storeId, cashierId): Observable<any>{
      return this.http.get<any>(this.apiURL + '/store/' + storeId + '/' + cashierId)
                      .pipe(catchError(this.errorHandler));
    }

    getStores(companyId): Observable<Store[]> {
        return this.http.get<Store[]>(this.apiURL + '/stores/' + companyId)
                        .pipe(catchError(this.errorHandler));
    }

    // getStoresDoctos(companyId): Observable<StoreDocto[]> {
    //   return this.http.get<StoreDocto[]>(this.apiURL + '/stores/company/' + companyId)
    //                   .pipe(catchError(this.errorHandler));
    // }

    updateStores(dataForm){
      return this.http.patch(this.apiURL + '/stores', dataForm)
                      .pipe(catchError(this.errorHandler));
    }

    updateStoreCashier(dataForm){
      return this.http.put(this.apiURL + '/stores', dataForm)
                      .pipe(catchError(this.errorHandler));
    }
    
    errorHandler(error) {
      return throwError(error || 'Server Error');
    }
}
