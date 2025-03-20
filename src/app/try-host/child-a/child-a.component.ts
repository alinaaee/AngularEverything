import { Component } from '@angular/core';
import { ChildBComponent } from "../child-b/child-b.component";

@Component({
  selector: 'app-child-a',
  imports: [ChildBComponent],
  template: `
    <div class="childAContainer">
      <span>I am a Span tag within ChildA Component.</span>
      <h2>I am a H2 tag inside ChildA Component.</h2>
      <app-child-b> </app-child-b>
      <app-child-b class="box"></app-child-b>
    </div>
  `,
  styles: `
    .childAContainer{
      border: 2px solid lightblue;
      padding: 10px;
    }
    :host {
      border: 2px solid green;
      color:chocolate;
      display: block;
      padding: 10px;
    }
    :host h2 {
      font-style: italic;
    }
    :host .iAmH4 {
      border: 2px dotted blue;
    }
    :host [id='1stH6'] {
      border: 2px dotted violet;
    }

    // :host ::ng-deep .iAmH4 {
    //   border: 2px dotted blue;
    // }
    // :host ::ng-deep [id=’1stH6'] {
    //   border: 2px dotted violet;
    // }
  `
})
export class ChildAComponent {

}
