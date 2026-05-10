/* eslint-env browser */

const minifyOptions = {
  removeTagWhitespace: true,
  collapseWhitespace: true,
  removeComments: true,
  minifyJS: true,
  minifyCSS: true,
}

/**
 * DOMノードをParsedNode形式に再帰変換する
 * @param {Node} node
 * @returns {import('./domParserAdapter').ParsedNode | string | null}
 */
const domNodeToJson = (node) => {
  // テキストノード
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent || ''
    return text.trim().length > 0 ? text : null
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

const removeCommentNodes = (node) => {
  Array.from(node.childNodes).forEach((childNode) => {
    if (childNode.nodeType === Node.COMMENT_NODE) {
      childNode.remove()
      return
    }
    removeCommentNodes(childNode)
  })
}

const normalizeScriptNodes = (node) => {
  Array.from(node.childNodes).forEach((childNode) => {
    if (childNode.nodeType === Node.ELEMENT_NODE && childNode.tagName.toLowerCase() === 'script') {
      childNode.textContent = (childNode.textContent || '').trim()
      return
    }
    normalizeScriptNodes(childNode)
  })
}

const normalizeHtmlInBrowser = (html) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  removeCommentNodes(doc)
  normalizeScriptNodes(doc)

  if (doc.body) {
    return doc.body.innerHTML.trim()
  }

  return doc.documentElement ? doc.documentElement.outerHTML : html.trim()
}

const normalizeHtml = async (html) => {
  if (typeof window === 'undefined') {
    if (globalThis.__WEBTALEKIT_HTML_MINIFY__) {
      return globalThis.__WEBTALEKIT_HTML_MINIFY__(html, minifyOptions)
    }

    return html.trim()
  }

  return normalizeHtmlInBrowser(html)
}

const getRootNode = (doc) => {
  if (doc.body) {
    const rootNode = Array.from(doc.body.childNodes).find((node) => node.nodeType === Node.ELEMENT_NODE)
    if (rootNode) {
      return rootNode
    }
  }

  return doc.documentElement
}

/**
 * DOMParser を使った HTMLParserAdapter
 * HTMLToJSON と同じ戻り値形式を返す
 * @param {string} html
 * @returns {Promise<import('./domParserAdapter').ParsedNode>}
 */
export const domParserAdapter = async (html) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(await normalizeHtml(html), 'text/html')
  return domNodeToJson(getRootNode(doc))
}
