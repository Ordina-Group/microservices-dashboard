import { Component, ViewEncapsulation } from '@angular/core';
import { Msdtopbar } from './topbar/topbar.component';

/*
 * App Component
 * Top Level Component
 */
@Component({
    selector: 'app',
    encapsulation: ViewEncapsulation.None,
    styleUrls: [
        './app.style.css'
    ],
    directives: [Msdtopbar],
    template: `
    <msd-topbar></msd-topbar>
  `
})
export class App {
    ngOnInit() {
        console.log('Initial App State');
    }
}