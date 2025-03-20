import { Component } from '@angular/core';
import { ChildAComponent } from "./child-a/child-a.component";

@Component({
  selector: 'app-try-host',
  imports: [ChildAComponent],
  template: `
    <p>I am a P tag within App Component.</p>
    <app-child-a></app-child-a>
  `,
  styles: ``
})
export class TryHostComponent {

}
