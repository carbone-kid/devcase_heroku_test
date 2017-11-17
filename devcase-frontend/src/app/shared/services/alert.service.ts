import { Injectable } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';

import { AlertType } from '../models/alert';

@Injectable()
export class AlertService {
  private keepAfterRouteChange = false;

  constructor(private router: Router) {
    // clear alert messages on route change unless 'keepAfterRouteChange' flag is true
    router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        if (this.keepAfterRouteChange) {
          // only keep for a single route change
          this.keepAfterRouteChange = false;
        } else {
          // clear alert messages
          this.clear();
        }
      }
    });
  }

  success(message: string, keepAfterRouteChange = false) {
    this.alert(AlertType.Success, message, keepAfterRouteChange);
  }

  error(message: string, keepAfterRouteChange = false) {
    this.alert(AlertType.Error, message, keepAfterRouteChange);
  }

  info(message: string, keepAfterRouteChange = false) {
    this.alert(AlertType.Info, message, keepAfterRouteChange);
  }

  warn(message: string, keepAfterRouteChange = false) {
    this.alert(AlertType.Warning, message, keepAfterRouteChange);
  }

  alert(type: AlertType, message: string, keepAfterRouteChange = false) {
    this.keepAfterRouteChange = keepAfterRouteChange;

    switch (type) {
      case AlertType.Success:
        window['toastr'].success(message);
        break;
      case AlertType.Error:
        window['toastr'].error(message);
        break;
      case AlertType.Info:
        window['toastr'].info(message);
        break;
      case AlertType.Warning:
        window['toastr'].warning(message);
        break;
    }
  }

  clear() {
    /* TODO: this function removes all the displayed alerts.
       *  It can be used to hide all the alerts when the route changes.
       */
  }
}
