const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const config = {
  context: __dirname,
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [
    {
      exclude: /node_modules/,
      test: /\.(js|jsx)$/,
      loader: 'babel',
    },
    { test: /\.scss$/,
      loader: ExtractTextPlugin.extract('css!sass') },
    { test: /\.css$/, loader: "style-loader!css-loader" },
    { test: /\.(png|jpg|jpeg)$/,
      loader: "file-loader?name=[name].[ext]" }
    ],
  },
  devtool: 'source-map',
  // devServer: {
  //   historyApiFallback: true,
  //   contentBase: './',
  // },
  plugins: [
    new webpack.DefinePlugin({ 'process.env': { NODE_ENV: JSON.stringify('production') } }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false },
      compress: false,
      output: { comments: false },
      mangle: false,
      sourcemap: true,
      // minimize: true,
      minimize: false,
      // mangle: { except: ['$super', '$', 'exports', 'require', '$q', '$ocLazyLoad'] },
    }),
    new ExtractTextPlugin('src/public/stylesheets/app.css', {
      allChunks: true,
    }),
  ],
};

module.exports = config;
