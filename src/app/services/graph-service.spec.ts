import {
    inject, addProviders, async
} from '@angular/core/testing';
import { Injector } from '@angular/core';
import { Response, ResponseOptions, Http, BaseRequestOptions } from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { GraphService } from './';
import { MsdGraph } from '../models';
import { ERR_HTTP_GET_GRAPH } from '../constants';
import { Endpoints, UrlConfig, ENDPOINTS_CONFIG } from './endpoints';
const mockConfig: UrlConfig = {
    protocol: 'http',
    hostName: 'localhost',
    port: '3039',
};
const urlConfig = { provide: ENDPOINTS_CONFIG, useValue: mockConfig };
const httpProvider = {
    provide: Http,
    useFactory: (backend, options) => {
        return new Http(backend, options);
    },
    deps: [MockBackend, BaseRequestOptions]
};
describe('GraphService', () => {
    let _backEnd: MockBackend;
    let _graphService: GraphService;
    let _badResponse: Response = new Response(new ResponseOptions({ body: { x: 'hello' } }));
    beforeEach(() => {
        addProviders([
            MockBackend,
            BaseRequestOptions,
            httpProvider,
            GraphService,
            Endpoints,
            urlConfig
        ]);
    });

    beforeEach(inject([Injector], (injector: Injector) => {
        _backEnd = injector.get(MockBackend);
        _graphService = injector.get(GraphService);
    }));
    afterEach(() => _backEnd.verifyNoPendingRequests());

    describe('request graph', () => {
        it('should throw error if response doesnt have graph data',
            async(() => {
                _backEnd.connections
                    .subscribe((connection: MockConnection) => {
                        connection.mockRespond(_badResponse);
                    });
                _graphService
                    .requestGraph()
                    .subscribe((data: MsdGraph) => {
                        fail('Supposed to throw an error');
                    }, (err) => {
                        expect(err).toBe(ERR_HTTP_GET_GRAPH);
                    });
            }), 3000);
    });
});
