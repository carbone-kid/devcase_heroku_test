import { Injectable, NgZone } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService } from '../shared/services/authentication.service';
import { Log } from 'ng2-logger';
import { LOG_CONFIG } from '../../assets/config/log-config';

const log = Log.create('AuthGuard');
log.color = LOG_CONFIG.service;

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private router: Router,
              private authService: AuthenticationService,
              private ngZone: NgZone) {
  }

  // The canActivate() method is the responsable for allowing the user into the app
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // We get current token from the AuthenticationService
    let currentToken = this.authService.getToken();

    log.data('inside canActivate, user logged in? ', this.authService.isUserSignedIn());

    // We check that we actually have a token and that the user is signed in.
    // If fails, we'll always redirect the user to the login page blocking the access to the app
    if (!this.authService.isUserSignedIn() && !currentToken) {
      this.ngZone.run(() => this.router.navigate(['/login'], {queryParams: {returnUrl: state.url}}));
      return false;
    }
    return true;
  }
}
