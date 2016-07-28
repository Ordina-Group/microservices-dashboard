# karma-mocha-reporter

> Karma reporter plugin with mocha style logging.

> [![NPM version](https://badge.fury.io/js/karma-mocha-reporter.svg)](http://badge.fury.io/js/karma-mocha-reporter)
[![Build Status](https://secure.travis-ci.org/litixsoft/karma-mocha-reporter.svg?branch=master)](https://travis-ci.org/litixsoft/karma-mocha-reporter)
[![david-dm](https://david-dm.org/litixsoft/karma-mocha-reporter.svg?theme=shields.io)](https://david-dm.org/litixsoft/karma-mocha-reporter/)
[![david-dm](https://david-dm.org/litixsoft/karma-mocha-reporter/dev-status.svg?theme=shields.io)](https://david-dm.org/litixsoft/karma-mocha-reporter#info=devDependencies&view=table)

## How does it look like
![screenshot](demo/screen.png)

## Installation
The easiest way is to keep `karma-mocha-reporter` as a devDependency in your `package.json`.
```json
{
  "devDependencies": {
    "karma": "^0.13",
    "karma-mocha-reporter": "^2.0.0"
  }
}
```

You can simple do it by:

    $ npm install karma-mocha-reporter --save-dev

## Configuration
```js
// karma.conf.js
module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],

    // reporters configuration
    reporters: ['mocha'],

    plugins: [
      'karma-jasmine',
      'karma-mocha-reporter'
    ]
  });
};
```

## Options
### colors
**Type:** Object | Boolean

Let's you overwrite the default colors. Possible values are all colors and background colors from [chalk](https://github.com/chalk/chalk#colors).

**Possible Values:**

Value | Description | Default
------ | ----------- | -------
`success` | success messages | green
`info` | info messages | grey
`warning` | warn messages | yellow
`error` | error messages | red
`false` | disable colors |

```js
// karma.conf.js
module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],

    // reporters configuration
    reporters: ['mocha'],

    // reporter options
    mochaReporter: {
      colors: {
        success: 'blue',
        info: 'bgGreen',
        warning: 'cyan',
        error: 'bgRed'
      }
    },

    plugins: [
      'karma-jasmine',
      'karma-mocha-reporter'
    ]
  });
};
```

### output
**Type:** String

**Possible Values:**

Value | Description
------ | -----------
`full` (default) | all output is printed to the console
`autowatch` | first run will have the full output and the next runs just output the summary and errors in mocha style
`minimal` | only the summary and errors are printed to the console in mocha style
`noFailures` | the failure details are not logged

```js
// karma.conf.js
module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],

    // reporters configuration
    reporters: ['mocha'],

    // reporter options
    mochaReporter: {
      output: 'autowatch'
    },

    plugins: [
      'karma-jasmine',
      'karma-mocha-reporter'
    ]
  });
};
```

### showDiff
**Type:** String | Boolean

Shows a diff output. Is disabled by default. All credits to the contributors of [mocha](https://github.com/mochajs/mocha), since the diff logic is used from there and customized for this module.

![screenshot](demo/diff.png)

Currently only works with karma-mocha >= v0.2.2 Not supported for karma-jasmine since the additional properties needed to render the diff are not supported in jasmine yet.

**Possible Values:**

Value | Description
------ | -----------
`true` | prints each diff in its own line, same as `'unified'`
`'unified'` | prints each diff in its own line
`'inline'` | prints diffs inline

```js
// karma.conf.js
module.exports = function(config) {
  config.set({
    frameworks: ['mocha', 'chai'],

    // reporters configuration
    reporters: ['mocha'],

    // reporter options
    mochaReporter: {
      showDiff: true
    },

    plugins: [
      'karma-chai',
      'karma-mocha',
      'karma-mocha-reporter'
    ]
  });
};
```

### divider
**Type:** String

**Default:** 80 equals signs ('=')

The string to output between multiple test runs. Set to `false` or empty string to disable

```js
// karma.conf.js
module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],

    // reporters configuration
    reporters: ['mocha'],

    // reporter options
    mochaReporter: {
      divider: ''
    },

    plugins: [
      'karma-jasmine',
      'karma-mocha-reporter'
    ]
  });
};
```

### ignoreSkipped
**Type:** Boolean

**Possible Values:**
  * `false` (default)
  * `true`

When setting the ignoreSkipped flag to true, the reporter will ignore the skipped tests in the output and you will see
only the tests that where really executed. The summary will still contain the number of skipped tests.


## Contributing
In lieu of a formal styleguide take care to maintain the existing coding style. Lint and test your code using [grunt](http://gruntjs.com/).

You can preview your changes by running:

    $ npm run demo

## Author
[Litixsoft GmbH](http://www.litixsoft.de)

## License
Copyright (C) 2013-2016 Litixsoft GmbH <info@litixsoft.de>
Licensed under the MIT license.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included i
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
