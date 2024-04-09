module.exports = {
    mode: 'development',
    entry: './src/index.js', // エントリーポイントのファイル
    output: {
        filename: 'bundle.js', // 出力ファイル名
        path: path.resolve(__dirname, 'dist'), // 出力ディレクトリ
    },
    module: {
        rules: [
            {
                test: /\.scene$/,
                use: [
                    {
                        loader: path.resolve(
                            __dirname,
                            './src/loader/wtsLoader.js'
                        ),
                        options: {
                            // ローダーに渡すオプションがあれば指定する
                        },
                        exclude: /node_modules/
                    },
                ],
            },
        ],
    },
};