/*
 * Angular 2 decorators and services
 */
import { Component } from '@angular/core';

/*
 * Topbar Component
 */
@Component({
    selector: 'msd-topbar',
    template: `
<div class="top-bar-container">

    <ul class="title-area">
      <li class="name">
        <h1>
          <a href="#"><img src="icon.png" width="50" /> Microservices Dashboard</a>
        </h1>
      </li>
    </ul>

</div>  `,
    styleUrls: ['topbar.styles.css']
})
export class Msdtopbar {

    constructor() {

    }

    ngOnInit() {

    }

}

