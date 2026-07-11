// html-minifierは型定義を同梱していないため、CLIで使う範囲だけ宣言する
declare module 'html-minifier' {
  export interface MinifyOptions {
    removeTagWhitespace?: boolean
    collapseWhitespace?: boolean
    removeComments?: boolean
    minifyJS?: boolean
    minifyCSS?: boolean
    [key: string]: unknown
  }
  export function minify(text: string, options?: MinifyOptions): string
}
