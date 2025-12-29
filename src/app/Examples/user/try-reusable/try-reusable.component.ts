import { Component, inject, OnInit } from '@angular/core';
import { DashboardSignalRService } from '../../../Services/dashboard-signalr.service';
import { SubscribersComponent, WidgetComponent } from '../../../Dashboard';
import { Widget } from '../../../models/dashboard';
import { DashboardService } from '../../../Services/dashboard.service';

@Component({
  selector: 'app-try-reusable',
  standalone: true,
  imports: [ WidgetComponent ],
  templateUrl: './try-reusable.component.html',
})
export class TryReusableComponent implements OnInit {
  signalRservice = inject(DashboardSignalRService);
  dashService = inject(DashboardService);
  
  ngOnInit(){
    this.signalRservice.startConnection();
  }

  subscribersWidget: Widget = {
    label: "Changed",
    content: SubscribersComponent, 
    backgroundColor: "#0f0249",
    color: "white",
  };
}
