import { STATES_FILTERS, GROUPS_FILTERS, TYPES_FILTERS } from '../filter/filterMock';
import { Injectable } from '@angular/core';

@Injectable()
export class FilterService {
    getStatesFilter() {
        return STATES_FILTERS;
    }
    getTypesFilter() {
        return TYPES_FILTERS;
    }
    getGroupsFilter() {
        return GROUPS_FILTERS;
    }
}
