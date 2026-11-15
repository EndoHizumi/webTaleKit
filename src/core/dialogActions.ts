/**
 * <dialog> の <action> を、ボタンの中身にする。
 *
 *   <action id="wolf" label="灰牙狼の駆除" image="./img/wolf.jpg" note="報酬 金貨 70" badge="{{rank}}" disabled="{{!canTake('wolf')}}">
 *
 * - image・note・badge のどれかがあれば、ボタンを
 *   <img class="dialog-button-image"> <span class="dialog-button-label"> <span class="dialog-button-note"> <span class="dialog-button-badge">
 *   で組み立てる（文字はエスケープする）。どれも無ければ、今までどおり label の文字だけ
 * - disabled：属性があり、展開した値が false・0・null・undefined 以外なら選べない
 *   （ボタンに disabled と is-disabled クラスを付け、押しても閉じない）
 * - どの属性も {{…}} を展開する
 */
export interface ActionView {
  label: string
  /** image・note・badge があるときの中身（HTML）。無ければ null で、label を文字として入れる */
  html: string | null
  disabled: boolean
}

const esc = (t: any) =>
  String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string)

const NOT_DISABLED = new Set(['false', '0', 'null', 'undefined'])

export function isDisabledValue(v: any): boolean {
  if (v === undefined || v === null || v === false) return false
  if (v === true) return true
  return !NOT_DISABLED.has(String(v).trim())
}

export function renderAction(action: any, expand: (t: any) => any = (t) => t): ActionView {
  const ex = (v: any) => (v === undefined || v === null ? undefined : expand(String(v)))
  const label = String(ex(action.label) ?? '')
  const image = ex(action.image)
  const note = ex(action.note)
  const badge = ex(action.badge)
  const disabled = action.disabled !== undefined && isDisabledValue(ex(action.disabled))
  const rich = !!(image || note || badge)
  const html = rich
    ? (image ? `<img class="dialog-button-image" src="${esc(image)}" alt="">` : '') +
      `<span class="dialog-button-label">${esc(label)}</span>` +
      (note ? `<span class="dialog-button-note">${esc(note)}</span>` : '') +
      (badge ? `<span class="dialog-button-badge">${esc(badge)}</span>` : '')
    : null
  return { label, html, disabled }
}
