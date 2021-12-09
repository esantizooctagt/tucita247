import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Business } from '@app/_models';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

import hmacSHA1 from 'crypto-js/hmac-sha1';
import Base64 from 'crypto-js/enc-base64';

@Injectable({
  providedIn: 'root'
})
export class BusinessService {
  readonly apiURL = environment.apiUrl;
  readonly apiAdminUrl = environment.apiAdminUrl;
  readonly apiWPURL = environment.apiWPUrl;
  readonly siteId = environment.siteId;
  readonly merchantKey = environment.merchantKey;

  readonly customer_key = environment.ckey;
  readonly customer_secret = environment.csecret; 

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

  postToken(contentHash: string, merchantKey: string, ccNumber: string, ccMonth: number, ccYear: number, ccName: string, customerId: string, email: string){
    let dataForm = {
      MerchantKey: merchantKey,
      AccountNumber: ccNumber,
      ExpirationMonth: ccMonth,
      ExpirationYear: ccYear,
      CustomerName: ccName,
      IsDefault: true,
      CustomerId: customerId,
      AccountType: '1',
      CustomerEmail: email,
      ZipCode: '12345',
      hash: contentHash,
      sessionId: this.sessionId.toString()
    }
    return this.http.post(this.apiAdminUrl + '/dynamics/token', dataForm)
                    .pipe(catchError(this.errorHandler))
  }

  postHash(contentHash: string){
    return this.http.post(this.apiAdminUrl + '/dynamics/hash/' + contentHash, '')
                    .pipe(catchError(this.errorHandler))
  }

  getAccounts(customerId, contentHash){
    return this.http.post(this.apiAdminUrl + '/dynamics/accounts/' + customerId, { hash: contentHash, sessionId: this.sessionId.toString() })
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
    return this.http.put('https://tucita247.com/wp-json/wc/v3/orders/' + orderId + '?consumer_key='+this.customer_key+'&consumer_secret='+this.customer_secret, body, httpOptions)
                    .pipe(catchError(this.errorHandler))
  }

  getId(emailBus: string){
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    return this.http.get<any>('https://tucita247.com/wp-json/wc/v3/customers?email=' + emailBus + '&consumer_key='+this.customer_key+'&consumer_secret='+this.customer_secret, httpOptions)
                    .pipe(catchError(this.errorHandler))
  }

  getOrders(customerId: string){
    const newD = new Date();
    const today = new Date(newD.setMonth(newD.getMonth()-4));
    const data = today.getFullYear() + '-' + (today.getMonth()+1).toString().padStart(2,'0') + '-' + (today.getDate()).toString().padStart(2,'0')
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    return this.http.get<any>('https://tucita247.com/wp-json/wc/v3/orders?after='+data+'T00:00:00Z&customer=' + customerId + '&consumer_key='+this.customer_key+'&consumer_secret='+this.customer_secret, httpOptions)
                    .pipe(catchError(this.errorHandler))
  }

  errorHandler(error){
    return throwError(error || 'Server Error');
  }

  getSignedURL(method: string, url: string, params: any){
    // const url = this.getSignedURL('GET', 'https://tucita247.com/wp-json/wc/v3/customers', {email: emailBus});
    const currentTimestamp = Math.floor(new Date().getTime() / 1000);
    var nonce = '';
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for(var i = 0; i < 11; i++) {
      nonce += possible.charAt(Math.floor(Math.random() * possible.length));
    }    
    let authParam:object ={
        oauth_consumer_key : this.customer_key,
        oauth_nonce : nonce,
        oauth_signature_method : 'HMAC-SHA1',
        oauth_timestamp : currentTimestamp,
        oauth_version : '1.0',
    } 
    let parameters = Object.assign({}, authParam, params);
    let signatureStr:string = '';
    Object.keys(parameters).sort().forEach(function(key) {
        if(signatureStr == '')
            signatureStr += key+'='+parameters[key];
        else
            signatureStr += '&'+key+'='+parameters[key];
    });
    let paramStr:string = '';
    Object.keys(params).sort().forEach(function(key) {
        paramStr += '&'+key+'='+parameters[key];
    });
    console.log(signatureStr);
    console.log(method+'&'+encodeURIComponent(url)+'&'+encodeURIComponent(signatureStr));
    console.log(this.customer_secret+'&');
    return url+'?oauth_consumer_key='+this.customer_key+'&oauth_nonce='+nonce+'&oauth_signature_method=HMAC-SHA1&oauth_timestamp='+currentTimestamp+'&oauth_version=1.0&oauth_signature='+Base64.stringify(hmacSHA1(method+'&'+encodeURIComponent(url)+'&'+encodeURIComponent(signatureStr),this.customer_secret+'&'))+paramStr;
  }

}
