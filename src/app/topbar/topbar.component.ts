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
    <h1 class="title-area">
          <a href="#"><img src="./assets/img/icon.png" width="50" /> Microservices Dashboard</a>
    </h1>
    <span class="left">
        <div class="logo-msg">Logo created by Vicons Design from the Noun Project</div>
    </span>
</div>  
`,
    styleUrls: ['topbar.styles.css']
})
export class Msdtopbar {

    constructor() {

    }

    ngOnInit() {

    }

}

