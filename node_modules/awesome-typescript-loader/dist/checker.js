import * as _ from 'lodash';
import * as childProcess from 'child_process';
import * as path from 'path';
export function createChecker(compilerInfo, compilerOptions, webpackOptions, plugins) {
    let checker = childProcess.fork(path.join(__dirname, 'checker-runtime.js'));
    checker.send({
        messageType: 'init',
        payload: {
            compilerInfo: _.omit(compilerInfo, 'tsImpl'),
            compilerOptions,
            webpackOptions,
            plugins
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
export function resetChecker(checker) {
    if (checker.inProgress) {
        checker.kill('SIGKILL');
        return createChecker(checker.compilerInfo, checker.compilerOptions, checker.webpackOptions, checker.plugins);
    }
    else {
        return checker;
    }
}
