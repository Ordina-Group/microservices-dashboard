import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';
import { Endpoints } from './endpoints';
import { MsdGraph } from '../models';
import { ERR_HTTP_GET_GRAPH } from '../constants';
@Injectable()
export class GraphService {

    private _http: Http;
    private _endPoints: Endpoints;

    constructor(http: Http, endpoints: Endpoints) {
        this._http = http;
        this._endPoints = endpoints;
    }

    public requestGraph(): Observable<MsdGraph> {
        return this._http
            .get(this._endPoints.graph)
            .map((response: Response) => {
                const graph: MsdGraph = response.json();
                if (graph.hasOwnProperty('graph') === false) {
                    throw new Error();
                }
                return graph;
            })
            .catch((err: any, caught: Observable<MsdGraph>) => {
                return Observable.throw(ERR_HTTP_GET_GRAPH);
            });
    }
}
