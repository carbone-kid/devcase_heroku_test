import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../shared/services/authentication.service';
import { Subscription } from 'rxjs/Subscription';
import { User } from '../../shared/models/user.model';
import { Log } from 'ng2-logger';
import { LOG_CONFIG } from '../../../assets/config/log-config';
import { AlertService } from '../../shared/services/alert.service';

const log = Log.create('Header\'s Component');
log.color = LOG_CONFIG.header;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  user: User;

  private signOutSubscription: Subscription;

  constructor(private authService: AuthenticationService,
              private router: Router,
              private ngZone: NgZone,
              private alertService: AlertService) {
  }

  logout() {
    // Using AuthenticationService it will attempt to sign out.
    this.signOutSubscription = this.authService.signOut().subscribe(
      () => {
        // It successfully signed out of the application. We'll proceed to navigate to login page.
        log.info('logged out OK ');
        this.ngZone.run(() => this.router.navigateByUrl('/login'));
      },
      (err) => {
        // The logout failed. Error gets handled and displayed accordingly
        log.warn(err);
        this.alertService.warn('An error occurred while trying to log out. Please try again.');
      }
    );
  }

  goHome() {
    this.ngZone.run(() => this.router.navigateByUrl('/'));
  }

  ngOnInit() {
    // Gets the user object stored in the sessionStorage.
    // This user obj is not a GoogleUser obj but is out Backend's object
    this.user = JSON.parse(sessionStorage.getItem('currentUser'));
  }

  ngOnDestroy() {
    if (this.signOutSubscription) {
      this.signOutSubscription.unsubscribe();
    }
  }
}
