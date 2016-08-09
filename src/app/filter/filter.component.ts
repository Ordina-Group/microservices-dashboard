/*
 * Angular 2 decorators and services
 */
import { Component } from '@angular/core';
import { FilterService } from '../services/filter.service';

/*
 * filter Component
 */
@Component({
    selector: 'msd-filter',
    template: require('./filter.html'),
    providers: [FilterService],
    styleUrls: ['filter.styles.css']
})
export class Msdfilter {
    public statesFilter: string[];
    public typesFilter: string[];
    public groupsFilter: string[];
    private _filterService: FilterService;
    constructor(filterService: FilterService) {
        this._filterService = filterService;
    }

    ngOnInit() {
        this.statesFilter = this._filterService.getStatesFilter();
        this.typesFilter = this._filterService.getTypesFilter();
        this.groupsFilter = this._filterService.getGroupsFilter();
    }

}

