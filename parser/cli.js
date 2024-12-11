#!/usr/bin/env node
const parse = require('./parser.js')
const fs = require('fs')
const path = require('path')
/**
 * WebTaleScript Parser CLI
 */

const exec = (targetScript) => {
  // ファイル名を取得する。（拡張子を除く）
  const fileName = path.basename(targetScript).split('.')[0]
  let outputPath = process.argv.slice(2)[1] || ''
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
    // パーサーを呼び出す。
    const { scenario, script, lang } = await parse(data)
    // jsディレクトリがない場合、作成する
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath)
    }
    // JSファイルを出力する(lang=tsの場合は、tsファイルを出力する)
    fs.writeFile(
      `${outputPath}${fileName}.${lang == 'ts' ? 'ts' : 'js'}`,
      `${script};\nexport const scenario = ${JSON.stringify(scenario)}; `,
      (err) => {
        if (err) {
          console.error(err)
          return
        }
        console.log(`Input: ${targetScript}`)
        console.log(`lang: ${lang}`)
        console.log(`Output: ${outputPath}${fileName}.${lang == 'ts' ? 'ts' : 'js'}`)
      },
    )
  })
}

// コマンドライン引数から、ファイル一覧を取得する
const targetScripts = process.argv.slice(2)[0]
if (fs.statSync(targetScripts).isDirectory()) {
  fs.readdir(targetScripts, (err, files) => {
    if (err) {
      console.error(err)
      return
    }
    files.forEach((file) => {
      exec(`${targetScripts}/${file}`)
    })
  })
} else {
  exec(targetScripts)
}
