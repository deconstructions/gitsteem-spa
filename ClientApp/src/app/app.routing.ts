import { Routes, RouterModule } from '@angular/router';
 
import { HomeComponent } from './home/home.component';
import { CounterComponent} from './counter/counter.component';
import { FetchDataComponent } from './fetch-data/fetch-data.component'
import { AuthGuard } from './guards/index';
 
const appRoutes: Routes = [
    { path: '', component: HomeComponent, pathMatch: 'full' },
    { path: 'counter', component: CounterComponent, canActivate: [AuthGuard] },
    { path: 'fetch-data', component: FetchDataComponent, canActivate: [AuthGuard] }
    ];
   
export const routing = RouterModule.forRoot(appRoutes);