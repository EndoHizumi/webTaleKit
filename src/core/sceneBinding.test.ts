import { createSceneBinding, pullSceneVariables, pushSceneVariables } from './sceneBinding'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { SCENE_ASSIGN_SOURCE } = require('../../parser/sceneAccessor.js')

/**
 * パーサーが出力するシーンのモジュールを、クロージャーで再現する。
 * `export let hp = 40` と関数、末尾に足される __wtkAssign（本物の SCENE_ASSIGN_SOURCE）を持つ。
 * 名前空間オブジェクトの値はライブバインディングなので、getter で表す。
 */
function makeSceneModule(withAssign = true) {
  const body = `"use strict";
    let hp = 40
    const LIMIT = 99
    const B = { state: 'fighting' }
    function getHp() { return hp }
    function damage() { hp -= 5 }
    ${withAssign ? SCENE_ASSIGN_SOURCE : ''}
    const ns = {
      get hp() { return hp },
      get LIMIT() { return LIMIT },
      get B() { return B },
      getHp, damage,
      scenario: [], sceneConfig: { name: 's' },
    }
    ${withAssign ? 'ns.__wtkAssign = __wtkAssign' : ''}
    return ns`
  return new Function(body)()
}

/** Core.executeCode と同じ手順（取り込み → 実行して書き戻し → モジュールへ戻す → 取り込み直し） */
function makeExecutor(mod: any) {
  const sceneFile: Record<string, any> = { ...mod }
  const binding = createSceneBinding(mod)
  const exec = (code: string) => {
    pullSceneVariables(binding, sceneFile)
    const keys = Object.keys(sceneFile).filter((k) => /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k))
    const before: Record<string, any> = {}
    keys.forEach((k) => (before[k] = sceneFile[k]))
    const decl = keys.map((k) => `let ${k} = _ctx[${JSON.stringify(k)}];`).join('\n')
    const back = keys.map((k) => `_ctx[${JSON.stringify(k)}] = ${k};`).join('\n')
    const result = new Function('_ctx', `${decl}\nconst _result = (function() { ${code} })();\n${back}\nreturn _result;`)(sceneFile)
    pushSceneVariables(binding, sceneFile, before)
    pullSceneVariables(binding, sceneFile)
    return result
  }
  return { sceneFile, binding, exec }
}

describe('タグとスクリプトの関数で、同じ変数の値が見える（#230）', () => {
  test('Issue の再現手順：タグで代入 → 関数で減らす', () => {
    const { exec } = makeExecutor(makeSceneModule())
    exec('hp = 10')
    expect(exec('return `${hp} / ${getHp()}`')).toBe('10 / 10')
    exec('damage()')
    expect(exec('return `${hp} / ${getHp()}`')).toBe('5 / 5')
  })

  test('同じコードの中で関数を呼んでも、その結果がタグ側に見える', () => {
    const { exec } = makeExecutor(makeSceneModule())
    expect(exec('damage(); return hp')).toBe(40) // 同じ式の中ではローカルの写し（これまでどおり）
    expect(exec('return hp')).toBe(35) // 次のタグでは関数が変えた値
  })

  test('const への代入はモジュールに届かず、以後は sceneFile の値のまま（これまでどおり）', () => {
    const { exec, binding } = makeExecutor(makeSceneModule())
    exec('LIMIT = 5')
    expect(binding.sceneOnly.has('LIMIT')).toBe(true)
    expect(exec('return LIMIT')).toBe(5)
  })

  test('オブジェクトの中身の書き換えは、これまでどおり両方から見える', () => {
    const mod = makeSceneModule()
    const { exec } = makeExecutor(mod)
    exec("B.state = 'won'")
    expect(mod.B.state).toBe('won')
  })

  test('__wtkAssign のない古いシーンでは、これまでどおり sceneFile だけで動く', () => {
    const mod = makeSceneModule(false)
    const { exec } = makeExecutor(mod)
    exec('hp = 10')
    expect(exec('return hp')).toBe(10) // タグ側は代入した値
    expect(mod.getHp()).toBe(40) // 関数側には届かない（従来の動き）
  })

  test('__wtkAssign は識別子以外の名前を受け取らない（エンジンが識別子だけを渡す）', () => {
    const mod = makeSceneModule()
    const binding = createSceneBinding(mod)
    const sceneFile: any = { ...mod, 'a-b': 1 }
    pushSceneVariables(binding, sceneFile, { 'a-b': 0 })
    expect(mod.hp).toBe(40)
  })
})
