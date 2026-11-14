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

describe('adjustScale', () => {
  const originalWindow = (global as any).window

  afterEach(() => {
    ;(global as any).window = originalWindow
  })

  // style.setProperty と通常のプロパティの両方を記録する疑似要素
  const createElement = () => {
    const props: Record<string, string> = {}
    const style: any = { setProperty: (name: string, value: string) => (props[name] = value) }
    return { el: { scrollWidth: 1280, scrollHeight: 720, style } as any, props, style }
  }

  test('拡大縮小と中央寄せを、transform ではなく translate / scale に入れる', () => {
    ;(global as any).window = { innerWidth: 1920, innerHeight: 1200 }
    const { el, props, style } = createElement()
    const drawer = Object.create(Drawer.prototype) as any
    drawer.adjustScale(el)
    // 1920/1280 = 1.5、1200/720 = 1.67 → 1.5。縦に (1200 - 1080) / 2 = 60px 寄せる
    expect(props.scale).toBe('1.5')
    expect(props.translate).toBe('0px 60px')
    expect(props['--wtk-scale']).toBe('1.5')
    expect(style.transformOrigin).toBe('top left')
    expect(style.transform).toBeUndefined()
  })

  test('演出が transform を使っていても、拡大縮小で上書きしない', () => {
    ;(global as any).window = { innerWidth: 640, innerHeight: 360 }
    const { el, props, style } = createElement()
    style.transform = 'translateX(12px) rotate(1deg)'
    const drawer = Object.create(Drawer.prototype) as any
    drawer.adjustScale(el)
    expect(style.transform).toBe('translateX(12px) rotate(1deg)')
    expect(props.scale).toBe('0.5')
    expect(props.translate).toBe('0px 0px')
  })
})
