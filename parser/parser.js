const { HTMLToJSON } = require('html-to-json-parser')
const { minify } = require('html-minifier')

module.exports = async (data) => {
  let scenario = []
  let script = []
  let lang = 'js'

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
    if (rest.content) {
      rest.content = rest.content.map(flattenAttributes)
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
  // HTMLをJSONに変換
  const parseJson = await HTMLToJSON(html)
  
  // parseJson.contentが存在するかチェック
  if (!parseJson || !parseJson.content) {
    console.error('Error parsing HTML: parseJson.content is undefined', parseJson)
    return { scenario, script, lang }
  }
  
  parseJson.content.forEach((element) => {
    if (element.type === 'scenario') {
      scenario = flattenAttributes(element.content)
    } else {
      script = element.content
      lang = element.attributes?.type
    }
  })
  return { scenario, script, lang }
}
