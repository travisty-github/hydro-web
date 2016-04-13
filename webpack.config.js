var webpack = require('webpack');
const path = require('path');

const PATHS = {
  app: path.join(__dirname, 'public/src/js/index.js'),
  build: path.join(__dirname, 'public/dist/js')
};

module.exports = {
  entry: {
    app: PATHS.app,
  },
  output: {
    path: PATHS.build,
    filename: 'bundle.js'
  },
  devtool: 'eval-source-map',
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: true,
      mangle: true
    })
  ]
};
