'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ResolutionError = exports.ValidFilesManager = exports.DependencyManager = exports.FileAnalyzer = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.createResolver = createResolver;

var _lodash = require('lodash');

var _ = _interopRequireWildcard(_lodash);

var _path = require('path');

var path = _interopRequireWildcard(_path);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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
function createResolver(externals, exclude, webpackResolver) {
    var ctx = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];

    var finalResolver = webpackResolver;
    if (webpackResolver.length === 4) {
        finalResolver = webpackResolver.bind(ctx, {});
    }
    var resolver = promisify(finalResolver);
    function resolve(base, dep) {
        var inWebpackExternals = externals && externals.hasOwnProperty(dep);
        var inTypeScriptExclude = false;
        if (inWebpackExternals || inTypeScriptExclude) {
            return Promise.resolve('%%ignore');
        } else {
            return resolver(base, dep).then(function (resultPath) {
                if (Array.isArray(resultPath)) {
                    resultPath = resultPath[0];
                }
                if (!resultPath.match(/.tsx?$/)) {
                    var matchedExcludes = exclude.filter(function (excl) {
                        return resultPath.indexOf(excl) !== -1;
                    });
                    if (matchedExcludes.length > 0) {
                        return '%%ignore';
                    } else {
                        return resultPath;
                    }
                } else {
                    return resultPath;
                }
            });
        }
    }
    return resolve;
}
function isTypeDeclaration(fileName) {
    return (/\.d.ts$/.test(fileName)
    );
}
function isImportOrExportDeclaration(node) {
    return (!!node.exportClause || !!node.importClause) && node.moduleSpecifier;
}
function isImportEqualsDeclaration(node) {
    return !!node.moduleReference && node.moduleReference.hasOwnProperty('expression');
}
function isIgnoreDependency(absulutePath) {
    return absulutePath == '%%ignore';
}
var lock = void 0;

var FileAnalyzer = exports.FileAnalyzer = function () {
    function FileAnalyzer(state) {
        _classCallCheck(this, FileAnalyzer);

        this.dependencies = new DependencyManager();
        this.validFiles = new ValidFilesManager();
        this.state = state;
    }

    _createClass(FileAnalyzer, [{
        key: 'checkDependenciesLocked',
        value: function checkDependenciesLocked(resolver, fileName) {
            return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee() {
                var _this = this;

                var isValid, resolveLock, checked;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                isValid = this.validFiles.isFileValid(fileName);

                                if (!isValid) {
                                    _context.next = 3;
                                    break;
                                }

                                return _context.abrupt('return', isValid);

                            case 3:
                                if (!lock) {
                                    _context.next = 5;
                                    break;
                                }

                                return _context.abrupt('return', lock.then(function () {
                                    return _this.checkDependenciesLocked(resolver, fileName);
                                }));

                            case 5:
                                resolveLock = void 0;

                                lock = new Promise(function (res, rej) {
                                    resolveLock = res;
                                });
                                _context.prev = 7;
                                _context.next = 10;
                                return this.checkDependencies(resolver, fileName);

                            case 10:
                                checked = _context.sent;
                                return _context.abrupt('return', checked);

                            case 12:
                                _context.prev = 12;

                                lock = null;
                                resolveLock();
                                return _context.finish(12);

                            case 16:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this, [[7,, 12, 16]]);
            }));
        }
    }, {
        key: 'checkDependencies',
        value: function checkDependencies(resolver, fileName) {
            return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee2() {
                var isValid, changed;
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                isValid = this.validFiles.isFileValid(fileName);

                                if (!isValid) {
                                    _context2.next = 3;
                                    break;
                                }

                                return _context2.abrupt('return', isValid);

                            case 3:
                                this.validFiles.markFileValid(fileName);
                                this.dependencies.clearDependencies(fileName);
                                changed = false;
                                _context2.prev = 6;

                                if (this.state.hasFile(fileName)) {
                                    _context2.next = 11;
                                    break;
                                }

                                _context2.next = 10;
                                return this.state.readFileAndUpdate(fileName);

                            case 10:
                                changed = _context2.sent;

                            case 11:
                                _context2.next = 13;
                                return this.checkDependenciesInternal(resolver, fileName);

                            case 13:
                                _context2.next = 19;
                                break;

                            case 15:
                                _context2.prev = 15;
                                _context2.t0 = _context2['catch'](6);

                                this.validFiles.markFileInvalid(fileName);
                                throw _context2.t0;

                            case 19:
                                return _context2.abrupt('return', changed);

                            case 20:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this, [[6, 15]]);
            }));
        }
    }, {
        key: 'checkDependenciesInternal',
        value: function checkDependenciesInternal(resolver, fileName) {
            return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee3() {
                var imports, tasks, i, importPath, isDeclaration, isRequiredJs, hasDeclaration;
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                _context3.next = 2;
                                return this.findImportDeclarations(resolver, fileName);

                            case 2:
                                imports = _context3.sent;
                                tasks = [];
                                i = 0;

                            case 5:
                                if (!(i < imports.length)) {
                                    _context3.next = 22;
                                    break;
                                }

                                importPath = imports[i];
                                isDeclaration = isTypeDeclaration(importPath);
                                isRequiredJs = /\.js$/.exec(importPath) || importPath.indexOf('.') === -1;

                                if (!isDeclaration) {
                                    _context3.next = 14;
                                    break;
                                }

                                hasDeclaration = this.dependencies.hasTypeDeclaration(importPath);

                                if (!hasDeclaration) {
                                    this.dependencies.addTypeDeclaration(importPath);
                                    tasks.push(this.checkDependencies(resolver, importPath));
                                }
                                _context3.next = 19;
                                break;

                            case 14:
                                if (!(isRequiredJs && !this.state.options.allowJs)) {
                                    _context3.next = 18;
                                    break;
                                }

                                return _context3.abrupt('continue', 19);

                            case 18:
                                if (!checkIfModuleBuiltInCached(importPath)) {
                                    this.dependencies.addDependency(fileName, importPath);
                                    tasks.push(this.checkDependencies(resolver, importPath));
                                }

                            case 19:
                                i++;
                                _context3.next = 5;
                                break;

                            case 22:
                                _context3.next = 24;
                                return Promise.all(tasks);

                            case 24:
                                return _context3.abrupt('return', null);

                            case 25:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));
        }
    }, {
        key: 'findImportDeclarations',
        value: function findImportDeclarations(resolver, fileName) {
            return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee5() {
                var _this2 = this;

                var sourceFile, isDeclaration, imports, visit, task, resolvedImports;
                return regeneratorRuntime.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                sourceFile = this.state.getSourceFile(fileName);
                                isDeclaration = isTypeDeclaration(fileName);
                                imports = [];

                                visit = function visit(node) {
                                    if (!isDeclaration && isImportEqualsDeclaration(node)) {
                                        var importPath = node.moduleReference.expression.text;
                                        imports.push(importPath);
                                    } else if (!isDeclaration && isImportOrExportDeclaration(node)) {
                                        var _importPath = node.moduleSpecifier.text;
                                        imports.push(_importPath);
                                    }
                                };

                                imports.push.apply(imports, sourceFile.referencedFiles.map(function (file) {
                                    return file.fileName;
                                }));
                                this.state.ts.forEachChild(sourceFile, visit);
                                task = imports.map(function (importPath) {
                                    return __awaiter(_this2, void 0, void 0, regeneratorRuntime.mark(function _callee4() {
                                        var absolutePath;
                                        return regeneratorRuntime.wrap(function _callee4$(_context4) {
                                            while (1) {
                                                switch (_context4.prev = _context4.next) {
                                                    case 0:
                                                        _context4.next = 2;
                                                        return this.resolve(resolver, fileName, importPath);

                                                    case 2:
                                                        absolutePath = _context4.sent;

                                                        if (isIgnoreDependency(absolutePath)) {
                                                            _context4.next = 5;
                                                            break;
                                                        }

                                                        return _context4.abrupt('return', absolutePath);

                                                    case 5:
                                                    case 'end':
                                                        return _context4.stop();
                                                }
                                            }
                                        }, _callee4, this);
                                    }));
                                });
                                _context5.next = 9;
                                return Promise.all(task);

                            case 9:
                                resolvedImports = _context5.sent;
                                return _context5.abrupt('return', resolvedImports.filter(Boolean));

                            case 11:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));
        }
    }, {
        key: 'resolve',
        value: function resolve(resolver, fileName, defPath) {
            var result = void 0;
            if (/^[a-z0-9].*\.d\.ts$/.test(defPath)) {
                defPath = './' + defPath;
            }
            if (isTypeDeclaration(defPath)) {
                result = Promise.resolve(path.resolve(path.dirname(fileName), defPath));
            } else {
                result = resolver(path.dirname(fileName), defPath).catch(function (error) {
                    if (checkIfModuleBuiltIn(defPath)) {
                        return defPath;
                    } else {
                        throw error;
                    }
                });
            }
            return result.catch(function (error) {
                var detailedError = new ResolutionError();
                detailedError.message = error.message + "\n    Required in " + fileName;
                detailedError.cause = error;
                detailedError.fileName = fileName;
                throw detailedError;
            });
        }
    }]);

    return FileAnalyzer;
}();

var builtInCache = {};
function checkIfModuleBuiltInCached(modPath) {
    return !!builtInCache[modPath];
}
function checkIfModuleBuiltIn(modPath) {
    if (builtInCache[modPath]) {
        return true;
    }
    try {
        if (require.resolve(modPath) === modPath) {
            builtInCache[modPath] = true;
            return true;
        }
    } catch (e) {}
    return false;
}

var DependencyManager = exports.DependencyManager = function () {
    function DependencyManager() {
        var dependencies = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
        var knownTypeDeclarations = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        _classCallCheck(this, DependencyManager);

        this.dependencies = dependencies;
        this.knownTypeDeclarations = knownTypeDeclarations;
        this.compiledModules = {};
    }

    _createClass(DependencyManager, [{
        key: 'clone',
        value: function clone() {
            return new DependencyManager(_.cloneDeep(this.dependencies), _.cloneDeep(this.knownTypeDeclarations));
        }
    }, {
        key: 'addDependency',
        value: function addDependency(fileName, depFileName) {
            if (!this.dependencies.hasOwnProperty(fileName)) {
                this.clearDependencies(fileName);
            }
            this.dependencies[fileName].push(depFileName);
        }
    }, {
        key: 'addCompiledModule',
        value: function addCompiledModule(fileName, depFileName) {
            if (!this.compiledModules.hasOwnProperty(fileName)) {
                this.clearCompiledModules(fileName);
            }
            var store = this.compiledModules[fileName];
            if (store.indexOf(depFileName) === -1) {
                store.push(depFileName);
            }
        }
    }, {
        key: 'clearDependencies',
        value: function clearDependencies(fileName) {
            this.dependencies[fileName] = [];
        }
    }, {
        key: 'clearCompiledModules',
        value: function clearCompiledModules(fileName) {
            this.compiledModules[fileName] = [];
        }
    }, {
        key: 'getDependencies',
        value: function getDependencies(fileName) {
            if (!this.dependencies.hasOwnProperty(fileName)) {
                this.clearDependencies(fileName);
            }
            return this.dependencies[fileName].slice();
        }
    }, {
        key: 'addTypeDeclaration',
        value: function addTypeDeclaration(fileName) {
            this.knownTypeDeclarations[fileName] = true;
        }
    }, {
        key: 'hasTypeDeclaration',
        value: function hasTypeDeclaration(fileName) {
            return this.knownTypeDeclarations.hasOwnProperty(fileName);
        }
    }, {
        key: 'getTypeDeclarations',
        value: function getTypeDeclarations() {
            return objectAssign({}, this.knownTypeDeclarations);
        }
    }, {
        key: 'getDependencyGraph',
        value: function getDependencyGraph(fileName) {
            var _this3 = this;

            var appliedDeps = {};
            var result = {
                fileName: fileName,
                dependencies: []
            };
            var walk = function walk(fileName, context) {
                _this3.getDependencies(fileName).forEach(function (depFileName) {
                    var depContext = {
                        fileName: depFileName,
                        dependencies: []
                    };
                    context.dependencies.push(depContext);
                    if (!appliedDeps[depFileName]) {
                        appliedDeps[depFileName] = true;
                        walk(depFileName, depContext);
                    }
                });
            };
            walk(fileName, result);
            return result;
        }
    }, {
        key: 'applyCompiledFiles',
        value: function applyCompiledFiles(fileName, deps) {
            if (!this.compiledModules.hasOwnProperty(fileName)) {
                this.clearCompiledModules(fileName);
            }
            this.compiledModules[fileName].forEach(function (mod) {
                deps.add(mod);
            });
        }
    }, {
        key: 'applyChain',
        value: function applyChain(fileName, deps) {
            if (!this.dependencies.hasOwnProperty(fileName)) {
                this.clearDependencies(fileName);
            }
            var appliedDeps = {};
            var graph = this.getDependencyGraph(fileName);
            var walk = function walk(item) {
                var itemFileName = item.fileName;
                if (!appliedDeps[itemFileName]) {
                    appliedDeps[itemFileName] = true;
                    deps.add(itemFileName);
                    item.dependencies.forEach(function (dep) {
                        return walk(dep);
                    });
                }
            };
            walk(graph);
        }
    }]);

    return DependencyManager;
}();

var ValidFilesManager = exports.ValidFilesManager = function () {
    function ValidFilesManager() {
        _classCallCheck(this, ValidFilesManager);

        this.files = {};
    }

    _createClass(ValidFilesManager, [{
        key: 'isFileValid',
        value: function isFileValid(fileName) {
            return this.files[fileName];
        }
    }, {
        key: 'markFileValid',
        value: function markFileValid(fileName) {
            this.files[fileName] = true;
        }
    }, {
        key: 'markFileInvalid',
        value: function markFileInvalid(fileName) {
            this.files[fileName] = false;
        }
    }]);

    return ValidFilesManager;
}();

var ResolutionError = exports.ResolutionError = function (_Error) {
    _inherits(ResolutionError, _Error);

    function ResolutionError() {
        _classCallCheck(this, ResolutionError);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(ResolutionError).apply(this, arguments));
    }

    return ResolutionError;
}(Error);