import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Business } from '@app/_models';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BusinessService {
  readonly apiURL = environment.apiUrl;
  readonly apiAdminUrl = environment.apiAdminUrl;
  readonly apiWPURL = environment.apiWPUrl;
  readonly siteId = environment.siteId;
  readonly merchantKey = environment.merchantKey;

  sessionId: number;
  constructor(private http: HttpClient) { }

  getBusinessAdmin(): Observable<any>{
    return this.http.get<Business>(this.apiAdminUrl + '/business/admin')
                    .pipe(catchError(this.errorHandler));
  }

  getBusiness(businessId, language): Observable<Business> {
    return this.http.get<Business>(this.apiURL + '/business/' + businessId + '/' + language)
                    .pipe(catchError(this.errorHandler));
  }

  getBusinessOpeHours(businessId, locationId): Observable<any> {
    return this.http.get<any>(this.apiURL + '/business/opehours/' + businessId + '/' + locationId)
                    .pipe(catchError(this.errorHandler));
  }

  getValidBusiness(businessId, locationId, providerId, serviceId, appoDate, appoHour): Observable<any>{
    return this.http.get<any>(this.apiURL + '/business/valid/' + businessId + '/' + locationId + '/' + providerId + '/' + serviceId + '/' + appoDate + '/' + appoHour)
                    .pipe(catchError(this.errorHandler));
  }
  getBusinessParent(): Observable<any[]>{
    return this.http.get<any[]>(this.apiURL + '/business/parents')
                    .pipe(catchError(this.errorHandler));
  }

  getBusinessAppos(businessId): Observable<any>{
    return this.http.get<any>(this.apiURL + '/business/appos/' + businessId)
                    .pipe(catchError(this.errorHandler));
  }

  getBusinessLanding(link): Observable<any>{
    return this.http.get<any>(this.apiURL + '/business/landing/'+ link)
                    .pipe(catchError(this.errorHandler));
  }

  getCountry(businessId): Observable<any>{
    return this.http.get<any>(this.apiURL + '/business/country/' + businessId)
                    .pipe(catchError(this.errorHandler));
  }

  getDaysOff(businessId, locationId, providerId, year): Observable<any>{
    return this.http.get<any>(this.apiURL + '/business/daysoff/' + businessId + '/' + locationId + '/' + providerId + '/' + year)
                    .pipe(catchError(this.errorHandler));
  }

  getOpeningHours(businessId, locationId, providerId): Observable<any>{
    return this.http.get<any>(this.apiURL + '/business/openinghours/' + businessId + '/' + locationId + '/' + providerId)
                    .pipe(catchError(this.errorHandler));
  }

  updateBusinessParms(businessId, locationId, providerId, value, tipo){
    return this.http.put(this.apiURL + '/business/params/' + businessId + '/' + locationId + '/' + providerId + '/' + value + '/' + tipo, '')
                    .pipe(catchError(this.errorHandler));
  }

  updateOpeningHours(businessId, locationId, providerId, parentData, dataForm){
    return this.http.put(this.apiURL + '/business/openinghours/' + businessId + '/' + locationId + '/' + providerId + '/' + parentData, dataForm)
                    .pipe(catchError(this.errorHandler));
  }

  updateDaysOff(businessId, locationId, providerId, dateOpe, tipo){
    return this.http.put(this.apiURL + '/business/daysoff/' + businessId + '/' + locationId + '/' + providerId + '/' + dateOpe + '/' + tipo, '')
                    .pipe(catchError(this.errorHandler));
  }

  updateBusiness(businessId, dataForm) {
    return this.http.put(this.apiURL + '/business/' + businessId, dataForm)
                    .pipe(catchError(this.errorHandler));
  }

  postBusiness(dataForm) {
    return this.http.post(this.apiWPURL + '/business', dataForm)
                    .pipe(catchError(this.errorHandler));
  }

  uploadBusinessImg(businessId, dataForm){
    return this.http.put(this.apiURL + '/business/imagen/' + businessId, dataForm)
                    .pipe(catchError(this.errorHandler));
  }

  uploadBusinessImgLink(businessId, dataForm){
    return this.http.put(this.apiURL + '/business/imagen/link/' + businessId, dataForm)
                    .pipe(catchError(this.errorHandler));
  }

  validateLink(link){
    return this.http.get<any>(this.apiURL + '/business/link/' + link)
                    .pipe(catchError(this.errorHandler))
  }

  getSession(){
    return this.sessionId;
  }

  setSession(val: number){
    this.sessionId = val;
  }

  getToken(messageHash, dataForm){
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        SiteId: this.siteId,
        MessageHash: messageHash,
        SessionId: this.sessionId.toString()
      })
    };
    return this.http.post('https://www.agilpay.net/WebApi/APaymentTokenApi/RegisterToken', dataForm, httpOptions)
                    .pipe(catchError(this.errorHandler))
  }

  getHash(contentHash: string){
    const httpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin' : '*',
        'Access-Control-Allow-Credentials': 'true',
        'Content-Type':  'application/json',
        'SiteId': this.siteId
      })
    };
    return this.http.get<any>('https://www.agilpay.net/WebApi/APaymentTokenApi/GetHash?contentHash=' + contentHash, httpOptions)
                    .pipe(catchError(this.errorHandler))
  }

  getAccounts(customerId, contentHash){
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        SiteId: this.siteId,
        SessionId: this.sessionId.toString(),
        MessageHash: contentHash
      })
    };
    return this.http.get<any>('https://www.agilpay.net/WebApi/APaymentTokenApi/GetCustomerTokens?CustomerID='+customerId, httpOptions)
                    .pipe(catchError(this.errorHandler))
  }

  updAccount(orderId: string, token: string){
    const utcDate = Date.now();
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    const body = {
      "meta_data": [
      {
        "key": "AccountToken",
        "value": token
      }]
    }
    return this.http.put('https://tucita247.com/wp-json/wc/v3/orders/'+orderId+'?oauth_consumer_key=ck_3fcd8bc23ab2aa9b5cb27f3ff68c798a072b9662&oauth_signature_method=HMAC-SHA1&oauth_timestamp='+utcDate.toString()+'&oauth_nonce=ohqdd3nNDzO&oauth_version=1.0&oauth_signature=9vjdei1+oafJz25J5pjoQfRAx34=', body, httpOptions)
                    .pipe(catchError(this.errorHandler))
  }

  getId(email: string){
    const utcDate = Date.now();
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    return this.http.get<any>('https://tucita247.com/wp-json/wc/v3/customers?email=' + email + '&oauth_consumer_key=ck_3fcd8bc23ab2aa9b5cb27f3ff68c798a072b9662&oauth_signature_method=HMAC-SHA1&oauth_timestamp='+utcDate.toString()+'&oauth_nonce=ohqdd3nNDzO&oauth_version=1.0&oauth_signature=9vjdei1+oafJz25J5pjoQfRAx34=', httpOptions)
                    .pipe(catchError(this.errorHandler))
  }

  getOrders(customerId: string){
    const utcDate = Date.now();
    const newD = new Date();
    const today = new Date(newD.setMonth(newD.getMonth()-10));
    const data = today.getFullYear() + '-' + (today.getMonth()+1).toString().padStart(2,'0') + '-' + (today.getDate()).toString().padStart(2,'0')
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    return this.http.get<any>('https://tucita247.com/wp-json/wc/v3/orders?after='+data+'T00:00:00Z&customer=' + customerId + '&oauth_consumer_key=ck_3fcd8bc23ab2aa9b5cb27f3ff68c798a072b9662&oauth_signature_method=HMAC-SHA1&oauth_timestamp='+utcDate.toString()+'&oauth_nonce=ohqdd3nNDzO&oauth_version=1.0&oauth_signature=9vjdei1+oafJz25J5pjoQfRAx34=', httpOptions)
                    .pipe(catchError(this.errorHandler))
  }

  errorHandler(error){
    return throwError(error || 'Server Error');
  }
}
