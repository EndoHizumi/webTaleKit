import { KNOWN_ATTRIBUTES } from '../../parser/checker';
import { Drawer } from './drawer';

/**
 * パース済みシナリオのJSONノード配列を、DOM(DocumentFragment)に再帰変換する。
 * 
 * @param nodes - シナリオのノード配列
 * @param onAction - onclickノードが実行されたときに呼ばれるコールバック
 * @returns 変換されたDocumentFragment
 */
export function convertNodesToDom(
  nodes: Array<string | Record<string, any>>,
  onAction: (content: any[]) => void,
  rootElement?: HTMLElement,
): DocumentFragment {
  const fragment = document.createDocumentFragment();

  /**
   * ノードを再帰的に処理する内部関数
   * @param nodesToProcess - 処理対象のノード配列
   * @param parentElement - 現在の親要素 (HTMLElement または DocumentFragment)
   * @param lastElement - 直近で生成されたHTML要素
   */
  function processNodes(
    nodesToProcess: Array<string | Record<string, any>>,
    parentElement: HTMLElement | DocumentFragment,
    lastElement: HTMLElement | null,
  ): void {
    let currentLastElement = lastElement;

    for (const node of nodesToProcess) {
      if (typeof node === 'string') {
        parentElement.appendChild(document.createTextNode(node));
        continue;
      }

      const { type, content, ...attributes } = node;

      // 2. type が color / ruby / b / i のオブジェクト
      if (['color', 'ruby', 'b', 'i'].includes(type)) {
        const decorated = Drawer.createDecoratedElement(node);
        parentElement.appendChild(decorated);
        currentLastElement = decorated;
        continue;
      }

      // 3. type が 'onclick' のオブジェクト
      if (type === 'onclick') {
        if (currentLastElement) {
          currentLastElement.addEventListener('click', () => {
            if (Array.isArray(content)) {
              onAction(content);
            }
          });
        }
        continue;
      }

      // 4. type が KNOWN_ATTRIBUTES に存在するその他のWTSタグ
      // 5. type が KNOWN_ATTRIBUTES にない未知タグ
      // @ts-ignore: KNOWN_ATTRIBUTES is from a JS file
      const isKnownType = type in KNOWN_ATTRIBUTES;

      if (isKnownType) {
        console.warn(`[nodeToDomConverter] <${type}> is a known WTS tag but not supported in <add> tags.`);
        continue;
      }

      // 5. type が KNOWN_ATTRIBUTES にない未知タグ -> HTML要素として処理
      const element = document.createElement(type);

      // type/content 以外の属性を setAttribute で透過。
      // ただし属性名が on で始まるもの(onclick等の生JS属性)は透過せず console.warn を出して無視する
      for (const [key, value] of Object.entries(attributes)) {
        if (key.startsWith('on')) {
          console.warn(`[nodeToDomConverter] Skipping prohibited attribute "${key}" on <${type}>`);
          continue;
        }
        element.setAttribute(key, String(value));
      }

      parentElement.appendChild(element);
      currentLastElement = element;

      // content があれば再帰変換して子として追加
      if (Array.isArray(content)) {
        processNodes(content, element, currentLastElement);
        // 再帰呼び出し後に currentLastElement を親要素に戻す
        currentLastElement = element;
      }
    }
  }

  processNodes(nodes, fragment, rootElement ?? null);
  return fragment;
}
