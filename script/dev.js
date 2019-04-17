/* eslint-disable no-console */

const webpack = require('webpack');
const webpackDevServer = require('webpack-dev-server');

const config = require('./dev.config');

/**
 * @type webpackDevServer.Configuration
 */
const devServerConfig = config.devServer;

webpackDevServer.addDevServerEntrypoints(config, devServerConfig);

const compiler = webpack(config);

compiler.hooks.done.intercept({
  call: stat => {
    console.log('Compile done');
    console.log(
      stat.toString({
        all: false,
        builtAt: true,
        errors: true,
        performance: true,
        timings: true,
        colors: true,
      })
    );
  },
});

compiler.hooks.failed.intercept({
  call: err => {
    console.log('Compile error');
    console.error(err);
  },
});

const server = new webpackDevServer(compiler, devServerConfig);
const { port, host } = devServerConfig;
server.listen(port, host, () => {
  console.log(`Starting server on http://${host}:${port}`);
});
