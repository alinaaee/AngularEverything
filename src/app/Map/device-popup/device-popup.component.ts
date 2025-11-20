// src/app/device-popup/device-popup.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-device-popup',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="min-width:200px;">
      <h4>{{device.name}}</h4>
      <p>ID: {{device.id}}</p>
      <div *ngIf="device.logs?.length">
        <strong>Logs</strong>
        <ul>
          <li *ngFor="let l of device.logs">{{l}}</li>
        </ul>
      </div>
      <button (click)="onAction()">Acknowledge</button>
    </div>
  `
})
export class DevicePopupComponent {
  @Input() device: any = {};
  onAction(){ console.log('ack for', this.device.id) }
}
