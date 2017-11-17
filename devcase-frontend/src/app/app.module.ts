/*Core*/
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { routing } from './app.routing';

/*Services*/
import { ApiService } from './shared/services/api.service';
import { DevCaseService } from './shared/services/devcase.service';
import { AuthGuard } from './guards/auth.guard';
import { AuthenticationService } from './shared/services/authentication.service';
import { AlertService } from './shared/services/alert.service';
import { AdminService } from './shared/services/admin.service';

/*Modules*/
import { DashboardModule } from './dashboard/dashboard.module';

/*Components*/
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { ClientConfig, GoogleApiModule, NG_GAPI_CONFIG } from 'ng-gapi';
import { MinDateValidator } from './shared/utils/min-date.validator';

const GOOGLE_CLIENT_ID = '189868751709-oq1sgg1qkgj49h6pdk88uvfqiipmhlns.apps.googleusercontent.com';

let gapiClientConfig: ClientConfig = {
  clientId: GOOGLE_CLIENT_ID,
  discoveryDocs: [],
  // uncomment this later, after the changes in the console are propagated
  // ux_mode: 'redirect',
  // redirect_uri: 'http://localhost:4200/',
  scope: [].join(' ')
};

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MinDateValidator
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    DashboardModule,
    routing,
    GoogleApiModule.forRoot({
      provide: NG_GAPI_CONFIG,
      useValue: gapiClientConfig
    }),
  ],
  providers: [
    ApiService,
    AuthGuard,
    AuthenticationService,
    DevCaseService,
    AlertService,
    AdminService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
