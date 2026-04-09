/* eslint-env browser */

/**
 * DOMノードをParsedNode形式に再帰変換する
 * @param {Node} node
 * @returns {import('./domParserAdapter').ParsedNode | string | null}
 */
const domNodeToJson = (node) => {
  // テキストノード
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent.trim()
    return text.length > 0 ? text : null
  }
  // 要素ノード以外は無視
  if (node.nodeType !== Node.ELEMENT_NODE) return null

  const result = {
    type: node.tagName.toLowerCase(),
  }

  // 属性をオブジェクトとして収集
  if (node.attributes.length > 0) {
    result.attributes = {}
    for (const attr of node.attributes) {
      result.attributes[attr.name] = attr.value
    }
  }

  // 子ノードを再帰処理
  const children = [...node.childNodes].map(domNodeToJson).filter(Boolean)

  if (children.length > 0) {
    result.content = children
  }

  return result
}

/**
 * DOMParser を使った HTMLParserAdapter
 * HTMLToJSON と同じ戻り値形式を返す
 * @param {string} html
 * @returns {Promise<import('./domParserAdapter').ParsedNode>}
 */
export const domParserAdapter = async (html) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  return domNodeToJson(doc.body)
}
