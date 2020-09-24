import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { User } from '@app/_models';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User>;
  private currentUserTknSubject: BehaviorSubject<any>;
  private currentAccessTknSubject: BehaviorSubject<any>;
  private currentRefreshTknSubject: BehaviorSubject<any>;
  private currentSuperAdminSubject: BehaviorSubject<any>;

  public currentUser: Observable<User>;
  public currentTkn: Observable<any>;
  public currentAccessTkn: Observable<any>;
  public currentRefresh: Observable<any>;
  public currentSuperAdmin: Observable<any>;

  readonly apiURL = environment.apiUrl;
  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(sessionStorage.getItem('TC247_USS')));
    this.currentUser = this.currentUserSubject.asObservable();

    this.currentUserTknSubject = new BehaviorSubject<User>(JSON.parse(sessionStorage.getItem('TC247_TKN')));
    this.currentTkn = this.currentUserTknSubject.asObservable();

    this.currentAccessTknSubject = new BehaviorSubject<User>(JSON.parse(sessionStorage.getItem('TC247_ACT')));
    this.currentAccessTkn = this.currentAccessTknSubject.asObservable();

    this.currentRefreshTknSubject = new BehaviorSubject<User>(JSON.parse(sessionStorage.getItem('TC247_REF')));
    this.currentRefresh = this.currentRefreshTknSubject.asObservable();

    this.currentSuperAdminSubject = new BehaviorSubject<any>(JSON.parse(sessionStorage.getItem('TC247_ADM')));
    this.currentSuperAdmin = this.currentSuperAdminSubject.asObservable();
   }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  public get currentUserTknValue(): any {
    return this.currentUserTknSubject.value;
  }

  public get currentAccessValue(): any{
    return this.currentAccessTknSubject.value;
  }

  public get currentRefreshValue(): any{
    return this.currentRefreshTknSubject.value;
  }

  login(email: string, password: string, authCode: string) {
    return this.http.post<any>(this.apiURL + '/user/login', { "Email": email, "Password": password })
      .pipe(
          map(user => {
              if (user && user.token && user.Code == 100) {
                  // store user details in local storage to keep user logged in
                  sessionStorage.setItem('TC247_TKN', JSON.stringify(user.token));
                  this.currentUserTknSubject.next(user.token);
                  sessionStorage.setItem('TC247_ACT', JSON.stringify(user.access));
                  this.currentAccessTknSubject.next(user.access);
                  sessionStorage.setItem('TC247_REF', JSON.stringify(user.refresh));
                  this.currentRefreshTknSubject.next(user.refresh);

                  let data = user.user;
                  if (user.super_admin == 1){
                    data.Email_Adm = data.Email;
                    data.User_Adm = data.User_Id;
                    sessionStorage.setItem('TC247_ADM', JSON.stringify('c4ca4238a0b923820dcc509a6f75849b'));
                    this.currentSuperAdminSubject.next(user.super_admin);
                  }else{
                    sessionStorage.setItem('TC247_ADM', JSON.stringify('undefined'));
                    this.currentSuperAdminSubject.next('undefined');
                  }

                  sessionStorage.setItem('TC247_USS', JSON.stringify(data));
                  this.currentUserSubject.next(user.user);
              }
              return user;
          }),
          catchError(this.errorHandler)
      );
  }
  errorHandler(error) {
    return throwError(error || 'Server Error');
  }
  businessId() {
    let user = JSON.parse(sessionStorage.getItem('TC247_USS'));
    return user.Business_Id;
  }
  businessName(){
    let user = JSON.parse(sessionStorage.getItem('TC247_USS'));
    return user.Business_Name;
  }
  userId(){
    let user = JSON.parse(sessionStorage.getItem('TC247_USS'));
    return user.User_Id;
  }
  email(){
    let user = JSON.parse(sessionStorage.getItem('TC247_USS'));
    return user.Email;
  }
  cognitoUser(){
    let user = JSON.parse(sessionStorage.getItem('TC247_USS'));
    return user.UsrCog;
  }
  currentToken() {
    return this.currentUserTknSubject.value;
  }
  currentAccessToken(){
    return this.currentAccessTknSubject.value;
  }
  currentRefreshToken(){
    return this.currentRefreshTknSubject.value;
  }
  superAdmin(){
    let adm = JSON.parse(sessionStorage.getItem('TC247_ADM'));
    return adm;
  }
  avatar(){
    let user = JSON.parse(sessionStorage.getItem('TC247_USS'));
    return user.Avatar;
  }
  language() {
    let user = JSON.parse(sessionStorage.getItem('TC247_USS'));
    let lang;
    if (user.Language == ""){
      if (window.location.href.indexOf("/es/") > -1){
        lang = "ES";
      } else {
        lang = "EN";
      }
    } else {
      lang = user.Language;
    }
    return lang;
  }
  get userAvatar() {
    if (sessionStorage.getItem('TC247_USS') != null) {
      var user = JSON.parse(sessionStorage.getItem('TC247_USS'));
      if (user.Avatar !== null) {
        return environment.bucket + user.Avatar;
      }
    }
    return null;
  }
  getUserProfile() {
    if (sessionStorage.getItem('TC247_USS') != null) {
      var user = JSON.parse(sessionStorage.getItem('TC247_USS'));
      return user;
    }
    return null;
  }
  setUserAvatar(imgUrl) {
    if (this.getUserProfile() != null) {
      var user = this.getUserProfile();
      user.Avatar = imgUrl;
      this.setUserProfile(user);
    }
  }
  setUserProfile(userProfile) {
    sessionStorage.setItem('TC247_USS', JSON.stringify(userProfile));
  }
  roleId(){
    let user = JSON.parse(sessionStorage.getItem('TC247_USS'));
    return user.Role_Id;
  }
  isAdmin(){
    let user = JSON.parse(sessionStorage.getItem('TC247_USS'));
    return user.Is_Admin;
  }
  logout() {
    this.currentUserSubject.next(null);
    this.currentUserTknSubject.next(null);
    this.currentAccessTknSubject.next(null);
    this.currentRefreshTknSubject.next(null);
    this.currentSuperAdminSubject.next(null);
    sessionStorage.removeItem('TC247_USS');
    sessionStorage.removeItem('TC247_TKN');
    sessionStorage.removeItem('TC247_ACT');
    sessionStorage.removeItem('TC247_REF');
    sessionStorage.removeItem('TC247_ADM');
    window.localStorage.setItem('CREDENTIALS_FLUSH', 'tknTucita');
    window.localStorage.removeItem('CREDENTIALS_FLUSH');
  }
}
