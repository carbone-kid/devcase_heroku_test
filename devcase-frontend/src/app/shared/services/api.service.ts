import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { environment } from '../../../environments/environment';
import { Log } from 'ng2-logger';
import { LOG_CONFIG } from '../../../assets/config/log-config';

const log = Log.create('ApiService');
log.color = LOG_CONFIG.service;

/**
 * The service layer between the DevCaseService and the HttpClient requests to the backend
 */
@Injectable()
export class ApiService {
  private headers: HttpHeaders;
  private backendUrl = environment.backendUrl;

  constructor(private http: HttpClient) {
    this.headers = new HttpHeaders()
      .set('Content-Type', 'application/json');
  }

  fetch(url: string): Observable<any> {
    return this.http
      .get(this.backendUrl + url, {withCredentials: true})
      .map(this.extractData)
      .catch(this.handleError);
  }

  send(url: string, body: any): Observable<any> {
    return this.http
      .post(this.backendUrl + url, JSON.stringify(body), {headers: this.headers, withCredentials: true})
      .map(this.extractData)
      .catch(this.handleError);
  }

  delete(url: string): Observable<any> {
    return this.http
      .delete(this.backendUrl + url, {headers: this.headers, withCredentials: true})
      .map(this.extractData)
      .catch(this.handleError);
  }

  /**
   * Method that handles the response of the API call
   *
   * @param {HttpResponse<any>} res
   * @returns {any}
   */
  private extractData(res: HttpResponse<any>) {
    const body = res;
    if (body) {
      return body;
    } else {
      return {};
    }
  }

  /**
   * Method to handle the error of the API call
   *
   * @param error
   * @returns {ErrorObservable}
   */
  private handleError(error: any) {
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body || JSON.stringify(body);
      errMsg = error.toString() + '; ' + err;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    log.error(errMsg);
    return Observable.throw(errMsg);
  }

  /**
   * Serializes an object to be sent in a post request
   *
   * @param obj
   * @param {any} prefix
   * @returns {string}
   */
  private serializeObj = function (obj, prefix = null) {
    let str = [], p;
    for (p in obj) {
      if (obj.hasOwnProperty(p)) {
        let k = prefix ? prefix + '[' + p + ']' : p, v = obj[p];
        str.push((v !== null && typeof v === 'object') ?
          this.serializeObj(v, k) :
          encodeURIComponent(k) + '=' + encodeURIComponent(v));
      }
    }
    return str.join('&');
  };
}
