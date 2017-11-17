import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Log } from 'ng2-logger';
import { LOG_CONFIG } from '../../../assets/config/log-config';
import { ApiService } from './api.service';
import { UserLoginRequest } from '../models/user-login-request.model';
import { DevcaseRequest } from '../models/devcase-request.model';

const log = Log.create('DevCaseService');
log.color = LOG_CONFIG.service;

/**
 * The service for interacting with the application
 */
@Injectable()
export class DevCaseService {
  constructor(private apiService: ApiService) {
  }

  /**
   * Returns the list of devcases calling the endpoint URL: `/devcase`
   *
   * @returns {Observable<any>}
   */
  list(): Observable<any> {
    return this.apiService.fetch('/devcase');
  }

  /**
   * Updates the current devcase with the stage passed as parameter
   *
   * @param caseId
   * @param stage
   * @returns {Observable<any>}
   */
  changeStage(caseId: any, stageId: any): Observable<any> {
    const endpointUrl = `/devcase/${caseId}/${stageId}`;
    return this.apiService.send(endpointUrl, {});
  }

  /**
   * Creates a new DevCase passing as parameter the new DevCase object retrieved from the form
   *
   * @param {DevcaseRequest} devCase
   * @returns {Observable<any>}
   */
  create(devCase: DevcaseRequest): Observable<any> {
    log.data('create the following DevCase ', devCase);
    return this.apiService.send('/devcase', devCase);
  }
}
