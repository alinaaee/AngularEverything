import { Routes } from '@angular/router';
import { UserComponent } from './Examples/user/user.component';
import { DashboardComponent } from './Dashboard/dashboard.component';
import { TestComponent } from './test/test.component';
import { TryHostComponent } from './try-host/try-host.component';

export const routes: Routes = [
    { path: 'dashboard', component: DashboardComponent },
    { path: 'test', component: TestComponent },
    { path: 'tryHost', component: TryHostComponent}
];
