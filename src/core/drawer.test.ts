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
