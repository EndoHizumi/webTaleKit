import fs from 'fs'
import os from 'os'
import path from 'path'

const { compileScene, watchScenes } = require('./compile.js')

const scene = (text: string) =>
  `<scene><scenario><text>${text}</text></scenario><script>export const sceneConfig = { name: 'w' }</script></scene>`

// 条件がそろうまで待つ（fs.watch の通知は少し遅れて来る）
const waitFor = async (check: () => boolean, timeout = 5000) => {
  const start = Date.now()
  while (!check()) {
    if (Date.now() - start > timeout) throw new Error('timeout')
    await new Promise((r) => setTimeout(r, 50))
  }
}

describe('compile（wtc の変換）', () => {
  let dir: string
  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wtc-'))
    fs.mkdirSync(path.join(dir, 'scene'))
  })
  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true })
  })

  test('compileScene は .scene を .js に書き出す', async () => {
    const src = path.join(dir, 'scene', 'title.scene')
    fs.writeFileSync(src, scene('はじめ'))
    const result = await compileScene(src, path.join(dir, 'js'))
    expect(result.errors).toEqual([])
    expect(result.output).toBe(path.join(dir, 'js', 'title.js'))
    const js = fs.readFileSync(result.output, 'utf8')
    expect(js).toContain('export const scenario = ')
    expect(js).toContain('はじめ')
  })

  test('watchScenes は .scene が変わると変換し直し、.scene 以外は無視する', async () => {
    const src = path.join(dir, 'scene', 'title.scene')
    const out = path.join(dir, 'js')
    fs.writeFileSync(src, scene('はじめ'))
    await compileScene(src, out)
    const compiled: string[] = []
    const watcher = watchScenes(path.join(dir, 'scene'), out, {
      delay: 20,
      onCompile: (r: any) => compiled.push(r.output),
    })
    try {
      fs.writeFileSync(path.join(dir, 'scene', 'memo.txt'), 'x')
      fs.writeFileSync(src, scene('かわった'))
      await waitFor(() => fs.readFileSync(path.join(out, 'title.js'), 'utf8').includes('かわった'))
      await new Promise((r) => setTimeout(r, 150))
      expect(compiled.every((o) => o === path.join(out, 'title.js'))).toBe(true)
      expect(fs.existsSync(path.join(out, 'memo.js'))).toBe(false)
    } finally {
      watcher.close()
    }
  })

  test('watchScenes は構文エラーのとき書き出さず、前の .js を残す', async () => {
    const src = path.join(dir, 'scene', 'title.scene')
    const out = path.join(dir, 'js')
    fs.writeFileSync(src, scene('はじめ'))
    await compileScene(src, out)
    const results: any[] = []
    const watcher = watchScenes(path.join(dir, 'scene'), out, { delay: 20, onCompile: (r: any) => results.push(r) })
    try {
      // <item> は <choice> の中にしか置けない
      fs.writeFileSync(src, `<scene><scenario><item label="a"></item></scenario><script>export const a = 1</script></scene>`)
      await waitFor(() => results.length > 0)
      expect(results[0].output).toBeNull()
      expect(results[0].errors.length).toBeGreaterThan(0)
      expect(fs.readFileSync(path.join(out, 'title.js'), 'utf8')).toContain('はじめ')
    } finally {
      watcher.close()
    }
  })
})
