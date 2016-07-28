var merge = require('merge-deep');
var path = require('path');

var common =  {
  devtool: 'source-map',

  cache: false,
  entry: {

  },
  output: {
    path: root('dist'),
    filename: '[name].js',
  },

  resolve: {
    // ensure loader extensions match
    extensions: ['','.ts','.js','.json']
  },

  module: {
    loaders: [
      // Support for .ts files.
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: [  /\.(node|worker)\.ts$/, /node_modules/ ]
      }
    ],
  }

};



module.exports = [
  merge(common, {
    target: 'web',
    entry: {
      'browser': root('./index.js')
    },
    output: {
    },
    resolve: {
      packageAlias: 'web',
    },
    node: {
      crypto: false,
      console: false,
      process: false,
      global: false,
      buffer: false
    }
  }),
  merge(common, {
    target: 'node',
    entry: {
      'node': root('./index.node.js'),
    },
    output: {
      libraryTarget: 'commonjs'
    },
    resolve: {
      packageAlias: 'server',
    }
  })
]

function root(args) {
  args = Array.prototype.slice.call(arguments, 0);
  return path.join.apply(path, [__dirname].concat(args));
}
