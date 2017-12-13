const path = require('path');
// const CopyWebpackPlugin = require('copy-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

var webpack = require("webpack");


module.exports = {
  entry: './app/js/custom.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './app/index.html',
    }),
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
      'window.jQuery': 'jquery',
      Popper: ['popper.js', 'default'],
    }),
    new ExtractTextPlugin('css/[name].css') 
   ],
  module: {
    rules: [
      // {
      //  test: /\.css$/,
      //  loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader' })
      // },
      { test: /\.scss$/, use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader'] },
      {
        test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: 'url-loader?limit=10000',
      },
      {
        test: /\.(ttf|eot|png|jp(e*)g|svg)(\?[\s\S]+)?$/,
        loader: "url-loader?limit=5000&name=img/img-[hash:6].[ext]"
      },
      // { test: /\.png$/, use: [ "url-loader?mimetype=image/png" ] },
    ],
    loaders: [
      { test: /\.json$/, use: 'json-loader' },
      { test: /\.css$/, loader: "style-loader!css-loader" },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015'],
          plugins: ['transform-runtime']
        }
      },
      { test: /\.(html)$/, use:  'html-loader' },
    ]
  }
}
