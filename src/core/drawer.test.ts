import { Drawer, sortDisplayedImageEntries } from './drawer'

describe('sortDisplayedImageEntries', () => {
  test('z-index属性で昇順ソートされること', () => {
    const displayedImages = {
      a: { image: {}, 'z-index': 3 },
      b: { image: {}, 'z-index': 1 },
      c: { image: {}, 'z-index': 2 },
    }

    const keys = sortDisplayedImageEntries(displayedImages).map(([key]) => key)
    expect(keys).toEqual(['b', 'c', 'a'])
  })

  test('同順位は元の挿入順を維持すること', () => {
    const displayedImages = {
      first: { image: {}, 'z-index': 1 },
      second: { image: {}, 'z-index': 1 },
      third: { image: {}, 'z-index': 1 },
    }

    const keys = sortDisplayedImageEntries(displayedImages).map(([key]) => key)
    expect(keys).toEqual(['first', 'second', 'third'])
  })
})

describe('animateImageAlpha', () => {
  const originalRaf = global.requestAnimationFrame
  const originalNow = performance.now

  afterEach(() => {
    global.requestAnimationFrame = originalRaf
    performance.now = originalNow
    jest.restoreAllMocks()
  })

  const createDrawerForAnimation = () => {
    const drawer = Object.create(Drawer.prototype) as any
    const ctx = {
      canvas: { width: 1280, height: 720 },
      clearRect: jest.fn(),
      globalAlpha: 1,
    } as any
    const drawCalls: Array<{ id: string; alpha: number }> = []
    drawer.ctx = ctx
    drawer.drawCanvas = jest.fn((img: any) => {
      drawCalls.push({ id: img.id, alpha: ctx.globalAlpha })
    })
    return { drawer, drawCalls }
  }

  const mockAnimationFrames = (times: number[]) => {
    global.requestAnimationFrame = jest.fn((callback: FrameRequestCallback) => {
      const time = times.shift() ?? 1000
      setImmediate(() => callback(time))
      return 1
    })
    performance.now = jest.fn(() => 0)
  }

  test('z-index順を維持しつつ対象画像のみalphaが変化すること', async () => {
    const { drawer, drawCalls } = createDrawerForAnimation()
    mockAnimationFrames([0, 1000])
    const displayedImages = {
      front: { image: { id: 'front' }, size: {}, 'z-index': 3 },
      target: { image: { id: 'target' }, size: {}, 'z-index': 2 },
      back: { image: { id: 'back' }, size: {}, 'z-index': 1 },
    }

    await drawer['animateImageAlpha']('target', displayedImages, 0, 1, 1000)

    expect(drawCalls.slice(0, 3).map((call) => call.id)).toEqual(['back', 'target', 'front'])
    expect(drawCalls.slice(3, 6).map((call) => call.id)).toEqual(['back', 'target', 'front'])
    expect(drawCalls.filter((call) => call.id === 'target').map((call) => call.alpha)).toEqual([0, 1])
    expect(drawCalls.filter((call) => call.id !== 'target').every((call) => call.alpha === 1)).toBe(true)
  })

  test('previousImageがある場合は対象画像の下地として描画されること', async () => {
    const { drawer, drawCalls } = createDrawerForAnimation()
    mockAnimationFrames([0, 1000])
    const displayedImages = {
      back: { image: { id: 'back' }, size: {}, 'z-index': 1 },
      target: { image: { id: 'target' }, size: {}, 'z-index': 2 },
      front: { image: { id: 'front' }, size: {}, 'z-index': 3 },
    }

    await drawer['animateImageAlpha']('target', displayedImages, 0, 1, 1000, {
      image: { id: 'previous' },
      pos: { x: 0, y: 0 },
      size: { width: 100, height: 100 },
    })

    expect(drawCalls.slice(0, 4).map((call) => call.id)).toEqual(['back', 'previous', 'target', 'front'])
    expect(drawCalls.slice(4, 8).map((call) => call.id)).toEqual(['back', 'previous', 'target', 'front'])
    expect(drawCalls.filter((call) => call.id === 'previous').every((call) => call.alpha === 1)).toBe(true)
  })
})

describe('選択肢の欄のクリック', () => {
  const originalDocument = (global as any).document
  const originalWindow = (global as any).window

  afterEach(() => {
    ;(global as any).document = originalDocument
    ;(global as any).window = originalWindow
  })

  // 子要素の出し入れだけを扱う疑似要素
  class FakeElement {
    style: Record<string, string> = {}
    className = ''
    innerHTML = ''
    id = ''
    children: FakeElement[] = []
    parentNode: FakeElement | null = null
    onclick: (() => void) | null = null
    get childElementCount() {
      return this.children.length
    }
    appendChild(child: FakeElement) {
      child.parentNode = this
      this.children.push(child)
      return child
    }
    insertBefore(child: FakeElement) {
      return this.appendChild(child)
    }
    removeChild(child: FakeElement) {
      this.children = this.children.filter((c) => c !== child)
      child.parentNode = null
      return child
    }
    querySelectorAll(selector: string) {
      return this.children.filter((c) => selector === '.' + c.className)
    }
    addEventListener() {}
    getContext() {
      return { fillRect: () => {}, fillStyle: '', canvas: this }
    }
  }

  const setup = () => {
    const interactiveView = new FakeElement()
    interactiveView.id = 'interactiveView'
    ;(global as any).window = { innerWidth: 1280, innerHeight: 720 }
    ;(global as any).document = {
      createElement: () => new FakeElement(),
      querySelector: (selector: string) => (selector === '#interactiveView' ? interactiveView : null),
      getElementById: () => null,
    }
    const screenHtml: any = { querySelector: (selector: string) => (selector === '#interactiveView' ? interactiveView : new FakeElement()) }
    const gameScreen: any = Object.assign(new FakeElement(), { scrollWidth: 1280, scrollHeight: 720 })
    ;(gameScreen.style as any).setProperty = () => {}
    const drawer = Object.create(Drawer.prototype) as any
    drawer.gameScreen = gameScreen
    drawer.setScreen(screenHtml, { width: 1280, height: 720 })
    return { drawer, interactiveView }
  }

  test('画面を読み込んだとき、空の選択肢の欄はクリックを通す', () => {
    const { interactiveView } = setup()
    expect(interactiveView.style.pointerEvents).toBe('none')
  })

  test('選択肢を出している間だけクリックを受け取り、選んだら通す', async () => {
    const { drawer, interactiveView } = setup()
    const result = drawer.drawChoices({ content: [{ id: 0, label: 'はい', content: [] }, { id: 1, label: 'いいえ', content: ['B'] }] })
    const shown = { count: interactiveView.childElementCount, pointer: interactiveView.style.pointerEvents }
    // 先に選んで選択待ちを終わらせてから確かめる（確認が失敗しても待ちが残らないように）
    interactiveView.children[1].onclick!()
    expect(shown).toEqual({ count: 2, pointer: '' })
    expect(interactiveView.childElementCount).toBe(0)
    expect(interactiveView.style.pointerEvents).toBe('none')
    await expect(result).resolves.toEqual({ selectId: 1, onSelect: ['B'] })
  })
})
