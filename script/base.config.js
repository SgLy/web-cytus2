const path = require('path');
// eslint-disable-next-line no-unused-vars
const webpack = require('webpack');

const HtmlPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const root = path.join(__dirname, '..');

/**
 * @type webpack.Configuration
 */
const baseConfig = {
  entry: [
    path.join(root, 'src/index.js')
  ],
  output: {
    filename: 'index.[hash].js',
    publicPath: '/',
    path: path.join(root, 'build')
  },
  optimization: {
    runtimeChunk: false,
    splitChunks: {
      chunks: 'all',
    }
  },
  module: {
    rules: [
      {
        test: /\.(?:css|less)$/,
        use: [
          'css-loader',
          'less-loader'
        ]
      },
      {
        test: /\.(png|jpg|jpeg|gif|eot|ttf|woff|woff2|svg|svgz)(\?.+)?$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 10000
          }
        }]
      },
      {
        test: /\.(mp3|ogg|wav)$/,
        use: [
          {
            loader: 'file-loader',
            options: {},
          },
        ],
      },
    ]
  },
  resolve: {
    extensions: ['.js', '.json'],
    alias: {
      '@': path.join(root, 'src')
    }
  },
  plugins: [
    new HtmlPlugin({ template: path.join(root, 'src/index.html') }),
    new CleanWebpackPlugin({ verbose: false }),
  ]
};

module.exports = baseConfig;
