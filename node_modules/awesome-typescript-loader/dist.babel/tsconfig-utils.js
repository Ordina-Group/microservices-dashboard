'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.tsconfigSuggestions = tsconfigSuggestions;
exports.parseContent = parseContent;
exports.rawToTsCompilerOptions = rawToTsCompilerOptions;

var _path = require('path');

var path = _interopRequireWildcard(_path);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var colors = require('colors/safe');
var parseJson = require('parse-json');
var stripBom = require('strip-bom');
var stripComments = require('strip-json-comments');
var TSCONFIG_ERROR = colors.red('\n\n[awesome-typescript-loader] You have `resolveGlobs` enabled and don\'t have an `exclude` directive in your tsconfig file. This WILL slow down your compilation. Please add:\n    {\n        // ...\n        "exclude": [\n            "node_modules",\n            "bower_components"\n        ]\n    }\n');
function tsconfigSuggestions(config) {
    var hasOnlyFiles = config.files && !config.filesGlob && !config.exclude;
    if (hasOnlyFiles) {
        return;
    }
    var hasExclude = config.exclude && (config.exclude.indexOf('node_modules') !== -1 || config.exclude.indexOf('./node_modules') !== -1);
    var hasGlobIgnore = config.filesGlob && (config.filesGlob.some(function (item) {
        return item.indexOf('!node_modules') !== -1;
    }) || !config.filesGlob.some(function (item) {
        return item.indexOf('!./node_modules') !== -1;
    }));
    if (!hasExclude && !hasGlobIgnore) {
        console.warn(TSCONFIG_ERROR);
    }
}
function parseContent(contents, filename) {
    var data = stripComments(stripBom(contents));
    if (/^\s*$/.test(data)) {
        return {};
    }
    return parseJson(data, null, filename);
}
function buildEnumMap(tsImpl) {
    var typescriptEnumMap = {
        target: {
            'es3': tsImpl.ScriptTarget.ES3,
            'es5': tsImpl.ScriptTarget.ES5,
            'es6': tsImpl.ScriptTarget.ES6,
            'es2015': tsImpl.ScriptTarget.ES2015,
            'latest': tsImpl.ScriptTarget.Latest
        },
        module: {
            'none': tsImpl.ModuleKind.None,
            'commonjs': tsImpl.ModuleKind.CommonJS,
            'amd': tsImpl.ModuleKind.AMD,
            'umd': tsImpl.ModuleKind.UMD,
            'system': tsImpl.ModuleKind.System,
            'es6': tsImpl.ModuleKind.ES6,
            'es2015': tsImpl.ModuleKind.ES2015
        },
        moduleResolution: {
            'node': tsImpl.ModuleResolutionKind.NodeJs,
            'classic': tsImpl.ModuleResolutionKind.Classic
        },
        jsx: {
            'preserve': tsImpl.JsxEmit.Preserve,
            'react': tsImpl.JsxEmit.React
        },
        newLine: {
            'CRLF': tsImpl.NewLineKind.CarriageReturnLineFeed,
            'LF': tsImpl.NewLineKind.LineFeed
        }
    };
    return typescriptEnumMap;
}
function rawToTsCompilerOptions(jsonOptions, projectDir, tsImpl) {
    var typescriptEnumMap = buildEnumMap(tsImpl);
    var compilerOptions = {};
    for (var key in jsonOptions) {
        if (typescriptEnumMap[key]) {
            compilerOptions[key] = typescriptEnumMap[key][jsonOptions[key].toLowerCase()];
        } else {
            compilerOptions[key] = jsonOptions[key];
        }
    }
    if (compilerOptions.outDir !== undefined) {
        compilerOptions.outDir = path.resolve(projectDir, compilerOptions.outDir);
    }
    if (compilerOptions.rootDir !== undefined) {
        compilerOptions.rootDir = path.resolve(projectDir, compilerOptions.rootDir);
    }
    if (compilerOptions.out !== undefined) {
        compilerOptions.out = path.resolve(projectDir, compilerOptions.out);
    }
    if (compilerOptions.outFile !== undefined) {
        compilerOptions.out = path.resolve(projectDir, compilerOptions.outFile);
    }
    return compilerOptions;
}