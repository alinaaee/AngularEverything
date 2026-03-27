// src/app/device-popup/device-popup.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Device {
  id: string;
  name: string;
  logs?: string[];
}

@Component({
  selector: 'app-device-popup',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="min-width:200px;">
      <h4>{{device.name}}</h4>
      <p>ID: {{device.id}}</p>
      @if (device.logs?.length) {
        <div>
          <strong>Logs</strong>
          <ul>
            @for (log of device.logs; track $index) {
              <li>{{ log }}</li>
            }
          </ul>
        </div>
      }
      <button (click)="onAction()">Acknowledge</button>
    </div>
  `
})
export class DevicePopupComponent {
  @Input() device: Device = { id: '', name: '', logs: [] };

  onAction() {
    console.log('ack for', this.device.id);
  }
}
