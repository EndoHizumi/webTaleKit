const { HTMLToJSON } = require('html-to-json-parser')
const { minify } = require('html-minifier')

/**
 * WebTaleScript Parser
 * sceneファイルを読み込み、同名のJSに変換する
 */
const targetScript = process.argv.slice(2)[0]
const outputPath = process.argv.slice(2)[1] || ''
// 末尾にスラッシュがない場合、追加する
if (outputPath.length > 0) {
  if (outputPath.slice(-1) !== '/') {
    outputPath += '/'
  }
}
const fs = require('fs')
// ファイル名を取得する。（拡張子を除く）
const fileName = targetScript.split('.')[0]
// sceneファイルを読み込んで、JSファイルに変換する
fs.readFile(targetScript, 'utf8', async (err, data) => {
  if (err) {
    console.error(err)
    return
  }
  const html = minify(data, {
    removeTagWhitespace: true,
    collapseWhitespace: true,
    removeComments: true,
    minifyJS: true,
    minifyCSS: true,
  })
  const parseObject = await HTMLToJSON(html)
  //typeが'scene'の場合、type='secnario'を取り出す。
  let scenario = []
  let logic = []
  // HTMLとして解析され、変換されたオブジェクトを、WTS仕様に変換する
  parseObject.content.forEach((element) => {
    if (element.type === 'scenario') {
      scenario = flattenAttributes(element.content)
    } else {
      logic = element.content
    }
  })

  fs.writeFile(
    `${outputPath}${fileName}.js`,
    `${logic};\nexport const scenario = ${JSON.stringify(scenario, null, 2)}; `,
    (err) => {
      if (err) {
        console.error(err)
        return
      }
      console.log(`${outputPath}${fileName}.js`)
    },
  )
})

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
    rest.content = rest.content
      .map(flattenAttributes)
      .filter((content) => content.type !== 'br')
  }
  return rest
}
