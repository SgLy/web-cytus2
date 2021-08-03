const { merge } = require('webpack-merge');

process.env.NODE_ENV = 'production';

/** @type webpack.Configuration */
const baseConfig = require('./base.config');

/** @type webpack.Configuration */
const prodConfig = {
  mode: 'production',
  output: {
    publicPath: './',
  },
  entry: [],
};

const config = merge(baseConfig, prodConfig);

module.exports = config;
