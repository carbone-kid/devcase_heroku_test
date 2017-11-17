import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs/Rx';
import { Log } from 'ng2-logger';
import { LOG_CONFIG } from '../../assets/config/log-config';

const log = Log.create('DashboardService');
log.color = LOG_CONFIG.service;

@Injectable()
export class DashboardService {
  // Observables for our components to subscribe to.
  devCaseCreated$: Observable<any>;

  // Subjects to return data to subscribed components
  private devCaseCreatedSubject = new Subject<any>();

  constructor() {
    this.devCaseCreated$ = this.devCaseCreatedSubject.asObservable();
  }

  // Triggers subscribed components, returns true and therefore the subscribed
  // component will be able to know when to update the table
  devCaseCreated() {
    log.info('inside devCaseCreated()');
    this.devCaseCreatedSubject.next(true);
  }
}
