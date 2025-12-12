/**
 * SaveData Type Definitions
 *
 * セーブデータの型定義
 */

/**
 * セーブデータの構造
 */
export interface SaveData {
  /** セーブデータのバージョン (例: "0.2.12") */
  version: string;

  /** エンジンのバージョン (例: "0.2.x") */
  engineVersion: string;

  /** セーブスロット */
  slot: string;

  /** セーブデータの名前 */
  name: string;

  /** 保存日時 (ISO 8601形式) */
  timestamp: string;

  /** シナリオマネージャーの状態 */
  scenarioManager: {
    progress: Record<string, any>;
    sceneName: string;
    currentIndex: number;
    history: string[];
  };

  /** シーン設定 */
  sceneConfig: {
    name: string;
    background: string;
    bgm?: string;
    template: string;
  };

  /** 表示中の画像情報 */
  displayedImages: Record<string, {
    src: string | null;
    pos: { x: number; y: number };
    size: { width: number; height: number };
    look: string;
    entry: string;
  }>;

  /** 背景画像のパス */
  backgroundImage: string | null;

  /** 使用中の音声情報 */
  usedSounds: Record<string, {
    src: string | null;
    loop: boolean;
    play: boolean;
  }>;
}

/**
 * セーブデータのバージョン情報
 */
export interface SaveDataVersion {
  /** セーブデータのバージョン */
  version: string;

  /** エンジンのバージョン */
  engineVersion: string;
}
