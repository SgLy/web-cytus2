const merge = require('webpack-merge');

process.env.NODE_ENV = 'production';

/**
 * @type webpack.Configuration
 */
const baseConfig = require('./base.config');

/**
 * @type webpack.Configuration
 */
const prodConfig = {
  mode: 'production',
  entry: [],
};

const config = merge(baseConfig, prodConfig);

module.exports = config;
