var path = require('path');

module.exports = {
  entry: './entry.jsx',
  output: {
    filename: './bundle.js',
  },
  module: {
    loaders: [
      {
        test: [/\.jsx?$/],
        exclude: /(node_modules)/,
        loader: 'babel-loader',
        options: {
          presets: ['es2015', 'react'],
          plugins: [require('babel-plugin-transform-class-properties')]
        }
      }
    ]
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.js', '.jsx', '*']
  }
};