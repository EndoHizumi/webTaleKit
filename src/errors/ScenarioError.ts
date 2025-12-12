/**
 * ScenarioError
 *
 * シナリオ実行時に発生するエラーを表すカスタムエラークラス
 */
export class ScenarioError extends Error {
  /**
   * @param message エラーメッセージ
   * @param scenarioName シナリオ名
   * @param commandType コマンドタイプ（タグ名など）
   * @param context エラーが発生したコンテキスト情報
   * @param originalError 元のエラー（存在する場合）
   */
  constructor(
    message: string,
    public scenarioName: string,
    public commandType?: string,
    public context?: Record<string, any>,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'ScenarioError';

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ScenarioError);
    }
  }

  /**
   * エラー情報を文字列として取得
   * @returns フォーマットされたエラー文字列
   */
  toString(): string {
    const commandInfo = this.commandType ? ` (Command: ${this.commandType})` : '';
    const contextInfo = this.context ? `\nContext: ${JSON.stringify(this.context, null, 2)}` : '';
    return `[ScenarioError] ${this.scenarioName}${commandInfo}: ${this.message}${contextInfo}`;
  }

  /**
   * ユーザーフレンドリーなエラーメッセージを取得
   * @returns ユーザー向けのエラーメッセージ
   */
  getUserFriendlyMessage(): string {
    const commandInfo = this.commandType ? `\nコマンド: ${this.commandType}` : '';
    return `シナリオの実行中にエラーが発生しました\nシナリオ: ${this.scenarioName}${commandInfo}\n詳細: ${this.message}`;
  }

  /**
   * 必須属性が欠けている場合のエラーを作成
   * @param scenarioName シナリオ名
   * @param commandType コマンドタイプ
   * @param attributeName 欠けている属性名
   * @returns ScenarioErrorインスタンス
   */
  static missingAttribute(
    scenarioName: string,
    commandType: string,
    attributeName: string
  ): ScenarioError {
    return new ScenarioError(
      `Required attribute '${attributeName}' is missing`,
      scenarioName,
      commandType
    );
  }

  /**
   * 無効な属性値の場合のエラーを作成
   * @param scenarioName シナリオ名
   * @param commandType コマンドタイプ
   * @param attributeName 属性名
   * @param value 無効な値
   * @returns ScenarioErrorインスタンス
   */
  static invalidAttribute(
    scenarioName: string,
    commandType: string,
    attributeName: string,
    value: any
  ): ScenarioError {
    return new ScenarioError(
      `Invalid value '${value}' for attribute '${attributeName}'`,
      scenarioName,
      commandType,
      { attributeName, value }
    );
  }

  /**
   * コマンド実行失敗のエラーを作成
   * @param scenarioName シナリオ名
   * @param commandType コマンドタイプ
   * @param originalError 元のエラー
   * @returns ScenarioErrorインスタンス
   */
  static executionFailed(
    scenarioName: string,
    commandType: string,
    originalError?: Error
  ): ScenarioError {
    return new ScenarioError(
      'Command execution failed',
      scenarioName,
      commandType,
      undefined,
      originalError
    );
  }
}
