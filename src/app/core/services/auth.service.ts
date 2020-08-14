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

  public currentUser: Observable<User>;
  public currentTkn: Observable<any>;
  public currentAccessTkn: Observable<any>;
  public currentRefresh: Observable<any>;

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
                  sessionStorage.setItem('TC247_USS', JSON.stringify(user.user));
                  this.currentUserSubject.next(user.user);
                  sessionStorage.setItem('TC247_TKN', JSON.stringify(user.token));
                  this.currentUserTknSubject.next(user.token);
                  sessionStorage.setItem('TC247_ACT', JSON.stringify(user.access));
                  this.currentAccessTknSubject.next(user.access);
                  sessionStorage.setItem('TC247_REF', JSON.stringify(user.refresh));
                  this.currentRefreshTknSubject.next(user.refresh);
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
  avatar(){
    let user = JSON.parse(sessionStorage.getItem('TC247_USS'));
    return user.Avatar;
  }
  language() {
    let user = JSON.parse(sessionStorage.getItem('TC247_USS'));
    return user.Language;
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
    sessionStorage.removeItem('TC247_USS');
    this.currentUserSubject.next(null);
    sessionStorage.removeItem('TC247_TKN');
    this.currentUserTknSubject.next(null);
    sessionStorage.removeItem('TC247_ACT');
    this.currentAccessTknSubject.next(null);
    sessionStorage.removeItem('TC247_REF');
    this.currentRefreshTknSubject.next(null);
  }
}
