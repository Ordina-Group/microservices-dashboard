'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.State = exports.Host = exports.ModuleResolutionHost = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.TypeScriptCompilationError = TypeScriptCompilationError;

var _fs = require('fs');

var fs = _interopRequireWildcard(_fs);

var _util = require('util');

var util = _interopRequireWildcard(_util);

var _path = require('path');

var path = _interopRequireWildcard(_path);

var _deps = require('./deps');

var _helpers = require('./helpers');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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

var promisify = require('es6-promisify');
var objectAssign = require('object-assign');
var RUNTIME = (0, _helpers.loadLib)('../lib/runtime.d.ts');

var ModuleResolutionHost = exports.ModuleResolutionHost = function () {
    function ModuleResolutionHost(servicesHost) {
        _classCallCheck(this, ModuleResolutionHost);

        this.resolutionCache = {};
        this.servicesHost = servicesHost;
    }

    _createClass(ModuleResolutionHost, [{
        key: 'fileExists',
        value: function fileExists(fileName) {
            return this.servicesHost.getScriptSnapshot(fileName) !== undefined;
        }
    }, {
        key: 'readFile',
        value: function readFile(fileName) {
            var snapshot = this.servicesHost.getScriptSnapshot(fileName);
            return snapshot && snapshot.getText(0, snapshot.getLength());
        }
    }]);

    return ModuleResolutionHost;
}();

var Host = exports.Host = function () {
    function Host(state) {
        _classCallCheck(this, Host);

        this.state = state;
        this.moduleResolutionHost = new ModuleResolutionHost(this);
    }

    _createClass(Host, [{
        key: 'getScriptFileNames',
        value: function getScriptFileNames() {
            return this.state.allFileNames();
        }
    }, {
        key: 'getScriptVersion',
        value: function getScriptVersion(fileName) {
            if (this.state.getFile(fileName)) {
                return this.state.getFile(fileName).version.toString();
            }
        }
    }, {
        key: 'getScriptSnapshot',
        value: function getScriptSnapshot(fileName) {
            var file = this.state.getFile(fileName);
            if (!file) {
                try {
                    if (!fileName.match(/\.tsx?$|package[.]json?$/)) {
                        var matchedExcludes = this.state.options.exclude.filter(function (excl) {
                            return fileName.indexOf(excl) !== -1;
                        });
                        if (matchedExcludes.length > 0) {
                            return;
                        }
                    }
                    var text = this.state.readFileSync(fileName);
                    file = {
                        version: 0,
                        text: text
                    };
                    if (path.basename(fileName) !== 'package.json') {
                        file = this.state.addFile(fileName, text);
                    }
                } catch (e) {
                    return;
                }
            }
            return this.state.ts.ScriptSnapshot.fromString(file.text);
        }
    }, {
        key: 'getCurrentDirectory',
        value: function getCurrentDirectory() {
            return process.cwd();
        }
    }, {
        key: 'getScriptIsOpen',
        value: function getScriptIsOpen() {
            return true;
        }
    }, {
        key: 'getCompilationSettings',
        value: function getCompilationSettings() {
            return this.state.options;
        }
    }, {
        key: 'getDefaultLibFileName',
        value: function getDefaultLibFileName(options) {
            return options.target === this.state.ts.ScriptTarget.ES6 ? this.state.compilerInfo.lib6.fileName : this.state.compilerInfo.lib5.fileName;
        }
    }, {
        key: 'resolveModuleNames',
        value: function resolveModuleNames(moduleNames, containingFile) {
            var resolvedModules = [];
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = moduleNames[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var moduleName = _step.value;

                    var resolvedFileName = void 0;
                    var resolvedModule = void 0;
                    try {
                        resolvedFileName = this.state.resolver(this.state.normalizePath(path.dirname(containingFile)), moduleName);
                        if (!resolvedFileName.match(/\.tsx?$/)) {
                            resolvedFileName = null;
                        }
                    } catch (e) {
                        resolvedFileName = null;
                    }
                    var tsResolved = this.state.ts.resolveModuleName(resolvedFileName || moduleName, containingFile, this.state.options, this.moduleResolutionHost);
                    if (tsResolved.resolvedModule) {
                        resolvedModule = tsResolved.resolvedModule;
                    } else {
                        resolvedModule = {
                            resolvedFileName: resolvedFileName || ''
                        };
                    }
                    this.moduleResolutionHost.resolutionCache[containingFile + '::' + moduleName] = resolvedModule;
                    resolvedModules.push(resolvedModule);
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            return resolvedModules;
        }
    }, {
        key: 'log',
        value: function log(message) {}
    }]);

    return Host;
}();

var State = exports.State = function () {
    function State(options, fsImpl, compilerInfo, resolver) {
        _classCallCheck(this, State);

        this.files = {};
        this.ts = compilerInfo.tsImpl;
        this.compilerInfo = compilerInfo;
        this.resolver = resolver;
        this.fs = fsImpl;
        this.readFileImpl = promisify(this.fs.readFile.bind(this.fs));
        this.host = new Host(this);
        this.services = this.ts.createLanguageService(this.host, this.ts.createDocumentRegistry());
        this.fileAnalyzer = new _deps.FileAnalyzer(this);
        this.options = {};
        objectAssign(this.options, options);
        if (this.options.emitRequireType) {
            this.addFile(RUNTIME.fileName, RUNTIME.text);
        }
        if (!this.options.noLib) {
            if (this.options.target === this.ts.ScriptTarget.ES6 || this.options.library === 'es6') {
                this.addFile(this.compilerInfo.lib6.fileName, this.compilerInfo.lib6.text);
            } else {
                this.addFile(this.compilerInfo.lib5.fileName, this.compilerInfo.lib5.text);
            }
        }
    }

    _createClass(State, [{
        key: 'updateProgram',
        value: function updateProgram() {
            this.program = this.services.getProgram();
        }
    }, {
        key: 'allFileNames',
        value: function allFileNames() {
            return Object.keys(this.files);
        }
    }, {
        key: 'getSourceFile',
        value: function getSourceFile(fileName) {
            var services = this.services;
            return (services.getSourceFile || services.getNonBoundSourceFile)(fileName);
        }
    }, {
        key: 'allFiles',
        value: function allFiles() {
            return this.files;
        }
    }, {
        key: 'emit',
        value: function emit(fileName) {
            fileName = this.normalizePath(fileName);
            if (!this.program) {
                this.program = this.services.getProgram();
            }
            var outputFiles = [];
            function writeFile(fileName, data, writeByteOrderMark) {
                outputFiles.push({
                    sourceName: fileName,
                    name: fileName,
                    writeByteOrderMark: writeByteOrderMark,
                    text: data
                });
            }
            var source = this.program.getSourceFile(fileName);
            if (!source) {
                this.updateProgram();
                source = this.program.getSourceFile(fileName);
                if (!source) {
                    throw new Error('File ' + fileName + ' was not found in program');
                }
            }
            var emitResult = this.program.emit(source, writeFile);
            var output = {
                outputFiles: outputFiles,
                emitSkipped: emitResult.emitSkipped
            };
            if (!output.emitSkipped) {
                return output;
            } else {
                throw new Error("Emit skipped");
            }
        }
    }, {
        key: 'fastEmit',
        value: function fastEmit(fileName) {
            fileName = this.normalizePath(fileName);
            var file = this.getFile(fileName);
            if (!file) {
                throw new Error('Unknown file ' + fileName);
            }
            var transpileResult = this.ts.transpileModule(file.text, {
                compilerOptions: this.options,
                reportDiagnostics: false,
                fileName: fileName
            });
            return {
                text: transpileResult.outputText,
                sourceMap: transpileResult.sourceMapText
            };
        }
    }, {
        key: 'updateFile',
        value: function updateFile(fileName, text) {
            var checked = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

            fileName = this.normalizePath(fileName);
            var prevFile = this.files[fileName];
            var version = 0;
            var changed = true;
            if (prevFile) {
                if (!checked || checked && text !== prevFile.text) {
                    version = prevFile.version + 1;
                } else {
                    changed = false;
                }
            }
            this.files[fileName] = {
                text: text,
                version: version
            };
            return changed;
        }
    }, {
        key: 'addFile',
        value: function addFile(fileName, text) {
            fileName = this.normalizePath(fileName);
            return this.files[fileName] = {
                text: text,
                version: 0
            };
        }
    }, {
        key: 'getFile',
        value: function getFile(fileName) {
            fileName = this.normalizePath(fileName);
            return this.files[fileName];
        }
    }, {
        key: 'hasFile',
        value: function hasFile(fileName) {
            fileName = this.normalizePath(fileName);
            return this.files.hasOwnProperty(fileName);
        }
    }, {
        key: 'readFile',
        value: function readFile(fileName) {
            return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee() {
                var buf, string;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                fileName = this.normalizePath(fileName);
                                _context.next = 3;
                                return this.readFileImpl(fileName);

                            case 3:
                                buf = _context.sent;
                                string = buf.toString('utf8');
                                return _context.abrupt('return', string);

                            case 6:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));
        }
    }, {
        key: 'readFileSync',
        value: function readFileSync(fileName) {
            fileName = this.normalizePath(fileName);
            return fs.readFileSync(fileName, { encoding: 'utf-8' });
        }
    }, {
        key: 'readFileAndAdd',
        value: function readFileAndAdd(fileName) {
            return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee2() {
                var text;
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                fileName = this.normalizePath(fileName);
                                _context2.next = 3;
                                return this.readFile(fileName);

                            case 3:
                                text = _context2.sent;

                                this.addFile(fileName, text);

                            case 5:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));
        }
    }, {
        key: 'readFileAndUpdate',
        value: function readFileAndUpdate(fileName) {
            var checked = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

            return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee3() {
                var text;
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                fileName = this.normalizePath(fileName);
                                _context3.next = 3;
                                return this.readFile(fileName);

                            case 3:
                                text = _context3.sent;
                                return _context3.abrupt('return', this.updateFile(fileName, text, checked));

                            case 5:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));
        }
    }, {
        key: 'readFileAndUpdateSync',
        value: function readFileAndUpdateSync(fileName) {
            var checked = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

            fileName = this.normalizePath(fileName);
            var text = this.readFileSync(fileName);
            return this.updateFile(fileName, text, checked);
        }
    }, {
        key: 'normalizePath',
        value: function normalizePath(filePath) {
            return path.normalize(filePath);
        }
    }]);

    return State;
}();

function TypeScriptCompilationError(diagnostics) {
    this.diagnostics = diagnostics;
}
util.inherits(TypeScriptCompilationError, Error);