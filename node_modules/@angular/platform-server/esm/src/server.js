/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { PlatformLocation } from '@angular/common';
import { OpaqueToken, PLATFORM_COMMON_PROVIDERS, PLATFORM_INITIALIZER, ReflectiveInjector, assertPlatform, coreLoadAndBootstrap, createPlatform, getPlatform } from '@angular/core';
import { ReflectionCapabilities, reflector, wtfInit } from '../core_private';
import { Parse5DomAdapter } from './parse5_adapter';
const SERVER_PLATFORM_MARKER = new OpaqueToken('ServerPlatformMarker');
function notSupported(feature) {
    throw new Error(`platform-server does not support '${feature}'.`);
}
class ServerPlatformLocation extends PlatformLocation {
    getBaseHrefFromDOM() { throw notSupported('getBaseHrefFromDOM'); }
    ;
    onPopState(fn) { notSupported('onPopState'); }
    ;
    onHashChange(fn) { notSupported('onHashChange'); }
    ;
    get pathname() { throw notSupported('pathname'); }
    get search() { throw notSupported('search'); }
    get hash() { throw notSupported('hash'); }
    replaceState(state, title, url) { notSupported('replaceState'); }
    ;
    pushState(state, title, url) { notSupported('pushState'); }
    ;
    forward() { notSupported('forward'); }
    ;
    back() { notSupported('back'); }
    ;
}
/**
 * A set of providers to initialize the Angular platform in a server.
 *
 * Used automatically by `serverBootstrap`, or can be passed to {@link platform}.
 * @experimental
 */
export const SERVER_PLATFORM_PROVIDERS = [
    { provide: SERVER_PLATFORM_MARKER, useValue: true }, PLATFORM_COMMON_PROVIDERS,
    { provide: PLATFORM_INITIALIZER, useValue: initParse5Adapter, multi: true },
    { provide: PlatformLocation, useClass: ServerPlatformLocation }
];
function initParse5Adapter() {
    Parse5DomAdapter.makeCurrent();
    wtfInit();
}
/**
 * @experimental
 */
export function serverPlatform() {
    if (!getPlatform()) {
        createPlatform(ReflectiveInjector.resolveAndCreate(SERVER_PLATFORM_PROVIDERS));
    }
    return assertPlatform(SERVER_PLATFORM_MARKER);
}
/**
 * Used to bootstrap Angular in server environment (such as node).
 *
 * This version of bootstrap only creates platform injector and does not define anything for
 * application injector. It is expected that application providers are imported from other
 * packages such as `@angular/platform-browser` or `@angular/platform-browser-dynamic`.
 *
 * ```
 * import {BROWSER_APP_PROVIDERS} from '@angular/platform-browser';
 * import {BROWSER_APP_COMPILER_PROVIDERS} from '@angular/platform-browser-dynamic';
 *
 * serverBootstrap(..., [BROWSER_APP_PROVIDERS, BROWSER_APP_COMPILER_PROVIDERS])
 * ```
 *
 * @experimental
 */
export function serverBootstrap(appComponentType, providers) {
    reflector.reflectionCapabilities = new ReflectionCapabilities();
    var appInjector = ReflectiveInjector.resolveAndCreate(providers, serverPlatform().injector);
    return coreLoadAndBootstrap(appComponentType, appInjector);
}
//# sourceMappingURL=server.js.map