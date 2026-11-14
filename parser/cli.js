#!/usr/bin/env node
/**
 * WebTaleScript パーサー CLI
 * 使い方: wtc <.scene またはフォルダ> [出力先のフォルダ] [--watch]
 *   --watch: 最初に全部を変換した後、フォルダの .scene を監視して、変わったものを変換し直す
 */
const fs = require('fs')
const path = require('path')
const { compileScene, watchScenes, report } = require('./compile.js')

const args = process.argv.slice(2)
const watch = args.includes('--watch')
const [targetScripts, outputPath = ''] = args.filter((a) => a !== '--watch')

const main = async () => {
  const isDir = fs.statSync(targetScripts).isDirectory()
  const files = isDir ? fs.readdirSync(targetScripts).map((file) => path.join(targetScripts, file)) : [targetScripts]
  let ok = true
  for (const file of files) {
    try {
      ok = report(await compileScene(file, outputPath)) && ok
    } catch (err) {
      console.error(err)
    }
  }
  if (!watch) {
    // 構文エラーがある場合は、エラーで終了する
    if (!ok) process.exit(1)
    return
  }
  const sceneDir = isDir ? targetScripts : path.dirname(targetScripts)
  watchScenes(sceneDir, outputPath)
  console.log(`Watching: ${sceneDir}`)
}

main()
