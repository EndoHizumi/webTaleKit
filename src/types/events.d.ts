/**
 * WebTaleKit Event Type Definitions
 *
 * エンジンが発行するイベントの型定義
 */

/**
 * イベントペイロードの型定義
 */
export interface EventPayloads {
  // シナリオ関連イベント
  'scenario:next': { index: number };
  'scenario:jump': { target: string };
  'scenario:end': {};

  // テキスト表示関連イベント
  'text:display:start': { content: string };
  'text:display:progress': { current: number; total: number };
  'text:display:end': { content: string };
  'text:clear': {};

  // 選択肢関連イベント
  'choice:show': { choices: Array<{ label: string; id: number }> };
  'choice:selected': { choice: { label: string; id: number } };

  // リソース関連イベント
  'resource:loading:start': { path: string; type: string };
  'resource:loading:progress': { loaded: number; total: number };
  'resource:loading:complete': { path: string; type: string };
  'resource:loading:error': { path: string; type: string; error: Error };

  // シーン関連イベント
  'scene:loaded': { sceneName: string };
  'scene:unloaded': { sceneName: string };
  'scene:changed': { from: string; to: string };

  // セーブ/ロード関連イベント
  'save:start': { slot: string };
  'save:completed': { slot: string; name: string };
  'save:error': { slot: string; error: Error };
  'load:start': { slot: string };
  'load:completed': { slot: string };
  'load:error': { slot: string; error: Error };

  // 画像関連イベント
  'image:show': { key: string; src: string };
  'image:hide': { key: string };
  'image:move': { key: string; from: { x: number; y: number }; to: { x: number; y: number } };

  // 音声関連イベント
  'sound:play': { mode: string; src: string };
  'sound:stop': { mode: string; src: string };
  'sound:pause': { mode: string; src: string };
  'sound:resume': { mode: string; src: string };

  // システム関連イベント
  'system:ready': {};
  'system:error': { error: Error };
  'system:pause': {};
  'system:resume': {};
}

/**
 * イベント名の型
 */
export type TaleKitEventName = keyof EventPayloads;

/**
 * イベントハンドラーの型
 */
export type TaleKitEventHandler<T extends TaleKitEventName> = (
  payload: EventPayloads[T]
) => void;
