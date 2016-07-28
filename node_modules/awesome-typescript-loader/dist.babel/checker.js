'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createChecker = createChecker;
exports.resetChecker = resetChecker;

var _lodash = require('lodash');

var _ = _interopRequireWildcard(_lodash);

var _child_process = require('child_process');

var childProcess = _interopRequireWildcard(_child_process);

var _path = require('path');

var path = _interopRequireWildcard(_path);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function createChecker(compilerInfo, compilerOptions, webpackOptions, plugins) {
    var checker = childProcess.fork(path.join(__dirname, 'checker-runtime.js'));
    checker.send({
        messageType: 'init',
        payload: {
            compilerInfo: _.omit(compilerInfo, 'tsImpl'),
            compilerOptions: compilerOptions,
            webpackOptions: webpackOptions,
            plugins: plugins
        }
    }, null);
    checker.inProgress = false;
    checker.compilerInfo = compilerInfo;
    checker.compilerOptions = compilerOptions;
    checker.webpackOptions = webpackOptions;
    checker.on('message', function (msg) {
        if (msg.messageType == 'progress') {
            checker.inProgress = msg.payload.inProgress;
        }
    });
    return checker;
}
function resetChecker(checker) {
    if (checker.inProgress) {
        checker.kill('SIGKILL');
        return createChecker(checker.compilerInfo, checker.compilerOptions, checker.webpackOptions, checker.plugins);
    } else {
        return checker;
    }
}