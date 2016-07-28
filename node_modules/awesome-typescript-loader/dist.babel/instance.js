'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ensureInstance = ensureInstance;

var _host = require('./host');

var _fs = require('fs');

var fs = _interopRequireWildcard(_fs);

var _path = require('path');

var path = _interopRequireWildcard(_path);

var _lodash = require('lodash');

var _ = _interopRequireWildcard(_lodash);

var _tsconfig = require('tsconfig');

var tsconfig = _interopRequireWildcard(_tsconfig);

var _helpers = require('./helpers');

var _deps = require('./deps');

var _checker = require('./checker');

var _tsconfigUtils = require('./tsconfig-utils');

var _resolver = require('./resolver');

var _resolver2 = _interopRequireDefault(_resolver);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var __awaiter = undefined && undefined.__awaiter || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator.throw(value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : new P(function (resolve) {
                resolve(result.value);
            }).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};

var colors = require('colors/safe');
var pkg = require('../package.json');
function getRootCompiler(compiler) {
    if (compiler.parentCompilation) {
        return getRootCompiler(compiler.parentCompilation.compiler);
    } else {
        return compiler;
    }
}
function getInstanceStore(compiler) {
    var store = getRootCompiler(compiler)._tsInstances;
    if (store) {
        return store;
    } else {
        throw new Error('Can not resolve instance store');
    }
}
function ensureInstanceStore(compiler) {
    var rootCompiler = getRootCompiler(compiler);
    if (!rootCompiler._tsInstances) {
        rootCompiler._tsInstances = {};
    }
}
function resolveInstance(compiler, instanceName) {
    return getInstanceStore(compiler)[instanceName];
}
var COMPILER_ERROR = colors.red('\n\nTypescript compiler cannot be found, please add it to your package.json file:\n    npm install --save-dev typescript\n');
var BABEL_ERROR = colors.red('\n\nBabel compiler cannot be found, please add it to your package.json file:\n    npm install --save-dev babel-core\n');
var id = 0;
function ensureInstance(webpack, options, instanceName) {
    ensureInstanceStore(webpack._compiler);
    var exInstance = resolveInstance(webpack._compiler, instanceName);
    if (exInstance) {
        return exInstance;
    }
    var tsFlow = Promise.resolve();
    var compilerPath = options.compiler || 'typescript';
    var tsImpl = void 0;
    try {
        tsImpl = require(compilerPath);
    } catch (e) {
        console.error(e);
        console.error(COMPILER_ERROR);
        process.exit(1);
    }
    var libPath = path.join(compilerPath, 'lib', 'lib.d.ts');
    var lib6Path = path.join(compilerPath, 'lib', 'lib.es6.d.ts');
    try {
        require.resolve(libPath);
    } catch (e) {
        libPath = path.join(compilerPath, 'bin', 'lib.d.ts');
        lib6Path = path.join(compilerPath, 'bin', 'lib.es6.d.ts');
    }
    var compilerInfo = {
        compilerPath: compilerPath,
        tsImpl: tsImpl,
        lib5: (0, _helpers.loadLib)(libPath),
        lib6: (0, _helpers.loadLib)(lib6Path)
    };
    _.defaults(options, {
        resolveGlobs: true
    });
    var configFilePath = void 0;
    var configFile = void 0;
    if (options.tsconfig && options.tsconfig.match(/\.json$/)) {
        configFilePath = options.tsconfig;
    } else {
        configFilePath = tsconfig.resolveSync(options.tsconfig || process.cwd());
    }
    if (configFilePath) {
        var content = fs.readFileSync(configFilePath).toString();
        configFile = (0, _tsconfigUtils.parseContent)(content, configFilePath);
        if (options.resolveGlobs) {
            (0, _tsconfigUtils.tsconfigSuggestions)(configFile);
            configFile = tsconfig.readFileSync(configFilePath, { filterDefinitions: true });
        }
    }
    var tsFiles = [];
    if (configFile) {
        if (configFile.compilerOptions) {
            _.defaults(options, configFile.awesomeTypescriptLoaderOptions);
            _.defaults(options, configFile.compilerOptions);
            options.exclude = configFile.exclude || [];
            tsFiles = configFile.files;
        }
    }
    var projDir = configFilePath ? path.dirname(configFilePath) : process.cwd();
    options = (0, _tsconfigUtils.rawToTsCompilerOptions)(options, projDir, tsImpl);
    _.defaults(options, {
        externals: [],
        doTypeCheck: true,
        sourceMap: true,
        verbose: false,
        noLib: false,
        skipDefaultLibCheck: true,
        suppressOutputPathCheck: true,
        sourceRoot: options.sourceMap ? process.cwd() : undefined
    });
    options = _.omit(options, 'outDir', 'files', 'out', 'noEmit');
    options.externals.push.apply(options.externals, tsFiles);
    var babelImpl = void 0;
    if (options.useBabel) {
        try {
            var babelPath = options.babelCore || path.join(process.cwd(), 'node_modules', 'babel-core');
            babelImpl = require(babelPath);
        } catch (e) {
            console.error(BABEL_ERROR);
            process.exit(1);
        }
    }
    var cacheIdentifier = null;
    if (options.useCache) {
        if (!options.cacheDirectory) {
            options.cacheDirectory = path.join(process.cwd(), '.awcache');
        }
        if (!fs.existsSync(options.cacheDirectory)) {
            fs.mkdirSync(options.cacheDirectory);
        }
        cacheIdentifier = {
            'typescript': tsImpl.version,
            'awesome-typescript-loader': pkg.version,
            'awesome-typescript-loader-query': webpack.query,
            'babel-core': babelImpl ? babelImpl.version : null
        };
    }
    var forkChecker = options.forkChecker && getRootCompiler(webpack._compiler)._tsFork;
    var resolver = (0, _resolver2.default)(webpack._compiler.options);
    var syncResolver = resolver.resolveSync.bind(resolver);
    var tsState = new _host.State(options, webpack._compiler.inputFileSystem, compilerInfo, syncResolver);
    var compiler = webpack._compiler;
    setupWatchRun(compiler, instanceName);
    if (options.doTypeCheck) {
        setupAfterCompile(compiler, instanceName, forkChecker);
    }
    var webpackOptions = _.pick(webpack._compiler.options, 'resolve');
    var atlOptions = webpack.options.atl;
    var plugins = [];
    if (atlOptions && atlOptions.plugins) {
        plugins = atlOptions.plugins;
    }
    var initedPlugins = [];
    if (!forkChecker) {
        initedPlugins = plugins.map(function (plugin) {
            return require(plugin.file)(plugin.options);
        });
    }
    return getInstanceStore(webpack._compiler)[instanceName] = {
        id: ++id,
        tsFlow: tsFlow,
        tsState: tsState,
        babelImpl: babelImpl,
        compiledFiles: {},
        options: options,
        externalsInvoked: false,
        checker: forkChecker ? (0, _checker.createChecker)(compilerInfo, options, webpackOptions, plugins) : null,
        cacheIdentifier: cacheIdentifier,
        plugins: plugins,
        initedPlugins: initedPlugins,
        externalsInvocation: null,
        shouldUpdateProgram: true
    };
}
var EXTENSIONS = /\.tsx?$|\.jsx?$/;
function setupWatchRun(compiler, instanceName) {
    compiler.plugin('watch-run', function (watching, callback) {
        return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee2() {
            var compiler, instance, state, resolver, mtimes, changedFiles, tasks;
            return regeneratorRuntime.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            compiler = watching.compiler;
                            instance = resolveInstance(watching.compiler, instanceName);
                            state = instance.tsState;
                            resolver = (0, _deps.createResolver)(compiler.options.externals, state.options.exclude || [], watching.compiler.resolvers.normal.resolve, watching.compiler.resolvers.normal);
                            mtimes = watching.compiler.watchFileSystem.watcher.mtimes;
                            changedFiles = Object.keys(mtimes);

                            changedFiles.forEach(function (changedFile) {
                                state.fileAnalyzer.validFiles.markFileInvalid(changedFile);
                            });
                            _context2.prev = 7;
                            tasks = changedFiles.map(function (changedFile) {
                                return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee() {
                                    return regeneratorRuntime.wrap(function _callee$(_context) {
                                        while (1) {
                                            switch (_context.prev = _context.next) {
                                                case 0:
                                                    if (!EXTENSIONS.test(changedFile)) {
                                                        _context.next = 6;
                                                        break;
                                                    }

                                                    if (!state.hasFile(changedFile)) {
                                                        _context.next = 6;
                                                        break;
                                                    }

                                                    _context.next = 4;
                                                    return state.readFileAndUpdate(changedFile);

                                                case 4:
                                                    _context.next = 6;
                                                    return state.fileAnalyzer.checkDependenciesLocked(resolver, changedFile);

                                                case 6:
                                                case 'end':
                                                    return _context.stop();
                                            }
                                        }
                                    }, _callee, this);
                                }));
                            });
                            _context2.next = 11;
                            return Promise.all(tasks);

                        case 11:
                            if (!state.options.forkChecker) {
                                state.updateProgram();
                            }
                            callback();
                            _context2.next = 19;
                            break;

                        case 15:
                            _context2.prev = 15;
                            _context2.t0 = _context2['catch'](7);

                            console.error(_context2.t0.toString());
                            callback();

                        case 19:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this, [[7, 15]]);
        }));
    });
}
var runChecker = function runChecker(instance, payload) {
    instance.checker.send({
        messageType: 'compile',
        payload: payload
    });
};
runChecker = _.debounce(runChecker, 200);
function setupAfterCompile(compiler, instanceName) {
    var forkChecker = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

    compiler.plugin('after-compile', function (compilation, callback) {
        if (compilation.compiler.isChild()) {
            callback();
            return;
        }
        var instance = resolveInstance(compilation.compiler, instanceName);
        var state = instance.tsState;
        if (forkChecker) {
            var payload = {
                files: state.allFiles(),
                resolutionCache: state.host.moduleResolutionHost.resolutionCache
            };
            runChecker(instance, payload);
        } else {
            (function () {
                if (!state.program || instance.shouldUpdateProgram) {
                    state.updateProgram();
                    instance.shouldUpdateProgram = false;
                }
                var diagnostics = state.ts.getPreEmitDiagnostics(state.program);
                var emitError = function emitError(msg) {
                    if (compilation.bail) {
                        console.error('Error in bail mode:', msg);
                        process.exit(1);
                    }
                    compilation.errors.push(new Error(msg));
                };
                var ignoreDiagnostics = instance.options.ignoreDiagnostics;

                diagnostics.filter(function (err) {
                    return !ignoreDiagnostics || ignoreDiagnostics.indexOf(err.code) == -1;
                }).map(function (err) {
                    return '[' + instanceName + '] ' + (0, _helpers.formatError)(err);
                }).forEach(emitError);
                instance.initedPlugins.forEach(function (plugin) {
                    plugin.processProgram(state.program);
                });
            })();
        }
        var phantomImports = [];
        state.allFileNames().forEach(function (fileName) {
            if (!instance.compiledFiles[fileName]) {
                phantomImports.push(fileName);
            }
        });
        if (instance.options.declaration) {
            phantomImports.forEach(function (imp) {
                var output = instance.tsState.services.getEmitOutput(imp);
                var declarationFile = output.outputFiles.filter(function (filePath) {
                    return !!filePath.name.match(/\.d.ts$/);
                })[0];
                if (declarationFile) {
                    var assetPath = path.relative(process.cwd(), declarationFile.name);
                    compilation.assets[assetPath] = {
                        source: function source() {
                            return declarationFile.text;
                        },
                        size: function size() {
                            return declarationFile.text.length;
                        }
                    };
                }
            });
        }
        instance.compiledFiles = {};
        compilation.fileDependencies.push.apply(compilation.fileDependencies, phantomImports);
        compilation.fileDependencies = _.uniq(compilation.fileDependencies);
        callback();
    });
}