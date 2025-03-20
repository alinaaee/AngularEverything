import { Component, inject } from '@angular/core';
import { AuthServiceService } from '../../Services/auth-service.service';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user',
  providers: [AuthServiceService],
  styles: ``,
  imports: [CommonModule],
  template: `
     <div *ngIf="auth.user(); else loginTemplate">
      <h2>Welcome, {{ auth.user()?.name }}</h2>
      <button (click)="auth.logout()">Logout</button>
    </div>
    <ng-template #loginTemplate>
      <button (click)="auth.login('JohnDoe')">Login</button>
    </ng-template>
  `,
})
export class UserComponent {
  auth = inject(AuthServiceService);
}
