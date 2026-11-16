/**
 * ゲームパッドと十字キーで遊べるようにする。
 *
 *   import { installPadNav } from 'webtalekit/src/core/padNav'
 *   installPadNav({ container: document.getElementById('gameContainer'), layers: ['#myMenu'], start: '[data-sys="title"]' })
 *
 * 1. ゲームパッドのボタンを、キー操作とボタンのクリックに置き換える（入口をひとつにする）
 *    A：Enter（決定・読み進める） B：Escape（閉じる） 十字キー・左スティック：矢印キー
 *    X：オート Y：隠す LB：ログ RB：押している間スキップ（Control と同じ） Start：options.start のボタン
 * 2. 矢印キーで、いちばん手前の窓（layers）の中のボタンにフォーカスを移す
 *    - 移る先は画面上の位置で決める（押した向きにある、いちばん近いボタン）。その向きに無ければ DOM 順で端から回り込む
 *    - 窓が開いていないときは何もしない（A で文を進める）
 *    - 窓が開いているあいだの Enter は、フォーカスしているボタンを押す（文は進めない）
 * フォーカスしているボタンには wtk-pad-focus クラスを付ける（マウスを使うと外す）。
 */

export type Dir = 'up' | 'down' | 'left' | 'right'
export interface Rect {
  left: number
  top: number
  width: number
  height: number
}

/** 手前から順に調べる窓（最初に見つかった、見えていてボタンがあるもの） */
export const DEFAULT_LAYERS = ['.wtk-backlog', 'dialog[open]', '#interactiveView']
/** 窓の中で選べるもの */
export const FOCUSABLE =
  'button:not([disabled]), a[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), .choice'
/** B（Escape）で押す「閉じる」ボタン（<dialog> 以外の窓） */
export const CLOSE_BUTTONS = '[data-close], [data-no], .wtk-backlog-close'

/**
 * 今のボタン（from）から dir の向きにある、いちばん近いボタンの番号。無ければ -1。
 * 向きの軸の距離に、横ずれ（重なっていれば 0）を 2 倍で足した値が小さいものを選ぶ。
 */
export function pickSpatial(rects: Rect[], from: number, dir: Dir): number {
  const a = rects[from]
  const ac = { x: a.left + a.width / 2, y: a.top + a.height / 2 }
  let best = -1
  let bestScore = Infinity
  rects.forEach((b, i) => {
    if (i === from) return
    const bc = { x: b.left + b.width / 2, y: b.top + b.height / 2 }
    const horiz = dir === 'left' || dir === 'right'
    const sign = dir === 'right' || dir === 'down' ? 1 : -1
    const main = horiz ? (bc.x - ac.x) * sign : (bc.y - ac.y) * sign
    if (main <= 1) return
    // 横ずれ：軸と直交する向きで、ふたつの範囲が重なっていれば 0、離れていればそのすき間
    const [a0, a1, b0, b1] = horiz
      ? [a.top, a.top + a.height, b.top, b.top + b.height]
      : [a.left, a.left + a.width, b.left, b.left + b.width]
    const side = Math.max(0, b0 - a1, a0 - b1)
    // 押した向きから 45 度より外れたものは選ばない（右上のカードで「右」を押して、ずっと下のボタンへ飛ばないように）
    if (side > main) return
    const score = main + side * 2
    if (score < bestScore) {
      bestScore = score
      best = i
    }
  })
  return best
}

/** 向きに無いときの回り込み：下・右は次、上・左は前（DOM 順、端から端へ） */
export function pickWrap(count: number, from: number, dir: Dir): number {
  if (count === 0) return -1
  const step = dir === 'down' || dir === 'right' ? 1 : -1
  return (from + step + count) % count
}

// ---- ゲームパッド ----
// 標準配置（https://w3c.github.io/gamepad/#remapping）のボタン番号
const PAD = { A: 0, B: 1, X: 2, Y: 3, LB: 4, RB: 5, START: 9, UP: 12, DOWN: 13, LEFT: 14, RIGHT: 15 }
const DIR_KEYS: Record<Dir, string> = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' }
/** 押し始めてから連続で動き出すまでと、その後の間隔（ミリ秒） */
export const REPEAT_DELAY = 400
export const REPEAT_EVERY = 120
const STICK = 0.5

/** そのフレームで押されている向き（十字キーか左スティック。斜めは強いほうの軸） */
export function padDir(buttons: boolean[], axes: number[]): Dir | null {
  if (buttons[PAD.UP]) return 'up'
  if (buttons[PAD.DOWN]) return 'down'
  if (buttons[PAD.LEFT]) return 'left'
  if (buttons[PAD.RIGHT]) return 'right'
  const [x = 0, y = 0] = axes
  if (Math.max(Math.abs(x), Math.abs(y)) < STICK) return null
  return Math.abs(x) > Math.abs(y) ? (x > 0 ? 'right' : 'left') : y > 0 ? 'down' : 'up'
}

/** 向きの長押し：押した瞬間に 1 回、REPEAT_DELAY 後から REPEAT_EVERY ごとに 1 回ずつ返す */
export class DirRepeat {
  private dir: Dir | null = null
  private next = 0
  update(dir: Dir | null, now: number): Dir | null {
    if (dir !== this.dir) {
      this.dir = dir
      this.next = now + REPEAT_DELAY
      return dir
    }
    if (dir && now >= this.next) {
      this.next = now + REPEAT_EVERY
      return dir
    }
    return null
  }
}

export interface PadNavOptions {
  /** ゲームコンテナ（文を進めるキーを受ける要素） */
  container: HTMLElement
  /** DEFAULT_LAYERS より手前に調べる窓（ゲームが独自に出す確認窓など） */
  layers?: string[]
  /** Start で押すボタン（無ければ何もしない） */
  start?: string
}

const STYLE = `
:where(.wtk-pad-focus){outline:3px solid #ffd76a !important;outline-offset:2px;box-shadow:0 0 0 6px rgba(255,215,106,.35) !important}
:where(.choice.wtk-pad-focus){outline:none !important;box-shadow:none !important}
`
// （選択肢は、マウスを乗せたときの見た目（mouseenter）で選んでいるのが分かるので、枠は出さない）

export function installPadNav(options: PadNavOptions): { stop(): void } {
  const { container } = options
  const doc = container.ownerDocument
  const win = doc.defaultView as Window
  const layers = [...(options.layers || []), ...DEFAULT_LAYERS]
  // 印の見た目。画面テンプレートの読み込みで <head> が作り直されることがあるので、使うときに足す
  const ensureStyle = () => {
    if (doc.getElementById('wtk-pad-style')) return
    const st = doc.createElement('style')
    st.id = 'wtk-pad-style'
    st.textContent = STYLE
    doc.head.appendChild(st)
  }

  const visible = (el: Element) => {
    const s = win.getComputedStyle(el)
    if (s.visibility === 'hidden' || s.display === 'none') return false
    const r = el.getBoundingClientRect()
    return r.width > 0 && r.height > 0
  }
  const itemsOf = (layer: Element) => Array.from(layer.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(visible)
  /** いちばん手前の窓と、その中のボタン */
  const activeLayer = (): { el: Element; items: HTMLElement[] } | null => {
    for (const sel of layers) {
      for (const el of Array.from(doc.querySelectorAll(sel))) {
        if (!visible(el)) continue
        const items = itemsOf(el)
        if (items.length) return { el, items }
      }
    }
    return null
  }

  const clearMark = () => doc.querySelectorAll('.wtk-pad-focus').forEach((e) => e.classList.remove('wtk-pad-focus'))
  const focusItem = (el: HTMLElement) => {
    ensureStyle()
    clearMark()
    // 選択肢（div.choice）はそのままではフォーカスできないので、その場で入れる
    if (!el.matches('button, a, input, select, textarea, [tabindex]')) el.tabIndex = 0
    el.focus({ preventScroll: true })
    el.scrollIntoView?.({ block: 'nearest' })
    el.classList.add('wtk-pad-focus')
    el.dispatchEvent(new MouseEvent('mouseenter')) // 選択肢の「上に乗った」絵にする
  }
  const leaveItem = (el: Element | null) => el?.dispatchEvent(new MouseEvent('mouseleave'))
  const isText = (el: Element | null) =>
    !!el && (el.matches('textarea') || (el.matches('input') && !['button', 'submit', 'checkbox', 'radio'].includes((el as HTMLInputElement).type)))

  const onKey = (e: KeyboardEvent) => {
    const dir = (Object.keys(DIR_KEYS) as Dir[]).find((d) => DIR_KEYS[d] === e.key)
    const isEnter = e.key === 'Enter' || e.key === ' '
    if (!dir && !isEnter && e.key !== 'Escape') return
    // 隠しているとき：A で戻す（エンジンは次のクリックで戻す）
    if (isEnter && container.classList.contains('wtk-hidden')) {
      e.preventDefault()
      e.stopPropagation()
      container.click()
      return
    }
    const layer = activeLayer()
    if (!layer) return // 窓が無ければ、エンジンに任せる（Enter で文を進める）
    const cur = doc.activeElement as HTMLElement | null
    // パッド・矢印キーで選んだもの（印つき）だけを「選んでいる」とみなす。
    // <dialog> を開くとブラウザが最初のボタン（閉じる × など）に勝手にフォーカスするので、それで A を押しても閉じないように
    // （文字の入力欄だけは、マウスで選んだものでも「選んでいる」とみなす。そこから矢印でボタンへ移れるように）
    const at = cur && (cur.classList.contains('wtk-pad-focus') || isText(cur)) ? layer.items.indexOf(cur) : -1

    if (e.key === 'Escape') {
      if (layer.el.matches('dialog')) {
        e.preventDefault()
        e.stopPropagation()
        const d = layer.el as HTMLDialogElement & { requestClose?: () => void }
        if (d.requestClose) d.requestClose()
        else if (d.dispatchEvent(new Event('cancel', { cancelable: true }))) d.close()
        return
      }
      const close = layer.el.querySelector<HTMLElement>(CLOSE_BUTTONS)
      if (close) {
        e.preventDefault()
        e.stopPropagation()
        close.click()
      }
      return
    }
    // 文字の入力欄では、左右はカーソル移動、Enter は送信に使う
    // （文字カーソルが端にあるときの左右は、隣のボタンへ移る。パッドでは「話す」ボタンへ行けなくなるため）
    if (isText(cur) && layer.el.contains(cur)) {
      if (isEnter) return
      const f = cur as HTMLInputElement
      const atEdge = dir === 'left' ? f.selectionStart === 0 : f.selectionEnd === f.value.length
      if ((dir === 'left' || dir === 'right') && !atEdge) return
    }

    e.preventDefault()
    e.stopPropagation()
    if (at < 0) {
      // まだどれも選んでいない：最初のボタンを選ぶだけ（押さない）。
      // data-pad-default があればそれ、無ければ閉じるボタン以外の最初のもの
      const first =
        layer.items.find((el) => el.hasAttribute('data-pad-default')) ||
        layer.items.find((el) => !el.matches(CLOSE_BUTTONS)) ||
        layer.items[0]
      focusItem(first)
      return
    }
    if (isEnter) {
      cur!.click()
      return
    }
    const rects = layer.items.map((el) => el.getBoundingClientRect())
    let next = pickSpatial(rects, at, dir!)
    if (next < 0) next = pickWrap(layer.items.length, at, dir!)
    if (next >= 0 && next !== at) {
      leaveItem(cur)
      focusItem(layer.items[next])
    }
  }
  doc.addEventListener('keydown', onKey, true)
  // マウス・タッチを使ったら、パッドの印を消す
  const onPointer = () => clearMark()
  doc.addEventListener('pointerdown', onPointer, true)

  // ---- ゲームパッドを読む（つながっているあいだだけ毎フレーム） ----
  const key = (type: 'keydown' | 'keyup', k: string) => {
    const a = doc.activeElement
    const target = a && a !== doc.body && container.contains(a) ? a : container
    target.dispatchEvent(new KeyboardEvent(type, { key: k, bubbles: true, cancelable: true }))
  }
  const press = (sel: string) => container.querySelector<HTMLElement>(sel)?.click()
  const repeat = new DirRepeat()
  let prev: boolean[] = []
  let raf = 0
  const poll = () => {
    raf = 0
    const pads = (win.navigator.getGamepads?.() || []).filter((p): p is Gamepad => !!p && p.connected)
    if (!pads.length) return
    // つないだパッドが複数あれば、どれで押してもよい
    const buttons: boolean[] = []
    for (const p of pads) p.buttons.forEach((b, i) => (buttons[i] = buttons[i] || b.pressed))
    const axes = pads[0].axes as number[]
    const down = (i: number) => buttons[i] && !prev[i]
    const up = (i: number) => !buttons[i] && prev[i]
    if (down(PAD.A)) key('keydown', 'Enter')
    if (down(PAD.B)) key('keydown', 'Escape')
    if (down(PAD.X)) press('[data-wtk-action="auto"]')
    if (down(PAD.Y)) press('[data-wtk-action="hide"]')
    if (down(PAD.LB)) press('[data-wtk-action="log"]')
    // RB：押している間スキップ（エンジンは Control の押し下げと離しでスキップを切り替える）
    if (down(PAD.RB)) key('keydown', 'Control')
    if (up(PAD.RB)) key('keyup', 'Control')
    if (down(PAD.START) && options.start) press(options.start)
    const d = repeat.update(padDir(buttons, axes), win.performance.now())
    if (d) key('keydown', DIR_KEYS[d])
    prev = buttons
    raf = win.requestAnimationFrame(poll)
  }
  const onConnect = () => {
    if (!raf) raf = win.requestAnimationFrame(poll)
  }
  win.addEventListener('gamepadconnected', onConnect)
  // 読み込み前からつながっていたパッド（ボタンを押すまで見えないブラウザもある）
  onConnect()

  return {
    stop() {
      doc.removeEventListener('keydown', onKey, true)
      doc.removeEventListener('pointerdown', onPointer, true)
      win.removeEventListener('gamepadconnected', onConnect)
      if (raf) win.cancelAnimationFrame(raf)
    },
  }
}
