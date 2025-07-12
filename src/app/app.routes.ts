import { Routes } from '@angular/router';
import { DashboardComponent } from './Dashboard/widget-groups.component';
import { TryHostComponent } from './try-host/try-host.component';
import { ExcelToPdfConverterComponent } from './ExcelToPdf/excel-to-pdf-converter.component';
import { TryReusableComponent } from './Examples/user/try-reusable/try-reusable.component';
import { InfiniteScrollingComponent } from './infinite-scrolling/infinite-scrolling.component';

export const routes: Routes = [
    { path: 'dashboard', component: DashboardComponent },
    { path: 'convert', component: ExcelToPdfConverterComponent},
    { path: 'tryHost', component: TryHostComponent},
    { path: 'reusable', component: TryReusableComponent},
    { path: 'infiniteScroll', component: InfiniteScrollingComponent},
    { path: '**', redirectTo: '/convert' }
];
