import { bindUiActions, renderBacklogHtml, syncActionButtons } from './uiActions'

// ---- テスト用の小さな DOM（このテストで使うセレクタだけを解釈する） ----
type Listener = { fn: (e: any) => void; capture: boolean }
class FakeEl {
  id = ''
  attrs: Record<string, string> = {}
  // 本物の DOM と同じく、インラインの visibility は最初は空文字
  style: Record<string, string> = { visibility: '' }
  children: FakeEl[] = []
  parent: FakeEl | null = null
  listeners: Record<string, Listener[]> = {}
  innerHTMLValue = ''
  scrollTop = 0
  scrollHeight = 100
  ownerDocument: any = null
  classList = {
    set: new Set<string>(),
    add: (c: string) => this.classList.set.add(c),
    remove: (c: string) => this.classList.set.delete(c),
    contains: (c: string) => this.classList.set.has(c),
    toggle: (c: string, on?: boolean) => {
      const v = on ?? !this.classList.set.has(c)
      if (v) this.classList.set.add(c)
      else this.classList.set.delete(c)
      return v
    },
  }
  constructor(opts: { id?: string; cls?: string[]; attrs?: Record<string, string> } = {}) {
    this.id = opts.id || ''
    for (const c of opts.cls || []) this.classList.add(c)
    this.attrs = { ...(opts.attrs || {}) }
  }
  // className に入れたら classList にも入る（本物の DOM と同じ）
  set className(v: string) {
    this.classList.set = new Set(v.split(/\s+/).filter(Boolean))
  }
  get className() {
    return Array.from(this.classList.set).join(' ')
  }
  set innerHTML(v: string) {
    this.innerHTMLValue = v
    // 読み返しの窓の中身から、テストで使う要素だけを作る
    this.children = []
    if (v.includes('wtk-backlog-list')) this.append(new FakeEl({ cls: ['wtk-backlog-list'] }))
    if (v.includes('wtk-backlog-close')) this.append(new FakeEl({ cls: ['wtk-backlog-close'] }))
  }
  get innerHTML() {
    return this.innerHTMLValue
  }
  append(c: FakeEl) {
    c.parent = this
    this.children.push(c)
    return c
  }
  appendChild(c: FakeEl) {
    return this.append(c)
  }
  remove() {
    if (this.parent) this.parent.children = this.parent.children.filter((x) => x !== this)
    this.parent = null
  }
  getAttribute(k: string) {
    return this.attrs[k] ?? null
  }
  setAttribute(k: string, v: string) {
    this.attrs[k] = v
  }
  matches(sel: string): boolean {
    return sel.split(',').some((part) => {
      const s = part.trim()
      if (s.startsWith('#')) return this.id === s.slice(1)
      if (s.startsWith('.')) return this.classList.contains(s.slice(1))
      const m = s.match(/^\[([\w-]+)(?:="([^"]*)")?\]$/)
      if (m) return m[2] === undefined ? m[1] in this.attrs : this.attrs[m[1]] === m[2]
      return false
    })
  }
  all(): FakeEl[] {
    return this.children.flatMap((c) => [c, ...c.all()])
  }
  querySelectorAll(sel: string) {
    return this.all().filter((e) => e.matches(sel))
  }
  querySelector(sel: string) {
    return this.querySelectorAll(sel)[0] || null
  }
  closest(sel: string): FakeEl | null {
    let n: FakeEl | null = this
    while (n) {
      if (n.matches(sel)) return n
      n = n.parent
    }
    return null
  }
  contains(n: FakeEl): boolean {
    let p: FakeEl | null = n
    while (p) {
      if (p === this) return true
      p = p.parent
    }
    return false
  }
  addEventListener(t: string, fn: any, opt?: any) {
    const capture = opt === true || !!opt?.capture
    ;(this.listeners[t] ||= []).push({ fn, capture })
  }
  removeEventListener(t: string, fn: any) {
    this.listeners[t] = (this.listeners[t] || []).filter((l) => l.fn !== fn)
  }
}
// capture（外→内）と bubble（内→外）の順で呼ぶ。stopPropagation でそこから先には届かない
function dispatch(target: FakeEl, type: string) {
  const path: FakeEl[] = []
  for (let n: FakeEl | null = target; n; n = n.parent) path.unshift(n)
  let stopped = false
  const e = { type, target, stopPropagation: () => (stopped = true), preventDefault: () => {} }
  for (const n of path) {
    for (const l of [...(n.listeners[type] || [])]) if (l.capture) l.fn(e)
    if (stopped) return
  }
  for (const n of [...path].reverse()) {
    for (const l of [...(n.listeners[type] || [])]) if (!l.capture) l.fn(e)
    if (stopped) return
  }
}

function setup(backlog = [{ name: 'コルネイユ', text: '遅いぞ。' }]) {
  const docListeners: any[] = []
  const doc: any = {
    head: new FakeEl(),
    getElementById: () => null,
    createElement: () => new FakeEl(),
    addEventListener: (_t: string, fn: any) => docListeners.push(fn),
    removeEventListener: () => {},
  }
  const container = new FakeEl({ id: 'gameContainer' })
  container.ownerDocument = doc
  const msg = container.append(new FakeEl({ id: 'messageWindow' }))
  msg.style.visibility = 'visible' // エンジンがインラインで書いている
  const choices = container.append(new FakeEl({ id: 'interactiveView' }))
  const menu = container.append(new FakeEl({ attrs: { 'data-wtk-hide': '' } }))
  const btn = (a: string) => menu.append(new FakeEl({ attrs: { 'data-wtk-action': a } }))
  const auto = btn('auto')
  const skip = btn('skip')
  const hide = btn('hide')
  const log = btn('log')
  const state = { auto: false, skip: false }
  const host = {
    getState: () => ({ ...state }),
    setAuto: (on: boolean) => (state.auto = on),
    setSkip: (on: boolean) => (state.skip = on),
    getBacklog: () => backlog,
  }
  // 文を進めるクリック（エンジンの input:bind と同じく、コンテナの bubble）
  const onNext = jest.fn()
  container.addEventListener('click', onNext)
  const ui = bindUiActions(container as any, host)
  return { container, msg, choices, menu, auto, skip, hide, log, state, onNext, ui }
}

describe('data-wtk-action のボタン', () => {
  test('オート：押すと切り替わり、札（is-active・aria-pressed）が付く。文は進まない', () => {
    const t = setup()
    dispatch(t.auto, 'click')
    expect(t.state.auto).toBe(true)
    expect(t.auto.classList.contains('is-active')).toBe(true)
    expect(t.auto.getAttribute('aria-pressed')).toBe('true')
    expect(t.onNext).not.toHaveBeenCalled()
    dispatch(t.auto, 'click')
    expect(t.state.auto).toBe(false)
    expect(t.auto.classList.contains('is-active')).toBe(false)
  })

  test('オートとスキップは同時に入らない', () => {
    const t = setup()
    dispatch(t.auto, 'click')
    dispatch(t.skip, 'click')
    expect(t.state).toEqual({ auto: false, skip: true })
    expect(t.skip.classList.contains('is-active')).toBe(true)
    expect(t.auto.classList.contains('is-active')).toBe(false)
  })

  test('ボタン以外のクリックは、今までどおり文を進める', () => {
    const t = setup()
    dispatch(t.msg, 'click')
    expect(t.onNext).toHaveBeenCalledTimes(1)
  })

  test('隠す：メッセージ窓・選択肢・data-wtk-hide をインラインで隠し、次のクリックで元に戻す（そのクリックで文は進まない）', () => {
    jest.useFakeTimers()
    const t = setup()
    dispatch(t.hide, 'click')
    expect(t.msg.style.visibility).toBe('hidden')
    expect(t.choices.style.visibility).toBe('hidden')
    expect(t.menu.style.visibility).toBe('hidden')
    jest.runAllTimers()
    dispatch(t.container, 'click')
    expect(t.msg.style.visibility).toBe('visible')
    expect(t.menu.style.visibility).toBe('')
    expect(t.onNext).not.toHaveBeenCalled()
    dispatch(t.container, 'click')
    expect(t.onNext).toHaveBeenCalledTimes(1)
    jest.useRealTimers()
  })

  test('ログ：読み返しの窓を開き、オートを止める。閉じると窓が消えてオートが戻る', () => {
    const t = setup()
    dispatch(t.auto, 'click')
    dispatch(t.log, 'click')
    const panel = t.container.querySelector('.wtk-backlog')
    expect(panel).not.toBeNull()
    expect(panel!.innerHTML).toContain('遅いぞ。')
    expect(t.state.auto).toBe(false)
    dispatch(panel!.querySelector('.wtk-backlog-close')!, 'click')
    expect(t.container.querySelector('.wtk-backlog')).toBeNull()
    expect(t.state.auto).toBe(true)
    expect(t.onNext).not.toHaveBeenCalled()
  })

  test('ログは <dialog> を showModal で開き、Esc など（ブラウザの close）で閉じても片付く', () => {
    const t = setup()
    dispatch(t.auto, 'click')
    dispatch(t.log, 'click')
    // テスト用の DOM には showModal が無いので、開いた <dialog> に close を送って、ブラウザが閉じたときを再現する
    const panel = t.container.querySelector('.wtk-backlog')!
    expect(panel.getAttribute('open')).toBe('')
    dispatch(panel, 'close')
    expect(t.container.querySelector('.wtk-backlog')).toBeNull()
    expect(t.state.auto).toBe(true)
  })

  test('ログの枠の外（<dialog> そのもの）を押しても閉じ、文は進まない', () => {
    const t = setup()
    dispatch(t.log, 'click')
    dispatch(t.container.querySelector('.wtk-backlog')!, 'click')
    expect(t.container.querySelector('.wtk-backlog')).toBeNull()
    expect(t.onNext).not.toHaveBeenCalled()
  })

  test('sync()：画面が入れ替わったあとのボタンにも、今の状態を写す', () => {
    const t = setup()
    t.state.skip = true
    const fresh = t.menu.append(new FakeEl({ attrs: { 'data-wtk-action': 'skip' } }))
    t.ui.sync()
    expect(fresh.classList.contains('is-active')).toBe(true)
  })
})

describe('renderBacklogHtml / syncActionButtons', () => {
  test('名前と本文をエスケープし、改行は <br> にする。空なら案内を出す', () => {
    const html = renderBacklogHtml([{ name: '<A>', text: '1行目\n<b>2行目</b>' }])
    expect(html).toContain('&lt;A&gt;')
    expect(html).toContain('1行目<br>&lt;b&gt;2行目&lt;/b&gt;')
    expect(renderBacklogHtml([])).toContain('まだ何もありません')
  })

  test('auto・skip 以外のボタンには札を付けない', () => {
    const root = new FakeEl()
    const h = root.append(new FakeEl({ attrs: { 'data-wtk-action': 'hide' } }))
    syncActionButtons(root as any, { auto: true, skip: true })
    expect(h.classList.contains('is-active')).toBe(false)
  })
})
