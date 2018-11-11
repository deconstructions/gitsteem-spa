import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { routing }        from './app.routing';

import { AuthGuard } from './guards/index';
import { JwtInterceptor } from './helpers/index';
import { AuthenticationService } from './services/index';
import { AppComponent } from './app.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { IssuesComponent } from './issues/issues.component';

@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    HomeComponent,
    ProfileComponent,
    IssuesComponent
  ],
    imports: [
    routing,
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    HttpClientModule,
    FormsModule
  ],
    providers: [
        AuthGuard,
        AuthenticationService],
  bootstrap: [AppComponent]
})
export class AppModule { }
