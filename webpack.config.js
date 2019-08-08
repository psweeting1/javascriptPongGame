const glob = require('glob')
const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const fs = require('fs')
const yaml = require('js-yaml')

// Workaround for https://github.com/webpack/webpack/issues/7300 whereby
// webpack outputs empty chunks when used with the css extract plugin
// See exact solution at https://github.com/webpack/webpack/issues/7300#issuecomment-413959996
// Without this workaround, the css extract solution leaves behind empty JavaScript files
// Once this ticket has been resolved this workaround can be removed
class MiniCssExtractPluginCleanUp {
  constructor (deleteWhere = /css.*\.js(\.map)?$/) {
    this.shouldDelete = new RegExp(deleteWhere)
  }
  apply (compiler) {
    compiler.hooks.emit.tapAsync('MiniCssExtractPluginCleanup', (compilation, callback) => {
      Object.keys(compilation.assets).forEach((asset) => {
        if (this.shouldDelete.test(asset)) {
          delete compilation.assets[asset]
        }
      })
      callback()
    })
  }
}

// Collect top level js and scss entrypoints
const files = glob.sync(path.join('src/{js,scss}/*.{js,scss}'))
const entrypoints = files.reduce((accumulator, value) => {
  const assetExtension = path.extname(value)
  const extMap = {
    '.scss': 'css',
    '.js': 'js'
  }

  accumulator[path.join(extMap[assetExtension], path.basename(value, assetExtension))] = path.resolve(value)
  return accumulator
}, {})

// Construct the webpack config
const webpackConfig = {
  mode: 'production',
  bail: false,
  devtool: 'source-map',
  output: {
    path: path.resolve('public')
  },
  resolve: {
    modules: [
      'node_modules'
    ]
  },
  resolveLoader: {
    modules: [
      'node_modules'
    ]
  },
  devServer: {
    contentBase: './public',
    hot: true,
    watchContentBase: true
  },
  stats: {
    assets: true,
    colors: true,
    entrypoints: false,
    hash: false,
    modules: false,
    version: false
  },
  entry: entrypoints,
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules\/(?!(govuk-react-components|hmlr-design-system)\/).*/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name (file) {
                const componentName = path.dirname(file).split(path.sep).pop()
                return `images/hmlr-design-system/${componentName}/[name].[ext]`
              }
            }
          }
        ]
      },
      {
        test: /\.scss$/,
        resolve: {
          extensions: ['.scss']
        },
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader?-url'
          },
          {
            loader: 'postcss-loader'
          },
          {
            loader: 'sass-loader'
          }
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new MiniCssExtractPluginCleanUp()
  ]
}

// If we're running inside the docker container, node_modules is placed
// at a different location defined by the NODE_PATH environment variable
// so we need to tell webpack to check there too
if ('NODE_PATH' in process.env) {
  webpackConfig.resolve.modules.push(process.env.NODE_PATH)
  webpackConfig.resolveLoader.modules.push(process.env.NODE_PATH)
}

module.exports = webpackConfig
