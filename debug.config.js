const path = require('path');
const HWP = require('html-webpack-plugin');
const MCEP = require('mini-css-extract-plugin');

module.exports = {
  entry: path.join(__dirname, '/src/client/debug.jsx'),
  output: {
    filename: 'debug.js',
    path: path.join(__dirname, '/dist/')
  },
  module: {
    rules:[
      {
        test: /\.jsx$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource'
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          MCEP.loader,
          'css-loader',
          'sass-loader'
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  plugins: [
    new HWP({
       template: path.join(__dirname, '/src/client/debug.html'),
       filename: 'debug.html'
    }),
    new MCEP({
      filename: 'debug.css'
    })
  ]
};
