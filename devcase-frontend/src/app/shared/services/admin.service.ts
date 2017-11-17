import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Log } from 'ng2-logger';
import { LOG_CONFIG } from '../../../assets/config/log-config';
import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';
import { DevcaseRequest } from '../models/devcase-request.model';

const log = Log.create('DevCaseService');
log.color = LOG_CONFIG.service;

/**
 * The service for interacting with the application
 */
@Injectable()
export class AdminService {
  constructor(private apiService: ApiService) {
  }

  private backendUrl = environment.backendUrl;

  /**
   * Returns the list of stages calling the endpoint URL: `/devcase`
   *
   * @returns {Observable<any>}
   */
  listStages(): Observable<any> {
    return this.apiService.fetch('/admin/devcase');
  }

  /**
   * Returns the list of stages calling the endpoint URL: `/devcase`
   *
   * @returns {Observable<any>}
   */
  listRolesTemplatesByStage(stageId: number): Observable<any> {
    const endpointUrl = `/admin/role/${stageId}`;
    return this.apiService.fetch(endpointUrl);
  }

  /**
   * Creates a new DevCase passing as parameter the new DevCase object retrieved from the form
   *
   * @param {string} stageId
   * @param {string} roleId
   * @param {string} template
   * @returns {Observable<any>}
   */
  assignRecipient(stageId: number, roleId: number, template: number): Observable<any> {
    let body = {
      role: roleId,
      stage: stageId,
      template: template
    };

    const endpointUrl = `/admin/notifications/role`;
    return this.apiService.send(endpointUrl, body);
  }

  removeRecipient(stageId: number, roleId: number, templateId: number): Observable<any> {
    const endpointUrl = `/admin/notifications/role/${roleId}/${stageId}/${templateId}`;
    return this.apiService.delete(endpointUrl);
  }

}
