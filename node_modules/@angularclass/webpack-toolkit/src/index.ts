import { ComponentResolver, Injectable, Inject, OpaqueToken } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { RuntimeCompiler } from '@angular/compiler';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';

export const AC_WEBPACK_ASYNC_MAP = new OpaqueToken('AC_WEBPACK_ASYNC_MAP');


export function composeRoutes(...routes) {
  return (<any>Object).assign(...routes);
}


@Injectable()
export class WebpackAsyncModules {
  constructor(
    @Inject(AC_WEBPACK_ASYNC_MAP) private _asyncModules: any) {

  }
  fetch(moduleName: string, exportName?: string) {
    return this._asyncModules[moduleName]();
  }
  hasModule(moduleName: string) {
    return !!this._asyncModules[moduleName];
  }
}

@Injectable()
export class WebpackComponentResolver {
  constructor(
    private _resolver: ComponentResolver,
    private _webpackAsyncModules: WebpackAsyncModules) {

  }

  resolveComponent(componentType: any) {
    if (typeof componentType === 'string' && this._webpackAsyncModules.hasModule(componentType)) {
      return this._webpackAsyncModules.fetch(componentType)
        .then(cmpFile => {
          let component = this._resolveExports(cmpFile, componentType);
          return this._resolver.resolveComponent(component);
        });
    }
    return this._resolver.resolveComponent(componentType);
  }

  clearCache(): void {}

  private _resolveExports(cmpFile, componentType) {
    return cmpFile[componentType] || cmpFile.default || cmpFile;
  }
}

@Injectable()
export class WebpackAsyncRoute {
  constructor(public router: Router, public webpackAsyncModules: WebpackAsyncModules) {
  }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
    let commponentString: string = (<any>route).component;
    if (typeof commponentString !== 'string') { return true; }

    let routeConfig = (<any>this).router.config;
    return Observable.fromPromise<boolean>(new Promise(resolve => {
      this.webpackAsyncModules.fetch(commponentString)
        .then((asyncModule) => {
          let currentRouteConfig = routeConfig;
          let newRoutes = currentRouteConfig
            .map(_route => {
              if (_route.path === asyncModule.routes.path) {
                let newRoute = composeRoutes(_route, asyncModule.routes);
                newRoute.canActivate = newRoute.canActivate.filter(active => active !== WebpackAsyncRoute);
                return newRoute;
              }
              return _route;
            });
          this.router.resetConfig(newRoutes);
          resolve(true);
          return asyncModule;
        });
    }));
  }

}

export const ANGULARCLASS_WEBPACK_RUNTIME_PROVIDERS = [
  WebpackAsyncModules,
  {
    provide: WebpackAsyncRoute,
    useFactory: (router, webpackAsyncModules) => {
      return new WebpackAsyncRoute(router, webpackAsyncModules);
    },
    deps: [Router, WebpackAsyncModules]
  },
  {
    provide: ComponentResolver,
    useFactory: (resolver, webpackAsyncModules) => {
      return new WebpackComponentResolver(resolver, webpackAsyncModules);
    },
    deps: [RuntimeCompiler, WebpackAsyncModules]
  }
];

export function provideWebpack(asyncModules) {
  return [
    { provide: AC_WEBPACK_ASYNC_MAP, useValue: asyncModules },
    ...ANGULARCLASS_WEBPACK_RUNTIME_PROVIDERS,
  ];
}
