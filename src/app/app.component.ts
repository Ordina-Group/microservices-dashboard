import { Inject, Component, ViewEncapsulation } from '@angular/core';
import { Msdtopbar } from './topbar/topbar.component';
import { BASE_ENDPOINT_TOKEN } from '../platform/environment-tokens';
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
    constructor( @Inject(BASE_ENDPOINT_TOKEN) baseUrl: string) {
        console.log(`URL: '${baseUrl}'`);
    }
    ngOnInit() {
        console.log('Initial App State');
    }
}