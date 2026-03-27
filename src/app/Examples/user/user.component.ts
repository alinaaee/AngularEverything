import { Component, inject } from '@angular/core';
import { AuthServiceService } from '../../Services/auth-service.service';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user',
  providers: [AuthServiceService],
  styles: ``,
  imports: [CommonModule],
  template: `
    <div [hidden]="!auth.user()">
      <h2>Welcome, {{ auth.user()?.name }}</h2>
      <button (click)="auth.logout()">Logout</button>
    </div>
    <ng-template [hidden]="auth.user()">
      <button (click)="auth.login('JohnDoe')">Login</button>
    </ng-template>
  `,
})
export class UserComponent {
  auth = inject(AuthServiceService);
}
