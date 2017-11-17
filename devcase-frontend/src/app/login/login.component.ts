import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { AuthenticationService } from '../shared/services/authentication.service';
import { Log } from 'ng2-logger';
import { LOG_CONFIG } from '../../assets/config/log-config';
import { AlertService } from '../shared/services/alert.service';

const log = Log.create('Login Component');
log.color = LOG_CONFIG.login;

@Component({
  selector: 'login',
  templateUrl: 'login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  returnUrl: string;

  private signIngSub: Subscription;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private _authenticationService: AuthenticationService,
              private ngZone: NgZone,
              private alertService: AlertService) {
  }

  ngOnInit() {
    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

  }

  login() {
    // We use the AuthenticationService service to login with Google
    this.signIngSub = this._authenticationService.signIn().subscribe(
      () => {
        log.info('success when logging in with Google');

        // Google login has been successful therefore we'll call the backend to perform a security check
        this._authenticationService.login({token: sessionStorage.getItem(AuthenticationService.SESSION_STORAGE_KEY)}).subscribe(
          (user) => {
            // The backend security check was successful and we'll store the object returned in the sessionStorage
            sessionStorage.setItem(AuthenticationService.USER_STORAGE_KEY, JSON.stringify(user));

            log.info('success when requesting security check to BE', user);

            // After the successful login and security checks we'll redirect the authorized user to the dashboard
            this.ngZone.run(() => this.router.navigateByUrl(this.returnUrl));
          },
          (error) => {
            // The Google account has not passed our backend security checks
            // We'll handle and display this error
            log.warn('error when requesting security check to BE', error);
            this.alertService.error('An error occurred while trying to login. Please check that your account has permissions to access this application.');
          }
        );
      },
      (err) => {
        // The Google login attempt failed. We handle and display the error
        log.warn('err when logging in', err);
        if (err.error === 'popup_blocked_by_browser') {
          this.alertService.error('Your browser blocked the pop-up. Please try again. If the problem persists unblock pop-ups for this page in your browser.');
        }
      }
    );
  }

  ngOnDestroy() {
    if (this.signIngSub) {
      this.signIngSub.unsubscribe();
    }
  }
}
