# angular2-template-loader
Chain-to loader for webpack that inlines all html and style's in angular2 components. 

[![Build Status](https://travis-ci.org/TheLarkInn/angular2-template-loader.svg?branch=master)](https://travis-ci.org/TheLarkInn/angular2-template-loader)
[![taylor swift](https://img.shields.io/badge/secured%20by-taylor%20swift-brightgreen.svg)](https://twitter.com/SwiftOnSecurity)


# Requirements: 
* If you use awesome-typescript-loader set `"useWebpackText": true`: _Why?_ Because this allows for webpack to serve up chained files from loaders. Otherwise, there is no way to chain a loader to it. 
* Configure `tsconfig.json`:
```
{
  "compilerOptions": {
    ...
  },
  "awesomeTypescriptLoaderOptions": {
    ...
    "useWebpackText": true //Allows loaders to be chained to awesome-typescript-loader.
  },
}
```
* Make sure your app has a loader which can handle both .css/.html `require()`s. I use `raw-loader`. 

# How to use: 
* Install into node_modules: `npm install --save-dev angular2-template-loader`
* Chain `angular2-template-loader` to your favorite typescript loader (works both with `awesome-typescript-loader` and `ts-loader`)

```javascript
  module: {
    loaders: [
      {
        test: /\.ts$/,
        loaders: ['awesome-typescript-loader, angular2-template-loader'],
        exclude: [/\.(spec|e2e)\.ts$/]
      }
    ]
  },
```
