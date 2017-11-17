/*Core*/
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

/*Modules*/
import { UtilsModule } from '../shared/utils/utils.module';

/*Components*/
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';


@NgModule({
  declarations: [
    FooterComponent,
    HeaderComponent
  ],
  exports: [
    FooterComponent,
    HeaderComponent
  ],
  imports: [
    BrowserModule,
    UtilsModule
  ],
  providers: []
})
export class LayoutModule {
}
