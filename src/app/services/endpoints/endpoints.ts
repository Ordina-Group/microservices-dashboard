import { Injectable, Inject } from '@angular/core';
import { BASE_ENDPOINT_TOKEN } from '../../../platform/environment-tokens';
@Injectable()
export class Endpoints {

    private _baseUrl: string;

    constructor(
        @Inject(BASE_ENDPOINT_TOKEN) baseUrl: string
    ) {
        this._baseUrl = baseUrl;
    }

    public get graph(): string {
        return this._createEndpoint('graph');
    }

    private _createEndpoint(path: string): string {
        return `${this._baseUrl}${path}`;
    }
}
