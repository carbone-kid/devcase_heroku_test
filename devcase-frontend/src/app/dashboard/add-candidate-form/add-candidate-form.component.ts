import { Component, ViewChild } from '@angular/core';
import { Log } from 'ng2-logger';
import { LOG_CONFIG } from '../../../assets/config/log-config';
import { DevcaseRequest } from '../../shared/models/devcase-request.model';
import { DevCaseService } from '../../shared/services/devcase.service';
import { AlertService } from '../../shared/services/alert.service';
import { DashboardService } from '../dashboard.service';
import { MinDateValidator } from '../../shared/utils/min-date.validator';
import { FormControl } from '@angular/forms';

const log = Log.create('Form\'s Component');
log.color = LOG_CONFIG.form;

@Component({
  selector: 'add-candidate-form',
  templateUrl: './add-candidate-form.component.html',
  styleUrls: ['./add-candidate-form.component.scss']
})
export class AddCandidateFormComponent {
  @ViewChild('f') form: any;
  emailPattern = '[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$';

  devCase = <DevcaseRequest>{};
  loading = false;

  constructor(private devCaseService: DevCaseService,
              private alertService: AlertService,
              private dashboardService: DashboardService) {
  }

  onSubmit() {
    if (this.form.valid) {
      log.info('Form valid, submitting');
      this.createDevCase();
    }
  }

  createDevCase() {
    this.loading = true;
    this.alertService.info('We are saving the DevCase. Please wait.');
    this.devCaseService.create(this.devCase).subscribe(
      () => {
        this.alertService.success('The DevCase has been successfully created');
        this.dashboardService.devCaseCreated();
        this.form.reset();
        this.devCase = <DevcaseRequest>{};
        this.loading = false;
      },
      (error) => {
        log.error('Error trying to create new DevCase', error);
        this.alertService.error('An error occurred while trying to create a new DevCase. Please try again or contact the dev team.');
        this.loading = false;
      }
    );
  }

  private validateDeadline(c: FormControl) {

    return c.value > new Date() ? null:
      {  validateDeadline: {
        valid: false
      }
    };
  }
}
