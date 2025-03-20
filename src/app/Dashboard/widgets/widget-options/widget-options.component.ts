import { Component, inject, input, model } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import { Widget } from '../../../models/dashboard';
import { DashboardService } from '../../../Services/dashboard.service';

@Component({
  selector: 'app-widget-options',
  imports: [MatButtonModule, MatIconModule, MatButtonToggleModule],
  template: `
    <p>
      <button mat-icon-button class="close-button" (click)="showOptions.set(false)">
        <mat-icon>close</mat-icon>
      </button>
    </p>

    <div>
      <p class="text-dark">Width</p>
      <mat-button-toggle-group hideSingleSelectionIndicator="true" 
        [value]="data().columns ?? 1"
        (change)="store.updateWidget(data().label,{columns: +$event.value})"
        >
        <mat-button-toggle [value]="1">1</mat-button-toggle>
        <mat-button-toggle [value]="2">2</mat-button-toggle>
        <mat-button-toggle [value]="3">3</mat-button-toggle>
        <mat-button-toggle [value]="4">4</mat-button-toggle>
      </mat-button-toggle-group>
    </div>
    <div>
      <p class="text-dark">Height</p>
      <mat-button-toggle-group hideSingleSelectionIndicator="true" 
        [value]="data().rows ?? 1"
        (change)="store.updateWidget(data().label,{rows: +$event.value})"
        >
        <mat-button-toggle [value]="1">1</mat-button-toggle>
        <mat-button-toggle [value]="2">2</mat-button-toggle>
        <mat-button-toggle [value]="3">3</mat-button-toggle>
        <mat-button-toggle [value]="4">4</mat-button-toggle>
      </mat-button-toggle-group>
    </div>

    <button mat-icon-button class="move-forward-button" (click)="store.moveWidgetToRight(data().label)">
        <mat-icon>chevron_right</mat-icon>
    </button>

    <button mat-icon-button class="move-backward-button" (click)="store.moveWidgetToLeft(data().label)">
      <mat-icon>chevron_left</mat-icon>
    </button>

    <button mat-icon-button class="remove-widget-button" (click)="store.removeWidget(data().label)">
        <mat-icon>delete</mat-icon>
    </button>
  `,
  styles: `
    :host{
      position: absolute;
      z-index: 2;
      background: whitesmoke;
      top: 0;
      left: 0;
      border-radius: inherit;
      height: 100%;
      width: 100%;

      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      box-sizing: border-box;
      div{
        display: flex;
        gap: 8px;
        align-items: center;
        margin-bottom: 8px;
      }
    }

    .close-button{
      position: absolute;
      top: 0px;
      right: 0px;
    }

    .move-forward-button{
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      right: -5px;
    }

    .move-backward-button{
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      left: -5px;
    }

    .remove-widget-button{
      position: absolute;
      top: 0;
      left: 0;
      color: red;
    }
  `
})
export class WidgetOptionsComponent {
  data = input.required<Widget>();
  showOptions = model<boolean>(false);

  store = inject(DashboardService);
}
