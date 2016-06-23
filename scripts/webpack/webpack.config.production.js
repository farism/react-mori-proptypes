import webpack from 'webpack'
import baseConfig from './webpack.config.base'

const config = {
  ...baseConfig,

  devtool: 'source-map',

  entry: './src/MoriPropTypes',

  output: {
    ...baseConfig.output,

    library: 'MoriPropTypes',
    libraryTarget: 'umd',
  },

  module: {
    ...baseConfig.module,

    loaders: [
      ...baseConfig.module.loaders,
    ],
  },

  plugins: [
    ...baseConfig.plugins,
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    }),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        screw_ie8: true,
        warnings: false,
      },
    }),
  ],
}

export default config
