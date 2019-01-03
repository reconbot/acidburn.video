'use strict'

const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: 'production',
  devtool: 'source-map',
  entry: [
    './lib/index.js'
  ],
  plugins: [
    new HtmlWebpackPlugin({
      title: 'IPFS Videostream example',
      template: './lib/index.html'
    })
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'client.js'
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 4000
  }
}
