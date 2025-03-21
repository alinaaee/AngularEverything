import { Component, input, signal } from "@angular/core";
import {CommonModule, NgComponentOutlet} from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { CdkDrag, CdkDragPlaceholder } from "@angular/cdk/drag-drop";
import { WidgetOptionsComponent } from "./widget-options/widget-options.component";
import { Widget } from "../../models/dashboard";

@Component({
    selector: "app-widget",
    standalone: true,
    imports: [NgComponentOutlet, MatIconModule, WidgetOptionsComponent,CommonModule, CdkDrag, CdkDragPlaceholder],
    template: `
        <div class="container" [style.background-color]="data().backgroundColor ?? 'whitesmoke'"
            [style.color]="data().color ?? 'inherit'" cdkDrag cdkDragPreviewContainer="parent">
            <h4 class="m-0">{{ data().label.toUpperCase() }}</h4>
            <button mat-icon-button class="settings-buttton" (click)="showOptions.set(true)"
                [ngStyle]="{'color': data().color ?? 'inherit'}">
                <mat-icon>settings</mat-icon>
            </button>
            <ng-container [ngComponentOutlet]="data().content ?? null"></ng-container>

            @if(showOptions()){
                <app-widget-options [(showOptions)]="showOptions" [data]="data()"/>
            }
            <!-- empty so it doesnt cause any displacement in destination droplist -->
            <div *cdkDragPlaceholder></div> 
        </div>
    `,
    styles: `
        :host{
            display: block;
            border-radius: 16px;
        }

        .container{
            position: relative;
            height: 100%;
            width: 100%;
            padding: 22px;
            box-sizing: border-box;
            border-radius: inherit;
            overflow: hidden;
            cursor: grab;
        }

        .container:active {
            cursor: grabbing; 
        }

        .settings-buttton{
            background: transparent;
            border: none;
            position: absolute;
            top: 8px;
            right: 8px;
        }
    `,
    host: {
        '[style.grid-area]': 
            '"span " + (data().rows ?? 1) + "/ span " + (data().columns ?? 1)'
    }
})
export class WidgetComponent {
    //takes Widget as input , send the whole widget type to our widget cimponent
    data = input.required<Widget>();

    showOptions = signal(false);
}