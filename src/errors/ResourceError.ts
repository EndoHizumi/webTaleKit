/**
 * ResourceError
 *
 * リソースファイルの読み込み時に発生するエラーを表すカスタムエラークラス
 */
export class ResourceError extends Error {
  /**
   * @param message エラーメッセージ
   * @param resourcePath リソースのパス
   * @param resourceType リソースのタイプ
   * @param originalError 元のエラー（存在する場合）
   */
  constructor(
    message: string,
    public resourcePath: string,
    public resourceType: 'image' | 'audio' | 'video' | 'template' | 'scenario',
    public originalError?: Error
  ) {
    super(message);
    this.name = 'ResourceError';

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ResourceError);
    }
  }

  /**
   * エラー情報を文字列として取得
   * @returns フォーマットされたエラー文字列
   */
  toString(): string {
    return `[ResourceError] Failed to load ${this.resourceType}: ${this.resourcePath}\n${this.message}`;
  }

  /**
   * ユーザーフレンドリーなエラーメッセージを取得
   * @returns ユーザー向けのエラーメッセージ
   */
  getUserFriendlyMessage(): string {
    const typeNames = {
      image: '画像',
      audio: '音声',
      video: '動画',
      template: 'テンプレート',
      scenario: 'シナリオ'
    };

    return `${typeNames[this.resourceType]}の読み込みに失敗しました\nパス: ${this.resourcePath}\n詳細: ${this.message}`;
  }

  /**
   * リソースが見つからないエラーを作成
   * @param resourcePath リソースのパス
   * @param resourceType リソースのタイプ
   * @returns ResourceErrorインスタンス
   */
  static notFound(
    resourcePath: string,
    resourceType: 'image' | 'audio' | 'video' | 'template' | 'scenario'
  ): ResourceError {
    return new ResourceError(
      'Resource not found',
      resourcePath,
      resourceType
    );
  }

  /**
   * リソースの読み込みに失敗したエラーを作成
   * @param resourcePath リソースのパス
   * @param resourceType リソースのタイプ
   * @param originalError 元のエラー
   * @returns ResourceErrorインスタンス
   */
  static loadFailed(
    resourcePath: string,
    resourceType: 'image' | 'audio' | 'video' | 'template' | 'scenario',
    originalError?: Error
  ): ResourceError {
    return new ResourceError(
      'Failed to load resource',
      resourcePath,
      resourceType,
      originalError
    );
  }
}
