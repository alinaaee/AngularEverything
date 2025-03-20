import { Routes } from '@angular/router';
import { UserComponent } from './Examples/user/user.component';
import { DashboardComponent } from './Dashboard/dashboard.component';
import { TryHostComponent } from './try-host/try-host.component';
import { ExcelToPdfConverterComponent } from './ExcelToPdf/excel-to-pdf-converter.component';

export const routes: Routes = [
    { path: 'dashboard', component: DashboardComponent },
    { path: 'tryHost', component: TryHostComponent},
    { path: 'convert', component: ExcelToPdfConverterComponent}
];
