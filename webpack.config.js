const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/index.js', // エントリーポイントのファイル
  output: {
    filename: 'bundle.js', // 出力ファイル名
    path: path.resolve(__dirname, 'dist'), // 出力ディレクトリ
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
  },
};
