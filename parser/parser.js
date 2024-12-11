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
      rest.content = rest.content.map(flattenAttributes).filter((content) => content.type !== 'br')
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
  const parseJson = await HTMLToJSON(html)
  parseJson.content.forEach((element) => {
    if (element.type === 'scenario') {
      scenario = flattenAttributes(element.content)
    } else {
      console.log(element)
      script = element.content
      lang = element.attributes.type
    }
  })
  return { scenario, script, lang }
}
