const parse = require('./parser.js')
const fs = require('fs')
const path = require('path')
/**
 * WebTaleScript Parser CLI
 */
// ファイル名を取得する。（拡張子を除く）
const targetScript = process.argv.slice(2)[0]
const fileName = path.basename(targetScript).split('.')[0]
const outputPath = process.argv.slice(2)[1] || ''
// 末尾にスラッシュがない場合、追加する
if (outputPath.length > 0) {
  if (outputPath.slice(-1) !== '/') {
    outputPath += '/'
  }
}

// sceneファイルを読み込んで、JSファイルに変換する
fs.readFile(targetScript, 'utf8', async (err, data) => {
  if (err) {
    console.error(err)
    return
  }
  console.log(data)
  // パーサーを呼び出す。
  const { scenario, logic } = await parse(data)
  fs.writeFile(
    `${outputPath}${fileName}.js`,
    `${logic};\nexport const scenario = ${JSON.stringify(scenario)}; `,
    (err) => {
      if (err) {
        console.error(err)
        return
      }
      console.log(`${outputPath}${fileName}.js`)
    },
  )
})
