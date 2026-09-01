#!/usr/bin/env node
// npm publish前に dist/ の内容を検証するスクリプト。
// - 必須ファイルの存在確認
// - テストファイルが混入していないか確認
// - package.jsonのmainから辿れる相対importがすべて解決できるか確認
'use strict'

const path = require('path')
const fs = require('fs')

const distDir = path.resolve(__dirname, '..', 'dist')
let hasError = false

function fail(message) {
  hasError = true
  console.error(`::error::${message}`)
}

console.log('## dist/ の必須ファイルを確認')
const requiredFiles = [
  'package.json',
  'src/core/index.js',
  'src/core/domElementHandler.js',
  'src/core/nodeToDomConverter.js',
  'src/core/drawer.js',
  'src/core/scenarioManager.js',
  'parser/cli.js',
  'parser/checker.js',
]
for (const relPath of requiredFiles) {
  const filePath = path.join(distDir, relPath)
  if (!fs.existsSync(filePath)) {
    fail(`必須ファイルが見つかりません: dist/${relPath}`)
  }
}

console.log('## テストファイルが混入していないか確認')
function findTestFiles(dir) {
  const found = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      found.push(...findTestFiles(entryPath))
    } else if (/\.test\.[jt]s$/i.test(entry.name)) {
      found.push(entryPath)
    }
  }
  return found
}
const testFiles = fs.existsSync(distDir) ? findTestFiles(distDir) : []
if (testFiles.length > 0) {
  fail(`distにテストファイルが混入しています: ${testFiles.join(', ')}`)
}

console.log('## main のimportチェーンがすべて解決できるか確認')
const pkgPath = path.join(distDir, 'package.json')
if (fs.existsSync(pkgPath)) {
  const pkg = require(pkgPath)
  const mainFile = path.resolve(distDir, pkg.main)
  if (!fs.existsSync(mainFile)) {
    fail(`mainファイルが見つかりません: ${mainFile}`)
  } else {
    const src = fs.readFileSync(mainFile, 'utf8')
    const importLines = src.match(/^import .*/gm) || []
    for (const line of importLines) {
      const m = line.match(/from\s+['"](\..*?)['"]/)
      if (!m) continue
      const resolved = path.resolve(path.dirname(mainFile), m[1])
      const candidates = [resolved, `${resolved}.js`, path.join(resolved, 'index.js')]
      const found = candidates.some((candidate) => fs.existsSync(candidate))
      if (!found) {
        fail(`importが解決できません: "${m[1]}" (from ${path.relative(distDir, mainFile)})`)
      }
    }
  }
}

if (hasError) {
  console.error('dist/ の検証に失敗しました。')
  process.exit(1)
}
console.log('dist/ の検証に成功しました。')
