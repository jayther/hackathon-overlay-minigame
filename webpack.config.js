const path = require('path');
const HWP = require('html-webpack-plugin');
const MCEP = require('mini-css-extract-plugin');

module.exports = [
  {
    entry: path.join(__dirname, '/src/client/index.jsx'),
    output: {
      filename: 'control.js',
      path: path.join(__dirname, '/dist/'),
      assetModuleFilename: 'assets/[hash][ext][query]'
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
          test: /\/s[ac]ss$/i,
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
        template: path.join(__dirname, '/src/client/index.html'),
        filename: 'index.html'
      }),
      new MCEP({
        filename: 'control.css'
      })
    ]
  },
  {
    entry: path.join(__dirname, '/src/client/widget.jsx'),
    output: {
      filename: 'widget.js',
      path: path.join(__dirname, '/dist/'),
      assetModuleFilename: 'assets/[hash][ext][query]'
    },
    module: {
      rules:[
        {
          test: /\.jsx$/,
          exclude: /node_modules/,
          loader: 'babel-loader'
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif|m4a)$/i,
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
         template: path.join(__dirname, '/src/client/widget.html'),
         filename: 'widget.html'
      }),
      new MCEP({
        filename: 'widget.css'
      })
    ]
  }
];
