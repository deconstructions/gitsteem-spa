import { Routes, RouterModule } from '@angular/router';
 
import { HomeComponent } from './home/home.component';
import { ProfileComponent} from './profile/profile.component';
import { IssuesComponent } from './issues/issues.component'
import { AuthGuard } from './guards/index';
import { ExploreComponent } from './explore/explore.component';
 
const appRoutes: Routes = [
    { path: '', component: HomeComponent, pathMatch: 'full' },
    { path: 'profile', component: ProfileComponent },
    { path: 'issues', component: IssuesComponent, canActivate: [AuthGuard] },
    { path: 'explore', component: ExploreComponent, canActivate: [AuthGuard] }
    ];
   
export const routing = RouterModule.forRoot(appRoutes);