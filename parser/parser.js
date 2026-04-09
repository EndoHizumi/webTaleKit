const { check } = require('./checker')

/**
 * WebTaleScript パーサー（環境非依存）
 * @param {string} data - WTSファイルの文字列
 * @param {Function} htmlParser - HTMLをParsedNode形式に変換する関数
 * @returns {Promise<{scenario: Array, script: Array, lang: string, errors: Array}>}
 */
module.exports = async (data, htmlParser) => {
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

  // 外から注入されたパーサーを使用
  const parseJson = await htmlParser(data)
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

  // パース済みシナリオに対して構文チェッカーを実行する
  const checkerErrors = check(scenario)
  errors.push(...checkerErrors)

  return { scenario, script, lang, errors }
}
