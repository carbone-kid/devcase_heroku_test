import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { AlertService } from '../../shared/services/alert.service';
import { AdminService } from '../../shared/services/admin.service';
import { ROLES_STAGES_TEMPLATES, STAGES } from '../../shared/models/admin-user-groups.model';
import { ApiService } from '../../shared/services/api.service';
import { LOG_CONFIG } from '../../../assets/config/log-config';
import { Log } from 'ng2-logger';
import { Roles } from '../../shared/models/roles.model';

const log = Log.create('Admin Component');
log.color = LOG_CONFIG.table;

@Component({
  selector: 'manage-notifications',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit, OnDestroy {
  private reposSub: Subscription;
  private stages = STAGES.items;
  private modelState = [];

  // error handler object init
  apiError = {
    error: false,
    msg: ''
  };
  private allRecipients: Roles[];

  private model = [[], [], [], [], []];
  availableRecipients = [[], [], [], [], []];

  // availableRecipients = [];

  constructor(private alertService: AlertService,
              private adminService: AdminService,
              private apiService: ApiService) {
  }

  ngOnInit() {
    this.apiService.fetch('/admin/role').subscribe(
      (roles) => {
        log.info(roles);
        this.allRecipients = roles;

        this.initModel(this.stages);
        this.loadMappings();
      },
      (err) => {
        log.error(err);
      }
    );
  }

  private initModel = (stages) => {
    if (!this.modelState) {
      this.modelState = [];
    }
    if (!this.model) this.model = [];

    for (const stage of stages) {
      this.modelState[stage.id] = {};
      this.model[stage.id] = [];
    }
  }

  private computeRecipients = (stage) => {
    this.availableRecipients[stage.id] = [];
    this.model[stage.id] = this.model[stage.id] || [];
    const selectedOptions = this.model[stage.id];
    const selectedOptionsIndex = {};
    for (const option of selectedOptions) {
      selectedOptionsIndex[option.role.id] = true;
    }
    const availableOptions = [];

    for (const option of this.allRecipients) {
      if (!selectedOptionsIndex[option.id]) {
        availableOptions.push(option);
      }
    }

    this.availableRecipients[stage.id] = availableOptions.sort(
      (a, b) => a.name < b.name ? -1 : 1
    );
  }

  private loadMappings() {
    for (const stage of this.stages) {
      const stageId = stage.id;
      this.modelState[stageId].error = false;
      this.modelState[stageId].loading = true;
      const that = {
        stage: stage
      };

      this.reposSub = this.adminService.listRolesTemplatesByStage(stageId).subscribe(
        (rolesByStage) => {
          /*We received the data and will assign it. We don't care if it's empty or not, we're handling that in the template*/
          this.model[that.stage.id] = rolesByStage;
          this.modelState[that.stage.id].loading = false;
          this.modelState[that.stage.id].error = false;
          this.computeRecipients(that.stage);
        },
        (err) => {
          this.modelState[that.stage.id].loading = false;
          this.modelState[that.stage.id].error = true;
          /*We set our error handler object in order to display useful information to the user in the template*/
          /*this.alertService.error('An issue occurred while trying to retrieve existing configuration. ' +
            'Please retry or contact the dev team.');*/
          this.alertService.error('The following error occurred: ' + err.message);

        }
      );
    }
  }

  remove(stage, index) {
    this.alertService.info('We are updating your settings.');
    const removedRecipient = this.model[stage.id].splice(index, 1)[0];
    this.availableRecipients[stage.id].push(removedRecipient.role);
    this.availableRecipients[stage.id] = this.availableRecipients[stage.id].sort((a, b) => {
      return a.name < b.name ? -1 : 1;
    });
    const templateId = ROLES_STAGES_TEMPLATES[removedRecipient.role.id][stage.id];
    this.adminService.removeRecipient(stage.id, removedRecipient.role.id, templateId).subscribe(
      () => {
        this.alertService.success('The recipient has been successfully removed.');
      },
      (err) => {
        //this.alertService.error('An error occurred while trying to assign a recipient. Please try again or contact the dev team.');
        this.alertService.error('The following error occurred: ' + err.message);
      }
    );
  }

  add(stage, index) {
    if (index == null) return;
    index = parseInt(index);
    let selectedRecipient = this.availableRecipients[stage.id].splice(index, 1)[0];
    const templateId = ROLES_STAGES_TEMPLATES[selectedRecipient.id][stage.id];
    if (templateId == null) {
      this.alertService.error('We could not find a valid template for the desired configuration. Your changes will not be saved.');
      //this.rollbackOptions(stage, selectedRecipient);
    }
    else {
      this.alertService.info('We are updating your settings.');
      this.model[stage.id].push({role: selectedRecipient, stage: stage});
      this.model[stage.id] = this.model[stage.id].sort((a, b) => {
        return a.name < b.name ? -1 : 1;
      });
      const that = {
        stage: stage,
        selectedRecipient: selectedRecipient
      };
      this.adminService.assignRecipient(stage.id, selectedRecipient.id, templateId).subscribe(
        () => {
          this.alertService.success('The recipient has been successfully added.');
        },
        (error) => {
          this.rollbackOptions(that.stage, that.selectedRecipient);
          this.alertService.error('An error occurred while trying to assign a recipient. Please try again or contact the dev team.');
        }
      );
    }
  }

  private rollbackOptions(stage: any, recipient: any) {
    this.availableRecipients[stage.id].push(recipient);
  }

  ngOnDestroy() {
    if (this.reposSub) {
      this.reposSub.unsubscribe();
    }
  }
}
