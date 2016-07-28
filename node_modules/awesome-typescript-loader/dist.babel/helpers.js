'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.findResultFor = findResultFor;
exports.codegenErrorReport = codegenErrorReport;
exports.formatError = formatError;
exports.formatMessageChain = formatMessageChain;
exports.formatLineChar = formatLineChar;
exports.loadLib = loadLib;

var _fs = require('fs');

var fs = _interopRequireWildcard(_fs);

var _path = require('path');

var path = _interopRequireWildcard(_path);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function withoutExt(fileName) {
    return path.join(path.dirname(fileName), path.basename(fileName).split('.')[0]);
}
function isFileEmit(fileName, outputFileName, sourceFileName) {
    return sourceFileName === fileName && (outputFileName.substr(-3) === '.js' || outputFileName.substr(-4) === '.jsx');
}
function isSourceMapEmit(fileName, outputFileName, sourceFileName) {
    return sourceFileName === fileName && (outputFileName.substr(-7) === '.js.map' || outputFileName.substr(-8) === '.jsx.map');
}
function isDeclarationEmit(fileName, outputFileName, sourceFileName) {
    return sourceFileName === fileName && outputFileName.substr(-5) === '.d.ts';
}
function findResultFor(output, fileName) {
    var text = void 0;
    var sourceMap = void 0;
    var declaration = void 0;
    fileName = withoutExt(path.normalize(fileName));
    for (var i = 0; i < output.outputFiles.length; i++) {
        var o = output.outputFiles[i];
        var outputFileName = path.normalize(o.name);
        var sourceFileName = withoutExt(path.normalize(o.sourceName));
        if (isFileEmit(fileName, outputFileName, sourceFileName)) {
            text = o.text;
        }
        if (isSourceMapEmit(fileName, outputFileName, sourceFileName)) {
            sourceMap = o.text;
        }
        if (isDeclarationEmit(fileName, outputFileName, sourceFileName)) {
            declaration = o;
        }
    }
    return {
        text: text,
        sourceMap: sourceMap,
        declaration: declaration
    };
}
function codegenErrorReport(errors) {
    return errors.map(function (error) {
        return 'console.error(' + JSON.stringify(error) + ');';
    }).join('\n');
}
function formatError(diagnostic) {
    var lineChar = void 0;
    if (diagnostic.file) {
        lineChar = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
    }
    return (diagnostic.file ? diagnostic.file.fileName : '') + (lineChar ? formatLineChar(lineChar) + ' ' : '') + "\n" + (typeof diagnostic.messageText == "string" ? diagnostic.messageText : formatMessageChain(diagnostic.messageText));
}
function formatMessageChain(chain) {
    var result = "";
    var separator = "\n  ";
    var current = chain;
    while (current) {
        result += current.messageText;
        if (!!current.next) {
            result += separator;
            separator += "  ";
        }
        current = current.next;
    }
    return result;
}
function formatLineChar(lineChar) {
    return ':' + (lineChar.line + 1) + ':' + lineChar.character;
}
function loadLib(moduleId) {
    var fileName = require.resolve(moduleId);
    var text = fs.readFileSync(fileName, 'utf8');
    return {
        fileName: fileName,
        text: text
    };
}