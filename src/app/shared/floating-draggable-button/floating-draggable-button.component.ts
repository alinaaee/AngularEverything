import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragEnd } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HelloKittyDialogComponent } from '../../hello-kitty-dialog/hello-kitty-dialog.component';

@Component({
  selector: 'app-floating-draggable-button',
  standalone: true,
  imports: [CommonModule, DragDropModule, MatButtonModule, MatIconModule, MatDialogModule],
  template: `
    <div class="floating-button" cdkDrag (cdkDragEnded)="onDragEnd($event)" cdkDragBoundary="body">
      <button mat-fab color="primary" (mousedown)="preventClick()" (click)="handleClick()">
        <mat-icon>favorite</mat-icon>
      </button>
    </div>
  `,
  styles: [`
    .floating-button {
      position: fixed;
      top: 100px;
      left: 100px;
      z-index: 1000;
      cursor: move;
    }
  `],
})

export class FloatingDraggableButtonComponent {
  constructor(private dialog: MatDialog) {}
  // @Input() clickCallback: () => void = () => {};
  private wasDragged = false;

  onDragEnd(event: CdkDragEnd): void {
    this.wasDragged = true;
    setTimeout(() => {
      this.wasDragged = false;
    }, 200);
  }

  preventClick() {
    this.wasDragged = false;
  }

  handleClick() {
    if (!this.wasDragged) {
      this.dialog.open(HelloKittyDialogComponent, {
        width: '800px',
      });
    }
  }
}

