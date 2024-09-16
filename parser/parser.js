const { HTMLToJSON } = require('html-to-json-parser')
const { minify } = require('html-minifier')

module.exports = async (data) => {
  let scenario = []
  let script = []

  /**
   * 渡されたオブジェクトを展開する
   * @param {Object} jsObject
   */
  const flattenAttributes = (jsObject) => {
    if (Array.isArray(jsObject)) {
      return jsObject.map(flattenAttributes)
    }
    if (typeof jsObject !== 'object' || jsObject === null) {
      return jsObject
    }
    const { attributes, ...rest } = jsObject
    if (attributes) {
      Object.assign(rest, attributes)
    }
    return rest
  }

  /**
   * HTMLとして解析され、変換されたオブジェクトを、WTS仕様に変換する
   * @param {string} html 読み込んだWSTファイル
   */
  /** HTMLを読み込む */
  const html = minify(data, {
    removeTagWhitespace: true,
    collapseWhitespace: true,
    removeComments: true,
    minifyJS: true,
    minifyCSS: true,
  })
  // 改行コードを<br>に変換
  const br = '<br>'
  const brRegExp = new RegExp('\\n', 'g')
  const htmlWithBr = html.replace(brRegExp, br)
  // HTMLをJSONに変換
  const parseJson = await HTMLToJSON(htmlWithBr)
  parseJson.content.forEach((element) => {
    if (element.type === 'scenario') {
      scenario = flattenAttributes(element.content)
    } else {
      script = element.content
    }
  })
  return { scenario, script }
}
