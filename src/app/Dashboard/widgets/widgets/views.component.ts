import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { DashboardSignalRService } from '../../../Services/dashboard-signalr.service';

@Component({
  selector: 'app-views',
  imports: [MatIconModule],
  template:`
  <div class="d-flex fs-5">
    <p class="stat mb-0 mx-1">{{signalRservice.viewsCount()}}</p>
    <mat-icon class="text-success">visibility</mat-icon>
  </div>
  <div class="fw-light stat-subtext">
    <span>+502</span> in the last 24 days
  </div>
  `
})
export class ViewsComponent {
  signalRservice = inject(DashboardSignalRService);
}
