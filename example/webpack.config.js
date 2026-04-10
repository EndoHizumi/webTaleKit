const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
const FileManagerPlugin = require('filemanager-webpack-plugin')

module.exports = {
  mode: 'development',
  entry: {
    main: './src/index.js',
    runtimePlayer: './src/runtime-player.js',
  },
  devtool: 'source-map',
  output: {
    publicPath: '/',
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    chunkFilename: 'src/js/[name].bundle.js',
  },
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
      console: require.resolve('console-browserify'),
      util: false,
      assert: false,
    },
    alias: {
      'webtalekit-alpha': path.resolve(__dirname, '..'),
    },
  },
  externals: {
    webtalekit: 'commonjs webtalekit',
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    port: 8080,
    headers: {
      'Feature-Policy': "autoplay 'self'",
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/template.html',
      filename: 'index.html',
      chunks: ['main'],
    }),
    new HtmlWebpackPlugin({
      template: './src/runtime-template.html',
      filename: 'runtime-parser.html',
      chunks: ['runtimePlayer'],
    }),
    new FileManagerPlugin({
      events: {
        onEnd: {
          copy: [
            {
              source: path.resolve(__dirname, './src/resource'),
              destination: path.resolve(__dirname, 'dist/src/resource'),
            },
            {
              source: path.resolve(__dirname, './src/screen'),
              destination: path.resolve(__dirname, 'dist/src/screen'),
            },
            {
              source: path.resolve(__dirname, '../node_modules/typescript/lib/typescript.js'),
              destination: path.resolve(__dirname, 'dist/vendor/typescript.js'),
            },
          ],
        },
      },
    }),
  ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
}
