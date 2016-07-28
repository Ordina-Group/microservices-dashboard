/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
"use strict";
var compiler_1 = require('@angular/compiler');
var testing_1 = require('@angular/compiler/testing');
var core_1 = require('@angular/core');
var testing_2 = require('@angular/core/testing');
var platform_browser_1 = require('@angular/platform-browser');
var core_private_1 = require('../core_private');
var platform_browser_dynamic_testing_private_1 = require('../platform_browser_dynamic_testing_private');
var platform_browser_private_1 = require('../platform_browser_private');
var parse5_adapter_1 = require('../src/parse5_adapter');
function initServerTests() {
    parse5_adapter_1.Parse5DomAdapter.makeCurrent();
}
/**
 * Default platform providers for testing.
 *
 * @experimental
 */
exports.TEST_SERVER_PLATFORM_PROVIDERS = 
/*@ts2dart_const*/ [
    core_1.PLATFORM_COMMON_PROVIDERS,
    /*@ts2dart_Provider*/ {
        provide: core_1.PLATFORM_INITIALIZER,
        useValue: initServerTests,
        multi: true
    }
];
function appDoc() {
    try {
        return platform_browser_private_1.getDOM().defaultDoc();
    }
    catch (e) {
        return null;
    }
}
function createNgZone() {
    return new core_1.NgZone({ enableLongStackTrace: true });
}
/**
 * Default application providers for testing.
 *
 * @experimental
 */
exports.TEST_SERVER_APPLICATION_PROVIDERS = 
/*@ts2dart_const*/ [
    // TODO(julie: when angular2/platform/server is available, use that instead of making our own
    // list here.
    core_1.APPLICATION_COMMON_PROVIDERS, compiler_1.COMPILER_PROVIDERS, platform_browser_1.BROWSER_SANITIZATION_PROVIDERS,
    /* @ts2dart_Provider */ { provide: platform_browser_1.DOCUMENT, useFactory: appDoc },
    /* @ts2dart_Provider */ { provide: platform_browser_private_1.DomRootRenderer, useClass: platform_browser_private_1.DomRootRenderer_ },
    /* @ts2dart_Provider */ { provide: core_1.RootRenderer, useExisting: platform_browser_private_1.DomRootRenderer },
    /* @ts2dart_Provider */ { provide: core_private_1.AnimationDriver, useClass: core_private_1.NoOpAnimationDriver },
    platform_browser_1.EventManager,
    /* @ts2dart_Provider */ {
        provide: platform_browser_1.EVENT_MANAGER_PLUGINS,
        useClass: platform_browser_private_1.DomEventsPlugin,
        multi: true
    },
    /* @ts2dart_Provider */ { provide: compiler_1.XHR, useClass: compiler_1.XHR },
    /* @ts2dart_Provider */ { provide: core_1.APP_ID, useValue: 'a' },
    /* @ts2dart_Provider */ { provide: platform_browser_private_1.SharedStylesHost, useExisting: platform_browser_private_1.DomSharedStylesHost },
    platform_browser_private_1.DomSharedStylesHost, platform_browser_private_1.ELEMENT_PROBE_PROVIDERS,
    { provide: testing_2.TestComponentBuilder, useClass: testing_1.OverridingTestComponentBuilder },
    /* @ts2dart_Provider */ { provide: compiler_1.DirectiveResolver, useClass: testing_1.MockDirectiveResolver },
    /* @ts2dart_Provider */ { provide: compiler_1.ViewResolver, useClass: testing_1.MockViewResolver },
    /* @ts2dart_Provider */ { provide: testing_2.TestComponentRenderer, useClass: platform_browser_dynamic_testing_private_1.DOMTestComponentRenderer },
    /* @ts2dart_Provider */ { provide: core_1.NgZone, useFactory: createNgZone }
];
//# sourceMappingURL=server.js.map