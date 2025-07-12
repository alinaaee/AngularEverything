import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-hello-kitty-dialog',
  imports: [CommonModule, MatDialogModule],
  template: `
    <div class="p-5">
      <mat-dialog-content>
        <img src="assets/gifs/helloKitty.gif">
      </mat-dialog-content>
    </div>
  `,
  styles: [``]
})
export class HelloKittyDialogComponent {
  constructor(private dialog: MatDialog) {}
}
