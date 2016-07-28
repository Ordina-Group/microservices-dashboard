## A sister of [bundle-loader](https://github.com/webpack/bundle-loader) with promise API
## A sister of [promise-loader](https://github.com/gaearon/promise-loader) with promise API

### ES6 Promise Loader

[Documentation: Using loaders](http://webpack.github.io/docs/using-loaders.html)

It only implements so-called `lazy` `bundle-loader` mode—that is, `require` returns a function that, when invoked, returns a promise that resolves to the module.

`require: (string) -> () -> Promise<module>`

It's up to you to specify your Promise library of choice as a parameter.

``` javascript
// Assuming you use Bluebird
var load = require("promise?bluebird!./file.js");

// The chunk is not requested until you call the load function
load(namespace).then(function(file) {

});
```

If a promise library is already loaded externally you can specify 'global'.


You can optionally specify [a name for your chunk](http://webpack.github.io/docs/code-splitting.html#named-chunks) after a comma:

```javascript
var load = require("promise?bluebird,editor!./editor.js");
```

This can be useful for [single-page apps](http://webpack.github.io/docs/optimization.html#single-page-app) because you can later extract filenames from [Webpack-generated stats](https://github.com/webpack/docs/wiki/node.js-api#stats) and pre-load specific bundles if you know user's going to hit them.

The bundle name may include `[filename]`, which will be replaced with the filename, and `[name]`, which omits the extension. This is useful for when you want to configure loaders in Webpack configuration without specifying precise filenames—for example, by a suffix:

```javascript
{
  test: /\.i18n\.json$/,
  loader: 'promise?global,[name].i18n'
}
```

### License

MIT (http://www.opensource.org/licenses/mit-license.php)

