import { Component } from '@angular/core';
import { ChildCComponent } from "../child-c/child-c.component";

@Component({
  selector: 'app-child-b',
  imports: [ChildCComponent],
  template: `
    <div class="childBContainer">
      <p>P Tag in ChildB Component</p>
      <h2>H2 Tag in ChildB Component</h2>
      <h4 class="iAmH4">H4 Tag with a class in ChildB Component</h4>
      <h6 id="1stH6">H6 Tag with an ID in ChildB Component</h6>
      <app-child-c></app-child-c>
    </div>
  `,
  styles: `
    :host {
      border: 2px solid violet;
      display: block;
      padding: 10px;
      margin: 10px;
    }
    :host(.box) {
      border: 2px solid orange;
    }
    .childBContainer {
      border: 2px solid tomato;
    }
  `
})
export class ChildBComponent {

}
