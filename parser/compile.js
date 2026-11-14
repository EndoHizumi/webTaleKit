// .scene を .js / .ts に変換する処理（wtc と開発サーバーの監視で共通に使う）
const { HTMLToJSON } = require('html-to-json-parser')
const { minify } = require('html-minifier')
const parse = require('./parser.js')
const fs = require('fs')
const path = require('path')

const minifyOptions = {
  removeTagWhitespace: true,
  collapseWhitespace: true,
  removeComments: true,
  minifyJS: true,
  minifyCSS: true,
}

/**
 * Node.js 向け HTMLParserAdapter（minify + HTMLToJSON）
 * @param {string} data
 * @returns {Promise<object>}
 */
const nodeHtmlParser = async (data) => {
  const html = minify(data, minifyOptions)
  return HTMLToJSON(html)
}

/**
 * .scene を 1 つ変換して書き出す。構文エラーがあるときは書き出さない。
 * @param {string} targetScript - .scene のパス
 * @param {string} outputDir - 書き出し先のフォルダ（空なら今のフォルダ）
 * @returns {Promise<{output: string|null, errors: string[], warnings: string[]}>}
 */
const compileScene = async (targetScript, outputDir = '') => {
  // ファイル名を取得する。（拡張子を除く）
  const fileName = path.basename(targetScript).split('.')[0]
  const data = await fs.promises.readFile(targetScript, 'utf8')
  // パーサーを呼び出す。
  const { scenario, script, lang, errors } = await parse(data, nodeHtmlParser)
  // 構文エラーと属性警告を分ける
  const syntaxErrors = (errors || []).filter((e) => e.type !== 'unknown_attribute')
  const attrWarnings = (errors || []).filter((e) => e.type === 'unknown_attribute')
  const warnings = attrWarnings.map((w) => `Attribute Warning in ${targetScript}: ${w.message}`)
  if (syntaxErrors.length > 0) {
    return { output: null, errors: syntaxErrors.map((e) => `Syntax Error in ${targetScript}: ${e.message}`), warnings }
  }
  // 出力先のフォルダがない場合、作成する
  if (outputDir && !fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  // JSファイルを出力する(lang=tsの場合は、tsファイルを出力する)
  const output = path.join(outputDir, `${fileName}.${lang == 'text/typescript' ? 'ts' : 'js'}`)
  await fs.promises.writeFile(output, `${script};\nexport const scenario = ${JSON.stringify(scenario)}; `)
  return { output, errors: [], warnings }
}

/**
 * 結果をコンソールに出す。構文エラーがあれば false を返す
 */
const report = ({ output, errors, warnings }) => {
  warnings.forEach((w) => console.warn(w))
  errors.forEach((e) => console.error(e))
  if (output) console.log(`Output: ${output}`)
  return errors.length === 0
}

const isSceneFile = (file) => path.extname(file) === '.scene'

/**
 * フォルダの .scene を監視し、変わったものを変換し直す（開発サーバー用）。
 * 書き出した .js が変わると、webpack-dev-server がそれを読み直す。
 * 構文エラーのときは書き出さず、前の .js のまま動き続ける。
 * @param {string} sceneDir - .scene のフォルダ
 * @param {string} outputDir - 書き出し先のフォルダ
 * @param {{delay?: number, onCompile?: Function}} options - delay: 保存の連続をまとめる待ち（ミリ秒）、onCompile: 変換のたびに結果を受け取る
 * @returns {{close: Function}} 監視をやめる close
 */
const watchScenes = (sceneDir, outputDir, options = {}) => {
  const { delay = 100, onCompile = report } = options
  const timers = new Map()
  const watcher = fs.watch(sceneDir, (eventType, fileName) => {
    if (!fileName || !isSceneFile(fileName.toString())) return
    const target = path.join(sceneDir, fileName.toString())
    // エディタの保存は 1 回で何度も通知が来るので、少し待ってからまとめて変換する
    clearTimeout(timers.get(target))
    timers.set(
      target,
      setTimeout(async () => {
        timers.delete(target)
        if (!fs.existsSync(target)) return // 消された・名前が変わった
        try {
          onCompile(await compileScene(target, outputDir))
        } catch (err) {
          onCompile({ output: null, errors: [`Error in ${target}: ${err.message}`], warnings: [] })
        }
      }, delay),
    )
  })
  return {
    close: () => {
      timers.forEach((t) => clearTimeout(t))
      timers.clear()
      watcher.close()
    },
  }
}

module.exports = { compileScene, watchScenes, report, isSceneFile, nodeHtmlParser }
