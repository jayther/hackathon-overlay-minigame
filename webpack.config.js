const path = require('path');
const HWP = require('html-webpack-plugin');

module.exports = [
  {
    entry: path.join(__dirname, '/src/client/index.jsx'),
    output: {
      filename: 'control.js',
      path: path.join(__dirname, '/dist/')
    },
    module: {
      rules:[
        {
          test: /\.jsx$/,
          exclude: /node_modules/,
          loader: 'babel-loader'
        }
      ]
    },
    resolve: {
      extensions: ['.js', '.jsx']
    },
    plugins: [
      new HWP({
        template: path.join(__dirname, '/src/client/index.html'),
        filename: 'index.html'
      })
    ]
  },
  {
    entry: path.join(__dirname, '/src/client/widget.jsx'),
    output: {
      filename: 'widget.js',
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
        }
      ]
    },
    resolve: {
      extensions: ['.js', '.jsx']
    },
    plugins: [
      new HWP({
         template: path.join(__dirname, '/src/client/widget.html'),
         filename: 'widget.html'
      })
    ]
  }
];
