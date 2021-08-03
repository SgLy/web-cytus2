/* eslint-disable no-console */

const webpack = require('webpack');
const { merge } = require('webpack-merge');

process.env.NODE_ENV = 'development';

/** @type webpack.Configuration */
const baseConfig = require('./base.config');

const HOST = '0.0.0.0';
const PORT = 5000;

/** @type webpack.Configuration */
const devConfig = {
  mode: 'development',
  entry: [],
  devtool: 'eval-source-map',
  plugins: [new webpack.HotModuleReplacementPlugin()],
  devServer: {
    historyApiFallback: {
      index: '/',
      rewrites: [{ from: /^\/.+?$/, to: '/' }],
    },
    onListening: () => {
      console.log(`Listening on http://${HOST}:${PORT}`);
    },
    hot: true,
    inline: true,
    stats: {
      colors: true,
      hash: false,
      version: false,
      timings: true,
      assets: false,
      chunks: false,
      modules: false,
      reasons: false,
      children: true,
      source: false,
      errors: true,
      errorDetails: true,
      warnings: true,
      publicPath: false,
      entrypoints: false,
    },
    overlay: true,
    compress: false,
    host: HOST,
    port: PORT,
    disableHostCheck: true,
    watchOptions: {
      aggregateTimeout: 300,
      poll: 1000,
    },
    proxy: {
      '/api': 'http://localhost:3000',
    },
    index: 'index.html',
  },
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename],
    },
  },
};

const config = merge(baseConfig, devConfig);

module.exports = config;
