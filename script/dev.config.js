/* eslint-disable no-console */

const webpack = require('webpack');
const merge = require('webpack-merge');

process.env.NODE_ENV = 'development';

/**
 * @type webpack.Configuration
 */
const baseConfig = require('./base.config');

/**
 * @type webpack.Configuration
 */
const devConfig = {
  mode: 'development',
  entry: [],
  devtool: 'inline-source-map',
  plugins: [new webpack.HotModuleReplacementPlugin()],
  devServer: {
    historyApiFallback: {
      index: '/',
      rewrites: [
        { from: /^\/.+?$/, to: '/' },
      ]
    },
    hot: true,
    inline: true,
    quiet: true,
    overlay: true,
    compress: true,
    host: 'localhost',
    port: '8000',
    watchOptions: {
      aggregateTimeout: 300,
      poll: 1000,
    },
    index: 'index.html',
  },
};

const config = merge(baseConfig, devConfig);

module.exports = config;
