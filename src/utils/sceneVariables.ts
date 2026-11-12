/**
 * シーン変数（シーンファイルの <script> から export した値）のセーブ・ロード（#240 の一部）。
 *
 * - 保存するのは JSON にできる値だけ：数値・文字列・真偽値・null と、それらだけでできた素のオブジェクト・配列。
 *   関数・クラスのインスタンス・シナリオ本体（scenario）・sceneConfig は保存しない。
 * - 復元では、オブジェクトと配列は「中身を入れ替える」。<script> 側の関数や、別のモジュールから
 *   export した状態（例：export const G = {...}）は同じオブジェクトを参照しているため、
 *   参照を差し替えると関数からは古い値が見えたままになる（#230 と同じ理由）。
 */

/** 保存しないキー */
const SKIP = new Set(['scenario', 'sceneConfig', 'default'])

function isPlainObject(v: any): v is Record<string, any> {
  if (v === null || typeof v !== 'object' || Array.isArray(v)) return false
  const proto = Object.getPrototypeOf(v)
  return proto === Object.prototype || proto === null
}

/** 素の値・素のオブジェクト・配列だけでできているか（関数やクラスのインスタンスを含まない） */
function isPlainData(v: any, seen = new Set<any>()): boolean {
  if (v === null) return true
  const t = typeof v
  if (t === 'string' || t === 'boolean') return true
  if (t === 'number') return Number.isFinite(v)
  if (t !== 'object') return false
  if (seen.has(v)) return false // 循環参照は保存しない（seen は今たどっている親だけ。同じ値を 2 か所で使うのはよい）
  if (!Array.isArray(v) && !isPlainObject(v)) return false
  seen.add(v)
  const ok = (Array.isArray(v) ? v : Object.values(v)).every((x) => x === undefined || isPlainData(x, seen))
  seen.delete(v)
  return ok
}

/** 今のシーン変数のうち、保存できるものを写しで返す */
export function captureSceneVariables(sceneFile: Record<string, any> | null | undefined): Record<string, any> {
  const out: Record<string, any> = {}
  if (!sceneFile) return out
  for (const key of Object.keys(sceneFile)) {
    if (SKIP.has(key)) continue
    const value = sceneFile[key]
    if (!isPlainData(value)) continue
    out[key] = JSON.parse(JSON.stringify(value))
  }
  return out
}

/** target の中身を value に入れ替える（参照は保つ）。入れ替えられなければ false */
function replaceInPlace(target: any, value: any): boolean {
  try {
    if (Array.isArray(target) && Array.isArray(value)) {
      target.length = 0
      target.push(...value)
      return true
    }
    if (isPlainObject(target) && isPlainObject(value)) {
      for (const k of Object.keys(target)) if (!(k in value)) delete target[k]
      Object.assign(target, value)
      return true
    }
  } catch {
    // 凍結されたオブジェクトなどは、下で参照ごと差し替える
  }
  return false
}

/** 保存したシーン変数を、読み込み直したシーンに戻す */
export function restoreSceneVariables(sceneFile: Record<string, any>, saved: Record<string, any> | null | undefined): void {
  if (!sceneFile || !saved) return
  for (const key of Object.keys(saved)) {
    if (SKIP.has(key)) continue
    const value = JSON.parse(JSON.stringify(saved[key]))
    if (replaceInPlace(sceneFile[key], value)) continue
    // 関数を同じ名前の値で上書きしない（シーンの作りが変わったセーブを読んだとき）
    if (typeof sceneFile[key] === 'function') continue
    sceneFile[key] = value
  }
}
