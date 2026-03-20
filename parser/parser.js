const { HTMLToJSON } = require('html-to-json-parser')
const { minify } = require('html-minifier')
const { check } = require('./checker')

module.exports = async (data) => {
  let scenario = []
  let script = []
  let lang = 'js'
  const errors = []

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
  let scenarioCount = 0
  parseJson.content.forEach((element) => {
    if (element.type === 'scenario') {
      scenarioCount++
      if (scenarioCount > 1) {
        errors.push({
          type: 'duplicate_scenario',
          message: 'Multiple <scenario> sections found. Only one <scenario> is allowed per scene file.',
        })
      }
      scenario = flattenAttributes(element.content)
    } else {
      script = element.content
      lang = element.attributes?.type
    }
  })

  // Run syntax checker on the parsed scenario
  const checkerErrors = check(scenario)
  errors.push(...checkerErrors)

  return { scenario, script, lang, errors }
}
