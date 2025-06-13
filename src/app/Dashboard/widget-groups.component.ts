import { Component, ElementRef, inject, viewChild } from "@angular/core";
import { DashboardService } from "../Services/dashboard.service";
import {wrapGrid} from "animate-css-grid"
import {CdkDragDrop, DragDropModule} from '@angular/cdk/drag-drop';
import { DashboardHeaderComponent } from "./widget-menu-button.component";
import { DashboardSignalRService } from "../Services/dashboard-signalr.service";
import { WidgetComponent } from "./widgets/widget.component";

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [WidgetComponent, DragDropModule, DashboardHeaderComponent],
    template: ` 
        <app-dashboard-header></app-dashboard-header>
        <div #dashboard class="dashboard-widgets" cdkDropListGroup> 
            @for (w of store.addedWidgets(); track w.label){
                <app-widget cdkDropList [data]="w" (cdkDropListDropped)="drop($event)" [cdkDropListData]="w.label" />
            }
        </div>
        `,
    styles: `
        .dashboard-widgets {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 16px;
            grid-auto-rows: 150px;
        }
    `
})

export class DashboardComponent {
    
    store = inject(DashboardService);
    signalRservice = inject(DashboardSignalRService);

    dashboard = viewChild.required<ElementRef>('dashboard');

    ngOnInit(){
        
        this.signalRservice.startConnection();
        //for animation
        wrapGrid(this.dashboard().nativeElement, { duration: 300 });
    }

    drop(event: CdkDragDrop<string, any>){
        const { previousContainer, container} = event;
        this.store.updateWidgetPosition(previousContainer.data, container.data)
    }

}