import {
    inject, addProviders
} from '@angular/core/testing';
import { UrlConfig, ENDPOINTS_CONFIG, Endpoints } from './';
const mockConfigNoPort: UrlConfig = {
    protocol: 'https',
    hostName: 'myhost'
};
const mockConfig: UrlConfig = {
    protocol: 'http',
    hostName: 'localhost',
    port: '3039',
};
const urlConfigWithoutPortProvider = { provide: ENDPOINTS_CONFIG, useValue: mockConfigNoPort };
const urlConfig = { provide: ENDPOINTS_CONFIG, useValue: mockConfig };

describe('Endpoints service', () => {

    describe('with port', () => {
        beforeEach(() => {
            addProviders([Endpoints, urlConfig]);
        });
        it(
            'should create correct graph endpoint',
            inject([Endpoints], (api: Endpoints) => {
                const graphEndpoint: string = api.graph;
                const expected: string = 'http://localhost:3039/graph';
                expect(graphEndpoint).toBe(expected);
            })
        );
    });

    describe('without port', () => {
        beforeEach(() => {
            addProviders([Endpoints, urlConfigWithoutPortProvider]);
        });
        it(
            'should create correct graph endpoint',
            inject([Endpoints], (api: Endpoints) => {
                const graphEndpoint: string = api.graph;
                const expected: string = 'https://myhost/graph';
                expect(graphEndpoint).toBe(expected);
            })
        );
    });
});
