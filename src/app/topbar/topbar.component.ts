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
//hier komt de navigatie
<h1>Microservices Dashboard</h1>
  `
})
export class Msdtopbar {

    constructor() {

    }

    ngOnInit() {

    }

}

