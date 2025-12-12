/**
 * ParseError
 *
 * シナリオファイルのパース時に発生するエラーを表すカスタムエラークラス
 */
export class ParseError extends Error {
  /**
   * @param message エラーメッセージ
   * @param line エラーが発生した行番号
   * @param column エラーが発生した列番号
   * @param tag エラーが発生したタグ名
   * @param originalError 元のエラー（存在する場合）
   */
  constructor(
    message: string,
    public line: number,
    public column: number,
    public tag: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'ParseError';

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ParseError);
    }
  }

  /**
   * エラー情報を文字列として取得
   * @returns フォーマットされたエラー文字列
   */
  toString(): string {
    return `[ParseError] Line ${this.line}, Column ${this.column}: ${this.message} (Tag: <${this.tag}>)`;
  }

  /**
   * ユーザーフレンドリーなエラーメッセージを取得
   * @returns ユーザー向けのエラーメッセージ
   */
  getUserFriendlyMessage(): string {
    return `シナリオの記述にエラーがあります (${this.line}行目)\nタグ: <${this.tag}>\n詳細: ${this.message}`;
  }
}
