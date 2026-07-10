/**
 * DOM要素の追加・削除を管理するクラス
 */
export class DomElementHandler {
  /** 管理対象の要素を格納するマップ */
  private extraElements: Record<string, HTMLElement> = {};
  /** 自動採番用のカウンタ */
  private autoIdCounter: number = 0;
  /** ゲーム画面のコンテナ */
  private gameContainer: HTMLElement;

  /**
   * @param gameContainer ゲーム画面のコンテナ要素
   */
  constructor(gameContainer: HTMLElement) {
    this.gameContainer = gameContainer;
  }

  /**
   * 要素を追加する
   * @param line 追加する要素の情報
   * @param line.target 要素名 (必須)
   * @param line.name 管理名兼id属性 (任意)
   * @param line.class className (任意)
   * @param line.content innerHTML (任意)
   */
  addElement(line: { target: string; name?: string; class?: string; content?: string }): void {
    const element = document.createElement(line.target);

    // 名前が指定されていない場合は自動採番
    const name = line.name || `wt-auto-id-${this.autoIdCounter++}`;
    element.id = name;

    if (line.class) {
      element.className = line.class;
    }

    if (line.content) {
      element.innerHTML = line.content;
    }

    this.gameContainer.appendChild(element);
    this.extraElements[name] = element;
  }

  /**
   * 要素を削除する
   * @param line 削除する要素の情報
   * @param line.name 管理名 (必須)
   */
  removeElement(line: { name: string }): void {
    const name = line.name;
    const element = this.extraElements[name];

    if (element) {
      element.remove();
      delete this.extraElements[name];
    } else {
      console.warn(`Element with name "${name}" not found.`);
    }
  }
}
