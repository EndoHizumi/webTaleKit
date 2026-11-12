/**
 * シーン変数とシーンのモジュールの変数をそろえる（#230）。
 *
 * loadScene はモジュールの値を sceneFile に写し取るので、そのままでは
 * - <script> の関数がモジュールの `export let` を書き換えても、タグ（<call>・if・{{…}}）からは古い値が見え、
 * - タグで代入しても、<script> の関数からは古い値が見える。
 * executeCode の前後でこれらを呼び、両方から同じ値が見えるようにする。
 *
 * モジュールの変数へ代入できるのは、パーサーが <script> の末尾に __wtkAssign を足したシーンだけ。
 * 古いパーサーで作ったシーン（__wtkAssign がない）では何もしない（これまでどおり sceneFile だけで動く）。
 */

const ASSIGN = '__wtkAssign'
const SKIP = new Set(['scenario', 'sceneConfig', ASSIGN])
const IDENT = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/

export interface SceneBinding {
  module: Record<string, any> | null
  /** モジュールへ代入できなかった変数（const など）。以後は sceneFile の値を正とする */
  sceneOnly: Set<string>
}

export function createSceneBinding(moduleNamespace: Record<string, any> | null | undefined): SceneBinding {
  const mod = moduleNamespace && typeof moduleNamespace[ASSIGN] === 'function' ? moduleNamespace : null
  return { module: mod, sceneOnly: new Set() }
}

function variableKeys(binding: SceneBinding): string[] {
  const mod = binding.module
  if (!mod) return []
  return Object.keys(mod).filter((key) => !SKIP.has(key) && IDENT.test(key) && typeof mod[key] !== 'function')
}

/** モジュールの今の値を sceneFile に取り込む（<script> の関数が書き換えた値をタグから見えるように） */
export function pullSceneVariables(binding: SceneBinding, sceneFile: Record<string, any>): void {
  for (const key of variableKeys(binding)) {
    if (binding.sceneOnly.has(key)) continue
    sceneFile[key] = binding.module![key]
  }
}

/**
 * タグのコードで代入された変数（before から値が変わったもの）を、モジュールにも代入する。
 * 代入できなかった変数（const など）は sceneOnly に入れ、以後は sceneFile の値のまま使う。
 */
export function pushSceneVariables(binding: SceneBinding, sceneFile: Record<string, any>, before: Record<string, any>): void {
  const mod = binding.module
  if (!mod) return
  for (const key of variableKeys(binding)) {
    if (binding.sceneOnly.has(key)) continue
    if (sceneFile[key] === before[key]) continue
    try {
      mod[ASSIGN](key, sceneFile[key])
    } catch {
      binding.sceneOnly.add(key)
    }
  }
}
