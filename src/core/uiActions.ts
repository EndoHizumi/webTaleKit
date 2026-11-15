/**
 * 画面テンプレートのボタン（data-wtk-action）を、エンジンの操作につなぐ。
 *
 *   <button data-wtk-action="auto">オート</button>
 *   <button data-wtk-action="skip">スキップ</button>
 *   <button data-wtk-action="hide">隠す</button>
 *   <button data-wtk-action="log">ログ</button>
 *
 * - クリックはゲームコンテナの capture で受け取り、文を進めるクリックには届かせない
 * - オート・スキップが入っているボタンには is-active クラスと aria-pressed="true" を付ける
 * - hide：メッセージ窓・選択肢と、data-wtk-hide を付けた要素を隠し、次のクリックで戻す（そのクリックでは文を進めない）
 * - log：読み返しの窓（.wtk-backlog）を開く。見た目はテンプレートの CSS で変えられる
 */
import type { BacklogEntry } from './scenarioManager'

export const UI_ACTIONS = ['auto', 'skip', 'hide', 'log'] as const
export type UiAction = (typeof UI_ACTIONS)[number]

export interface UiActionHost {
  getState(): { auto: boolean; skip: boolean }
  setAuto(on: boolean): void
  setSkip(on: boolean): void
  getBacklog(): BacklogEntry[]
}

/** 隠す対象（エンジンがインラインで visibility を書く要素もあるので、インラインで上書きして戻す） */
export const HIDE_TARGETS = '#messageWindow, #interactiveView, [data-wtk-hide]'

const esc = (t: string) =>
  String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string)

/** 読み返しの窓の中身（HTML）。名前と本文はエスケープし、改行は <br> にする */
export function renderBacklogHtml(entries: BacklogEntry[], labels = { title: 'ログ', close: '閉じる', empty: 'まだ何もありません' }): string {
  const items = entries.length
    ? entries
        .map(
          (e) =>
            `<div class="wtk-backlog-item">${e.name ? `<div class="wtk-backlog-name">${esc(e.name)}</div>` : ''}<div class="wtk-backlog-text">${esc(e.text).replace(/\n/g, '<br>')}</div></div>`,
        )
        .join('')
    : `<div class="wtk-backlog-empty">${esc(labels.empty)}</div>`
  return `<div class="wtk-backlog-panel"><div class="wtk-backlog-title">${esc(labels.title)}</div><div class="wtk-backlog-list">${items}</div><button type="button" class="wtk-backlog-close">${esc(labels.close)}</button></div>`
}

/** テンプレートに CSS が無くても読めるようにする最低限の見た目（テンプレートの CSS が後から勝つよう、:where で詳細度 0） */
const DEFAULT_STYLE = `
:where(.wtk-backlog){position:absolute;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.6)}
:where(.wtk-backlog-panel){width:80%;height:80%;display:flex;flex-direction:column;padding:16px 24px;box-sizing:border-box;background:rgba(10,10,20,.95);color:#fff;border-radius:8px}
:where(.wtk-backlog-title){text-align:center;font-weight:bold;margin-bottom:8px}
:where(.wtk-backlog-list){flex:1;overflow-y:auto;line-height:1.6}
:where(.wtk-backlog-item){padding:6px 0;border-bottom:1px solid rgba(255,255,255,.15)}
:where(.wtk-backlog-name){font-weight:bold;opacity:.85}
:where(.wtk-backlog-close){align-self:center;margin-top:10px;padding:6px 24px;cursor:pointer}`

/** オート・スキップのボタンの札を、今の状態に合わせる */
export function syncActionButtons(container: ParentNode, state: { auto: boolean; skip: boolean }): void {
  for (const [action, on] of [['auto', state.auto], ['skip', state.skip]] as const) {
    container.querySelectorAll(`[data-wtk-action="${action}"]`).forEach((el: any) => {
      el.classList?.toggle('is-active', !!on)
      el.setAttribute?.('aria-pressed', String(!!on))
    })
  }
}

// 窓の上の操作を、ゲーム（文を進めるクリックやキー）に届かせない
const SHIELD_EVENTS = ['click', 'mousedown', 'mouseup', 'pointerdown', 'pointerup', 'touchstart', 'touchend', 'keydown', 'keyup', 'wheel']

/**
 * data-wtk-action のクリックをつなぐ。戻り値の sync() で、オート・スキップの札を今の状態に合わせ直せる
 * （画面テンプレートが入れ替わったときやキー操作のあとに呼ぶ）
 */
export function bindUiActions(container: HTMLElement, host: UiActionHost, signal?: AbortSignal): { sync: () => void; run: (a: UiAction) => void } {
  const doc = container.ownerDocument || (globalThis as any).document
  const sync = () => syncActionButtons(container, host.getState())

  // ログや隠すのあいだはオートを止め、閉じたら戻す
  let resumeAuto = false
  const pause = () => {
    const s = host.getState()
    resumeAuto = s.auto
    if (s.auto) host.setAuto(false)
    if (s.skip) host.setSkip(false)
    sync()
  }
  const resume = () => {
    if (resumeAuto) host.setAuto(true)
    resumeAuto = false
    sync()
  }

  function openBacklog() {
    if (container.querySelector('.wtk-backlog')) return
    if (doc && !doc.getElementById?.('wtk-ui-style')) {
      const st = doc.createElement('style')
      st.id = 'wtk-ui-style'
      st.textContent = DEFAULT_STYLE
      doc.head?.appendChild(st)
    }
    pause()
    const el = doc.createElement('div')
    el.className = 'wtk-backlog'
    el.innerHTML = renderBacklogHtml(host.getBacklog())
    for (const t of SHIELD_EVENTS) el.addEventListener(t, (e: Event) => e.stopPropagation())
    const close = () => {
      el.remove()
      doc.removeEventListener?.('keydown', onKey, true)
      resume()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        close()
      }
    }
    el.addEventListener('click', (e: Event) => {
      const t = e.target as any
      if (t === el || t?.closest?.('.wtk-backlog-close')) close()
    })
    doc.addEventListener?.('keydown', onKey, true)
    container.appendChild(el)
    const list = el.querySelector?.('.wtk-backlog-list') as any
    if (list) list.scrollTop = list.scrollHeight
  }

  function hide() {
    if (container.classList.contains('wtk-hidden')) return
    pause()
    const saved: Array<[HTMLElement, string]> = []
    container.querySelectorAll(HIDE_TARGETS).forEach((el: any) => {
      saved.push([el, el.style.visibility])
      el.style.visibility = 'hidden'
    })
    container.classList.add('wtk-hidden')
    // 次のクリックで戻す（隠したクリックそのものは拾わない）
    const back = (e: Event) => {
      e.stopPropagation()
      e.preventDefault?.()
      for (const [el, v] of saved) el.style.visibility = v
      container.classList.remove('wtk-hidden')
      container.removeEventListener('click', back, true)
      resume()
    }
    setTimeout(() => container.addEventListener('click', back, { capture: true, signal } as any), 0)
  }

  const run = (action: UiAction) => {
    const s = host.getState()
    if (action === 'auto') {
      host.setAuto(!s.auto)
      if (!s.auto && s.skip) host.setSkip(false)
    } else if (action === 'skip') {
      host.setSkip(!s.skip)
      if (!s.skip && s.auto) host.setAuto(false)
    } else if (action === 'hide') hide()
    else if (action === 'log') openBacklog()
    sync()
  }

  const onPress = (e: Event) => {
    const btn = (e.target as any)?.closest?.('[data-wtk-action]')
    if (!btn || !container.contains(btn)) return
    const action = btn.getAttribute('data-wtk-action') as UiAction
    if (!UI_ACTIONS.includes(action)) return
    // 文を進めるクリック（ゲームコンテナの bubble）に届かせない
    e.stopPropagation()
    if (e.type === 'click') run(action)
  }
  for (const t of ['click', 'pointerdown', 'mousedown', 'touchstart']) {
    container.addEventListener(t, onPress, { capture: true, signal } as any)
  }
  sync()
  return { sync, run }
}
