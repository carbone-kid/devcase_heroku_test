/*Core*/
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

/*Modules*/
import { LayoutModule } from '../layout/layout.module';
import { UtilsModule } from '../shared/utils/utils.module';
import { FormsModule } from '@angular/forms';

/*Service*/
import { DashboardService } from './dashboard.service';

/*Components*/
import { DevcasesTableComponent } from './devcases-table/devcases-table.component';
import { AddCandidateFormComponent } from './add-candidate-form/add-candidate-form.component';
import { DashboardComponent } from './dashboard.component';
import { AdminComponent } from './admin/admin.component';

@NgModule({
  declarations: [
    AddCandidateFormComponent,
    AdminComponent,
    DevcasesTableComponent,
    DashboardComponent
  ],
  exports: [
    AddCandidateFormComponent,
    AdminComponent,
    DevcasesTableComponent,
    DashboardComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    LayoutModule,
    UtilsModule
  ],
  providers: [DashboardService]
})
export class DashboardModule {
}
