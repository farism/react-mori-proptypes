import path from 'path'

export default {

  module: {
    loaders: [{
      test: /\.jsx?$/,
      loader: 'babel-loader',
      exclude: /node_modules/,
    }],
  },

  output: {
    path: path.join(__dirname, '../../dist'),
    filename: 'MoriPropTypes.js',
  },

  resolve: {
    extensions: ['', '.js', '.jsx'],
    packageMains: ['webpack', 'browser', 'main'],
  },

  plugins: [
  ],

  externals: [
  ],

}
