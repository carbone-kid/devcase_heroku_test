import { Injectable, NgZone } from '@angular/core';
import * as _ from 'lodash';
import { GoogleAuthService } from 'ng-gapi/lib/GoogleAuthService';
import GoogleUser = gapi.auth2.GoogleUser;
import { Observable } from 'rxjs/Observable';
import { Log } from 'ng2-logger';
import { LOG_CONFIG } from '../../../assets/config/log-config';
import { UserLoginRequest } from '../models/user-login-request.model';
import { ApiService } from './api.service';
import { User } from '../models/user.model';

const log = Log.create('AuthenticationService');
log.color = LOG_CONFIG.service;

@Injectable()
export class AuthenticationService {
  public static readonly SESSION_STORAGE_KEY: string = 'accessToken';
  public static readonly USER_STORAGE_KEY: string = 'currentUser';
  private user: GoogleUser = undefined;

  constructor(private googleAuthService: GoogleAuthService,
              private apiService: ApiService,
              private ngZone: NgZone) {
  }

  /**
   * Returns the current token stored in sessionStorage if found, else returns false
   *
   * @returns {any}
   */
  public getToken(): any {
    const token: string = sessionStorage.getItem(AuthenticationService.SESSION_STORAGE_KEY);
    if (!token) {
      return false;
    }
    return sessionStorage.getItem(AuthenticationService.SESSION_STORAGE_KEY);
  }

  /**
   * Signs in with Google API. First asks for authorization to Google, and then calls the signIn() method that
   * returns a Promise, but we wrapped it all in an Observable.
   *
   * @returns {Observable<void>}
   */
  public signIn(): Observable<void> {
    return this.googleAuthService.getAuth().mergeMap(
      (auth) => {
        return auth.signIn().then(
          res => {
            // We handle the response by adding the token to sessionStorage
            this.signInSuccessHandler(res);
          },
          // An error occurred during the sign in process, we'll return the error within the Observable
          err => Observable.throw(err)
        );
      },
      (error) => {
        log.warn('An error occurred while trying to getAuth()', error);
        Observable.throw(error)
      }
    );
  }

  /**
   * Signs out with Google API. First asks for authorization to Google, and then calls the signOut() method that
   * returns a Promise, but we wrapped it all in an Observable.
   *
   * @returns {Observable<void>}
   */
  public signOut(): Observable<void> {
    return this.googleAuthService.getAuth().mergeMap(
      (auth) => {
        return auth.signOut().then(
          () => {
            // Sign out was successful, therefore we remove from the sessionStorage the token and out User object
            sessionStorage.removeItem(AuthenticationService.SESSION_STORAGE_KEY);
            sessionStorage.removeItem(AuthenticationService.USER_STORAGE_KEY);
          },
          // An error occurred during the sign out process, we'll return the error within the Observable
          err => Observable.throw(err)
        );
      },
      (error) => {
        log.warn('An error occurred while trying to getAuth()', error);
        Observable.throw(error)
      }
    );
  }

  /**
   * It checks if the user is signed in by checking the sessionStorage.
   *
   * @returns {boolean}
   */
  public isUserSignedIn(): boolean {
    return !_.isEmpty(sessionStorage.getItem(AuthenticationService.SESSION_STORAGE_KEY));
  }

  /**
   * Returns the authenticated user
   *
   * @returns {boolean}
   */
  public getSignedInUser(): User {
    const persistedUser = sessionStorage.getItem(AuthenticationService.USER_STORAGE_KEY);
    if (persistedUser != null) {
      const user: User = JSON.parse(persistedUser);
      return user;
    } else {
      return null;
    }

  }


  /**
   * Logs into the application passing to the backend the object retrieved from the previous successful Google authentication
   *
   * @param {UserLoginRequest} userLoginRequest The GoogleUser returned by the successful Google Authentication
   * @returns {Observable<any>}
   */
  login(userLoginRequest: UserLoginRequest): Observable<any> {
    return this.apiService.send('/login', userLoginRequest);
  }

  /**
   * Handles the success when signing in. It will att the token to the sessionStorage and returns a GoogleUser object.
   *
   * @param {gapi.auth2.GoogleUser} res
   * @returns {gapi.auth2.GoogleUser}
   */
  private signInSuccessHandler(res: GoogleUser) {
    this.ngZone.run(
      () => {
        this.user = res;
        const token = res['Zi'].access_token;
        sessionStorage.setItem(
          AuthenticationService.SESSION_STORAGE_KEY, token
        );
      });
    return this.user;
  }
}
