/*
 MIT License http://www.opensource.org/licenses/mit-license.php
 Author Patrick Stapleton @gdi2290
 Shamelessly based on bundle-loader by Dan Abramov @dan_abramov
 Which was
 Shamelessly based on bundle-loader by Tobias Koppers @sokra
 */

 var path = require('path');

module.exports = function () {};
module.exports.pitch = function (remainingRequest) {
  this.cacheable && this.cacheable();
  var query = this.query.substring(1).split(','),
    bundleName = query[1] || '';
  var filename = path.basename(remainingRequest);
  var name = path.basename(remainingRequest, path.extname(filename));

  bundleName = bundleName.replace(/\[filename\]/g, filename).replace(/\[name\]/g, name);

  var result = [
    'module.exports = function (namespace) {\n',
    '  return new Promise(function (resolve) {\n',
    '    require.ensure([], function (require) {\n',
    '      if (namespace) {\n',
    '        resolve(require(', JSON.stringify('!!' + remainingRequest), ')[namespace]);\n',
    '      } else {\n',
    '        resolve(require(', JSON.stringify('!!' + remainingRequest), '));\n',
    '      }\n',
    '    }' + (bundleName && (', ' + JSON.stringify(bundleName))) + ');\n',
    '  });\n',
    '}'
  ];

  return result.join('');
};
