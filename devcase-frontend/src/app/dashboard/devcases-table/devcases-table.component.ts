import { AfterViewChecked, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Log } from 'ng2-logger';
import { LOG_CONFIG } from '../../../assets/config/log-config';
import { DevCaseService } from '../../shared/services/devcase.service';
import { AlertService } from '../../shared/services/alert.service';
import { DashboardService } from '../dashboard.service';
import { STAGES } from '../../shared/models/admin-user-groups.model';

const log = Log.create('Table\'s Component');
log.color = LOG_CONFIG.table;

@Component({
  selector: 'devcases-table',
  templateUrl: './devcases-table.component.html',
  styleUrls: ['./devcases-table.component.scss']
})
export class DevcasesTableComponent implements OnInit, OnDestroy, AfterViewChecked {
  /*The object that will contain our repositories*/
  repositories: any;

  // This object handles the actionChange events
  actionConfirmInfo = {
    repository: null,
    newStage: null
  };

  // error handler object init
  apiError = {
    error: false,
    msg: ''
  };

  stages: any;

  private reposSub: Subscription;

  constructor(private apiService: DevCaseService,
              private alertService: AlertService,
              private dashboardService: DashboardService) {
    this.stages = STAGES;
    this.dashboardService.devCaseCreated$.subscribe(
      (devCaseCreated) => {
        log.info('inside listener');
        if (devCaseCreated) {
          this.loadDevCases();
        }
      },
      (err) => {
        log.error(err);
        this.alertService.error('An issue occurred while trying to update the list of DevCases. ' +
          'If the issues persists please contact the dev team.');
      }
    );
  }

  ngOnInit() {
    this.loadDevCases();
  }

  ngAfterViewChecked() {
    this._initTooltips();
  }

  private _initTooltips() {
    window['jQuery']('[data-toggle="tooltip"]').tooltip();
  }

  private loadDevCases() {
    /*Calling the API backend to get the current repositories*/
    this.reposSub = this.apiService.list().subscribe(
      (repos) => {
        /*We received the data and will assign it. We don't care if it's empty or not, we're handling that in the template*/
        this.repositories = repos;
        log.info('repositories', repos);
      },
      (err) => {
        /*We set our error handler object in order to display useful information to the user in the template*/
        this.apiError.error = true;
        this.apiError.msg = err;
        log.warn('fetching ERROR', err);
        this.alertService.error('An issue occurred while trying to retrieve existing DevCases. Please retry or contact the dev team.');
      }
    );
  }

  changeStage(repository: any, newStage: any) {
    if (repository.stage.id >= newStage.id) return;
    window['jQuery']('#confirmActionModal').modal('show');
    this.actionConfirmInfo.repository = repository;
    this.actionConfirmInfo.newStage = newStage;
    return true;
  }

  confirmStageChange() {
    const repoId = this.actionConfirmInfo.repository.id;
    const that = {
      repositories: this.repositories,
      currentRepository: this.actionConfirmInfo.repository
    };

    this.actionConfirmInfo.repository.stage.id = this.actionConfirmInfo.newStage.id;
    this.alertService.info('We are changing the stage of the devcase for ' + that.currentRepository.candidate.name);
    this.apiService.changeStage(repoId, this.actionConfirmInfo.newStage.id).subscribe(
      (repo) => {
        this.loadDevCases();
        this.alertService.success('We successfully changed the stage of  devcase for: ' + that.currentRepository.candidate.name);
      },
      (err) => {
        this.loadDevCases();
        this.alertService.error('We could not change the stage of the devcase for: ' + that.currentRepository.candidate.name);
        log.error('Stage change failed, repoId ' + repoId, err);
      }
    );
    window['jQuery']('#confirmActionModal').modal('hide');
  }

  ngOnDestroy() {
    if (this.reposSub) {
      this.reposSub.unsubscribe();
    }
  }
}
