#!/usr/bin/env node
const parse = require('./parser.js')
const fs = require('fs')
const path = require('path')
/**
 * WebTaleScript Parser CLI
 */

const SCENE_EXTENSION = '.scene'

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
      `${outputPath}${fileName}.${lang == 'text/typescript' ? 'ts' : 'js'}`,
      `${script};\nexport const scenario = ${JSON.stringify(scenario)}; `,
      (err) => {
        if (err) {
          console.error(err)
          return
        }
        console.log(`Output: ${outputPath}${fileName}.${lang == 'text/typescript' ? 'ts' : 'js'}`)
      },
    )
  })
}

const collectSceneFiles = (targetPath) => {
  const stat = fs.statSync(targetPath)

  if (stat.isFile()) {
    return path.extname(targetPath) === SCENE_EXTENSION ? [targetPath] : []
  }

  if (!stat.isDirectory()) {
    return []
  }

  return fs.readdirSync(targetPath).flatMap((entry) => collectSceneFiles(path.join(targetPath, entry)))
}

// コマンドライン引数から、ファイル一覧を取得する
const targetScripts = process.argv.slice(2)[0]
collectSceneFiles(targetScripts).forEach((file) => {
  exec(file)
})
