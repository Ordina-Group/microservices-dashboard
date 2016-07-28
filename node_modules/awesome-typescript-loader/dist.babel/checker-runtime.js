'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Host = exports.ModuleResolutionHost = exports.MessageType = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _resolver = require('./resolver');

var _resolver2 = _interopRequireDefault(_resolver);

var _path = require('path');

var path = _interopRequireWildcard(_path);

var _fs = require('fs');

var fs = _interopRequireWildcard(_fs);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var colors = require('colors/safe');
require('babel-polyfill');
var MessageType = exports.MessageType = undefined;
(function (MessageType) {
    MessageType[MessageType["Init"] = 'init'] = "Init";
    MessageType[MessageType["Compile"] = 'compile'] = "Compile";
})(MessageType || (exports.MessageType = MessageType = {}));
var env = {};

var ModuleResolutionHost = exports.ModuleResolutionHost = function () {
    function ModuleResolutionHost(servicesHost) {
        _classCallCheck(this, ModuleResolutionHost);

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
    function Host() {
        _classCallCheck(this, Host);

        this.moduleResolutionHost = new ModuleResolutionHost(this);
        this.resolver = (0, _resolver2.default)(env.webpackOptions);
    }

    _createClass(Host, [{
        key: 'normalizePath',
        value: function normalizePath(filePath) {
            return path.normalize(filePath);
        }
    }, {
        key: 'getScriptFileNames',
        value: function getScriptFileNames() {
            return Object.keys(env.files);
        }
    }, {
        key: 'getScriptVersion',
        value: function getScriptVersion(fileName) {
            if (env.files[fileName]) {
                return env.files[fileName].version.toString();
            }
        }
    }, {
        key: 'getScriptSnapshot',
        value: function getScriptSnapshot(fileName) {
            var fileName_ = path.normalize(fileName);
            var file = env.files[fileName_];
            if (!file) {
                try {
                    file = {
                        version: 0,
                        text: fs.readFileSync(fileName, { encoding: 'utf8' }).toString()
                    };
                    if (path.basename(fileName) !== 'package.json') {
                        env.files[fileName_] = file;
                    }
                } catch (e) {
                    return;
                }
            }
            return env.compiler.ScriptSnapshot.fromString(file.text);
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
            return env.options;
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

                    var cached = env.resolutionCache[containingFile + '::' + moduleName];
                    if (cached) {
                        resolvedModules.push(cached);
                    } else {
                        var resolvedFileName = void 0;
                        var resolvedModule = void 0;
                        try {
                            resolvedFileName = this.resolver.resolveSync(this.normalizePath(path.dirname(containingFile)), moduleName);
                            if (!resolvedFileName.match(/\.tsx?$/)) {
                                resolvedFileName = null;
                            }
                        } catch (e) {
                            resolvedFileName = null;
                        }
                        var tsResolved = env.compiler.resolveModuleName(resolvedFileName || moduleName, containingFile, env.options, this.moduleResolutionHost);
                        if (tsResolved.resolvedModule) {
                            resolvedModule = tsResolved.resolvedModule;
                        } else {
                            resolvedModule = {
                                resolvedFileName: resolvedFileName || ''
                            };
                        }
                        resolvedModules.push(resolvedModule);
                    }
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
        key: 'getDefaultLibFileName',
        value: function getDefaultLibFileName(options) {
            return options.target === env.compiler.ScriptTarget.ES6 ? env.compilerInfo.lib6.fileName : env.compilerInfo.lib5.fileName;
        }
    }, {
        key: 'log',
        value: function log(message) {}
    }]);

    return Host;
}();

function processInit(payload) {
    env.compiler = require(payload.compilerInfo.compilerPath);
    env.compilerInfo = payload.compilerInfo;
    env.options = payload.compilerOptions;
    env.webpackOptions = payload.webpackOptions;
    env.host = new Host();
    env.service = env.compiler.createLanguageService(env.host, env.compiler.createDocumentRegistry());
    env.plugins = payload.plugins;
    env.initedPlugins = env.plugins.map(function (plugin) {
        return require(plugin.file)(plugin.options);
    });
}
var DECLARATION_FILE = /\.d\.ts/;
function processCompile(payload) {
    var instanceName = env.options.instanceName || 'default';
    var silent = !!env.options.forkCheckerSilent;
    if (!silent) {
        console.log(colors.cyan('[' + instanceName + '] Checking started in a separate process...'));
    }
    var timeStart = +new Date();
    process.send({
        messageType: 'progress',
        payload: {
            inProgress: true
        }
    });
    env.files = payload.files;
    env.resolutionCache = payload.resolutionCache;
    var program = env.program = env.service.getProgram();
    var allDiagnostics = [];
    if (env.options.skipDeclarationFilesCheck) {
        var sourceFiles = program.getSourceFiles();
        sourceFiles.forEach(function (sourceFile) {
            if (!sourceFile.fileName.match(DECLARATION_FILE)) {
                allDiagnostics = allDiagnostics.concat(env.compiler.getPreEmitDiagnostics(program, sourceFile));
            }
        });
        allDiagnostics = env.compiler.sortAndDeduplicateDiagnostics(allDiagnostics);
    } else {
        allDiagnostics = env.compiler.getPreEmitDiagnostics(program);
    }
    if (allDiagnostics.length) {
        allDiagnostics.forEach(function (diagnostic) {
            var message = env.compiler.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
            if (diagnostic.file) {
                var _diagnostic$file$getL = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);

                var line = _diagnostic$file$getL.line;
                var character = _diagnostic$file$getL.character;

                console.error('[' + instanceName + '] ' + colors.red(diagnostic.file.fileName) + ':' + (line + 1) + ':' + (character + 1) + ' \n    ' + colors.red(message));
            } else {
                console.error(colors.red('[' + instanceName + '] ' + message));
            }
        });
    } else {
        if (!silent) {
            var timeEnd = +new Date();
            console.log(colors.green('[' + instanceName + '] Ok, ' + (timeEnd - timeStart) / 1000 + ' sec.'));
        }
    }
    env.initedPlugins.forEach(function (plugin) {
        plugin.processProgram(program);
    });
    process.send({
        messageType: 'progress',
        payload: {
            inProgress: false
        }
    });
}
process.on('message', function (msg) {
    switch (msg.messageType) {
        case MessageType.Init:
            processInit(msg.payload);
            break;
        case MessageType.Compile:
            processCompile(msg.payload);
            break;
    }
});