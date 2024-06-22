const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')

module.exports = {
  mode: 'development',
  entry: './src/index.js', // エントリーポイントのファイル
  output: {
    filename: 'bundle.js', // 出力ファイル名
    path: path.resolve(__dirname, 'dist'), // 出力ディレクトリ
    chunkFilename: '[name].bundle.js', // チャンクファイル名
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/template.html', // (オプション) 使用するHTMLテンプレートファイル
      filename: 'index.html', // 出力されるHTMLファイル名
    }),
  ],
  devServer: {
    static: './dist',
    port: 8080,
    headers: {
      'Feature-Policy': "autoplay 'self'",
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  devtool: 'source-map',
}
