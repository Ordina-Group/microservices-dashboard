import { Injectable, Inject, forwardRef } from '@angular/core';
import {
    UrlConfig,
    ENDPOINTS_CONFIG
} from './';
@Injectable()
export class Endpoints {

    private _config: UrlConfig;

    constructor(
        @Inject(forwardRef(() => ENDPOINTS_CONFIG)) config: UrlConfig
    ) {
        this._config = config;
    }

    public get graph(): string {
        return this._createEndpoint('graph');
    }

    private _createEndpoint(path: string): string {
        return this._config.port ?
            `${this._config.protocol}://${this._config.hostName}:${this._config.port}/${path}` :
            `${this._config.protocol}://${this._config.hostName}/${path}`;
    }
}
