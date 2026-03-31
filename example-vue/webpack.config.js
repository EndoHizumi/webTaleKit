const HtmlWebpackPlugin = require('html-webpack-plugin')
const FileManagerPlugin = require('filemanager-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')
const webpack = require('webpack')
const path = require('path')

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  devtool: 'source-map',
  output: {
    publicPath: '/',
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    chunkFilename: 'src/js/[name].bundle.js',
  },
  resolve: {
    extensions: ['.ts', '.js', '.vue'],
    fallback: {
      console: require.resolve('console-browserify'),
      util: false,
      assert: false,
    },
    alias: {
      'webtalekit-alpha': path.resolve(__dirname, '..'),
      vue: 'vue/dist/vue.esm-bundler.js',
    },
  },
  devServer: {
    static: { directory: path.join(__dirname, 'dist') },
    port: 8080,
    headers: {
      'Feature-Policy': "autoplay 'self'",
      'Access-Control-Allow-Origin': '*',
    },
  },
  plugins: [
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({
      __VUE_OPTIONS_API__: JSON.stringify(true),
      __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false),
    }),
    new HtmlWebpackPlugin({
      template: './src/template.html',
      filename: 'index.html',
    }),
    new FileManagerPlugin({
      events: {
        onEnd: {
          copy: [
            {
              // 既存 example のリソースを共有して使用
              source: path.resolve(__dirname, '../example/src/resource'),
              destination: path.resolve(__dirname, 'dist/src/resource'),
            },
            {
              source: path.resolve(__dirname, './src/screen'),
              destination: path.resolve(__dirname, 'dist/src/screen'),
            },
          ],
        },
      },
    }),
  ],
  module: {
    rules: [
      { test: /\.vue$/, use: 'vue-loader' },
      { test: /\.ts$/, use: 'ts-loader', exclude: /node_modules/ },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
    ],
  },
}
