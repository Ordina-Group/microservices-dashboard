/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { OnDestroy, OnInit } from '@angular/core';
import { FormArray } from '../../model';
import { ControlContainer } from '../control_container';
import { AsyncValidatorFn, ValidatorFn } from '../validators';
import { FormGroupDirective } from './form_group_directive';
export declare const formArrayNameProvider: any;
/**
 * Syncs an existing form array to a DOM element.
 *
 * This directive can only be used as a child of {@link FormGroupDirective}.
 *
 * ```typescript
 * @Component({
 *   selector: 'my-app',
 *   template: `
 *     <div>
 *       <h2>Angular FormArray Example</h2>
 *       <form [formGroup]="myForm">
 *         <div formArrayName="cities">
 *           <div *ngFor="let city of cityArray.controls; let i=index">
 *             <input [formControlName]="i">
 *           </div>
 *         </div>
 *       </form>
 *       {{ myForm.value | json }}     // {cities: ['SF', 'NY']}
 *     </div>
 *   `
 * })
 * export class App {
 *   cityArray = new FormArray([
 *     new FormControl('SF'),
 *     new FormControl('NY')
 *   ]);
 *   myForm = new FormGroup({
 *     cities: this.cityArray
 *   });
 * }
 * ```
 *
 * @experimental
 */
export declare class FormArrayName extends ControlContainer implements OnInit, OnDestroy {
    name: string;
    constructor(parent: ControlContainer, validators: any[], asyncValidators: any[]);
    ngOnInit(): void;
    ngOnDestroy(): void;
    readonly control: FormArray;
    readonly formDirective: FormGroupDirective;
    readonly path: string[];
    readonly validator: ValidatorFn;
    readonly asyncValidator: AsyncValidatorFn;
}
