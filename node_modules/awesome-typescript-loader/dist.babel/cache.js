'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.findCompiledModule = findCompiledModule;
exports.cache = cache;

var _fs = require('fs');

var fs = _interopRequireWildcard(_fs);

var _os = require('os');

var os = _interopRequireWildcard(_os);

var _path = require('path');

var path = _interopRequireWildcard(_path);

var _zlib = require('zlib');

var zlib = _interopRequireWildcard(_zlib);

var _crypto = require('crypto');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function findCompiledModule(fileName) {
    var baseFileName = fileName.replace(/(\.ts|\.tsx)$/, '');
    var compiledFileName = baseFileName + '.js';
    if (fs.existsSync(compiledFileName)) {
        var mapFileName = baseFileName + '.js.map';
        var isMapExists = fs.existsSync(mapFileName);
        var result = {
            fileName: compiledFileName,
            text: fs.readFileSync(compiledFileName).toString(),
            mapName: isMapExists ? mapFileName : null,
            map: isMapExists ? fs.readFileSync(mapFileName).toString() : null
        };
        return result;
    } else {
        return null;
    }
}
function read(filename, callback) {
    return fs.readFile(filename, function (err, data) {
        if (err) {
            return callback(err);
        }
        return zlib.gunzip(data, function (err, content) {
            var result = {};
            if (err) {
                return callback(err);
            }
            try {
                result = JSON.parse(content);
            } catch (e) {
                return callback(e);
            }
            return callback(null, result);
        });
    });
}
;
function write(filename, result, callback) {
    var content = JSON.stringify(result);
    return zlib.gzip(content, function (err, data) {
        if (err) {
            return callback(err);
        }
        return fs.writeFile(filename, data, callback);
    });
}
;
function filename(source, identifier, options) {
    var hash = (0, _crypto.createHash)('sha512');
    var contents = JSON.stringify({
        identifier: identifier,
        options: options,
        source: source
    });
    hash.end(contents);
    return hash.read().toString('hex') + '.json.gzip';
}
;
function cache(params, callback) {
    var source = params.source;
    var options = params.options || {};
    var transform = params.transform;
    var identifier = params.identifier;
    var directory = typeof params.directory === 'string' ? params.directory : os.tmpdir();
    var file = path.join(directory, filename(source, identifier, options));
    return read(file, function (err, content) {
        var result = {};
        if (!err) {
            return callback(null, content);
        }
        try {
            result = transform(source, options);
        } catch (error) {
            return callback(error);
        }
        return write(file, result, function (err) {
            return callback(err, result);
        });
    });
}
;