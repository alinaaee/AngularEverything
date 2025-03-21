import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { DashboardSignalRService } from '../../../Services/dashboard-signalr.service';

@Component({
  selector: 'app-revenue',
  imports: [MatIconModule],
  template: `
    <div class="d-flex fs-5">
      <p class="stat mb-0 mx-1">{{signalRservice.contractorCount()}}</p>
      <mat-icon class="text-success">check_circle</mat-icon>
    </div>
    <div class="fw-light stat-subtext">
      <span>+502</span> in the last 24 days
    </div>
    
  `,
  styles: [`
    
  `]
})
export class RevenueComponent {
  signalRservice = inject(DashboardSignalRService);
}
