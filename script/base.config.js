const path = require('path');

const HtmlPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const root = path.join(__dirname, '..');

/**
 * @type import('webpack').Configuration
 */
const baseConfig = {
  entry: [path.join(root, 'src/index.js')],
  output: {
    filename: '[name].[contenthash].js',
    publicPath: '/',
    path: path.join(root, 'build'),
    globalObject: 'this',
  },
  optimization: {
    runtimeChunk: true,
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
  module: {
    rules: [
      // {
      //   test: /\.ts$/,
      //   loader: 'ts-loader',
      //   options: {
      //     transpileOnly: true,
      //     appendTsSuffixTo: [/\.vue$/],
      //   },
      // },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpg|jpeg|gif|eot|ttf|woff|woff2|svg|svgz)(\?.+)?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000,
            },
          },
        ],
      },
      {
        test: /\.(txt)$/,
        use: 'raw-loader',
      },
      {
        test: /\.(mp3|ogg|wav)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              esModule: false,
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.json'],
    alias: {
      '@': path.join(root, 'src'),
    },
  },
  plugins: [
    new HtmlPlugin({
      template: path.join(root, 'script/index.html'),
      inject: 'body',
    }),
    new CleanWebpackPlugin({
      verbose: false,
      watch: true,
    }),
    // new (require('webpack-bundle-analyzer').BundleAnalyzerPlugin)(),
  ],
};

module.exports = baseConfig;
