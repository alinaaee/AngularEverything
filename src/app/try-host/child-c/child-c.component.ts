import { Component } from '@angular/core';

@Component({
  selector: 'app-child-c',
  imports: [],
  template: `
    <p>I am a P tag in ChildC Component</p>
  `,
  styles: `
  :host-context(app-child-b.box) {
    color: red;
    border: 2px solid green;
    display: block;
    margin: 10px;
  }
`
})
export class ChildCComponent {

}
