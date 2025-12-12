/**
 * EventEmitter
 *
 * イベント駆動アーキテクチャを実現するための基本クラス
 */

type EventHandler = (...args: any[]) => void;

export class EventEmitter {
  private events: Map<string, Set<EventHandler>>;

  constructor() {
    this.events = new Map();
  }

  /**
   * イベントリスナーを登録
   * @param event イベント名
   * @param handler イベントハンドラー
   */
  on(event: string, handler: EventHandler): void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(handler);
  }

  /**
   * 一度だけ実行されるイベントリスナーを登録
   * @param event イベント名
   * @param handler イベントハンドラー
   */
  once(event: string, handler: EventHandler): void {
    const onceHandler: EventHandler = (...args: any[]) => {
      handler(...args);
      this.off(event, onceHandler);
    };
    this.on(event, onceHandler);
  }

  /**
   * イベントリスナーを削除
   * @param event イベント名
   * @param handler イベントハンドラー
   */
  off(event: string, handler: EventHandler): void {
    const handlers = this.events.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.events.delete(event);
      }
    }
  }

  /**
   * 指定したイベントの全リスナーを削除
   * @param event イベント名
   */
  removeAllListeners(event?: string): void {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }

  /**
   * イベントを発火
   * @param event イベント名
   * @param args イベントに渡す引数
   */
  emit(event: string, ...args: any[]): void {
    const handlers = this.events.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(...args);
        } catch (error) {
          console.error(`Error in event handler for '${event}':`, error);
        }
      });
    }
  }

  /**
   * 指定したイベントのリスナー数を取得
   * @param event イベント名
   * @returns リスナーの数
   */
  listenerCount(event: string): number {
    const handlers = this.events.get(event);
    return handlers ? handlers.size : 0;
  }

  /**
   * 指定したイベントのリスナー一覧を取得
   * @param event イベント名
   * @returns リスナーの配列
   */
  listeners(event: string): EventHandler[] {
    const handlers = this.events.get(event);
    return handlers ? Array.from(handlers) : [];
  }

  /**
   * 登録されている全イベント名を取得
   * @returns イベント名の配列
   */
  eventNames(): string[] {
    return Array.from(this.events.keys());
  }
}
