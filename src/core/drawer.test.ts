import { Drawer, sortDisplayedImageEntries } from './drawer'
import { DisplayedImageMap, Position, Size } from './types'
import { ImageObject } from '../resource/ImageObject'

// テストではImageObjectの実体を使わず、識別用idだけを持つ軽量モックで代用する
const mockImage = (id?: string): ImageObject => (id ? { id } : {}) as unknown as ImageObject

describe('sortDisplayedImageEntries', () => {
  test('z-index属性で昇順ソートされること', () => {
    const displayedImages: DisplayedImageMap = {
      a: { image: mockImage(), 'z-index': 3 },
      b: { image: mockImage(), 'z-index': 1 },
      c: { image: mockImage(), 'z-index': 2 },
    }

    const keys = sortDisplayedImageEntries(displayedImages).map(([key]) => key)
    expect(keys).toEqual(['b', 'c', 'a'])
  })

  test('同順位は元の挿入順を維持すること', () => {
    const displayedImages: DisplayedImageMap = {
      first: { image: mockImage(), 'z-index': 1 },
      second: { image: mockImage(), 'z-index': 1 },
      third: { image: mockImage(), 'z-index': 1 },
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

  // privateメソッドと内部プロパティへアクセスするための構造型
  type TestDrawer = {
    ctx: { canvas: { width: number; height: number }; clearRect: jest.Mock; globalAlpha: number }
    drawCanvas: jest.Mock
    animateImageAlpha: (
      name: string,
      displayedImages: DisplayedImageMap,
      start: number,
      end: number,
      duration: number,
      previousImage?: { image: ImageObject; pos?: Position; size?: Size },
    ) => Promise<void>
  }

  const createDrawerForAnimation = () => {
    const drawer = Object.create(Drawer.prototype) as TestDrawer
    const ctx = {
      canvas: { width: 1280, height: 720 },
      clearRect: jest.fn(),
      globalAlpha: 1,
    }
    const drawCalls: Array<{ id: string; alpha: number }> = []
    drawer.ctx = ctx
    drawer.drawCanvas = jest.fn((img: ImageObject) => {
      drawCalls.push({ id: (img as unknown as { id: string }).id, alpha: ctx.globalAlpha })
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
      front: { image: mockImage('front'), size: {}, 'z-index': 3 },
      target: { image: mockImage('target'), size: {}, 'z-index': 2 },
      back: { image: mockImage('back'), size: {}, 'z-index': 1 },
    } as unknown as DisplayedImageMap

    await drawer.animateImageAlpha('target', displayedImages, 0, 1, 1000)

    expect(drawCalls.slice(0, 3).map((call) => call.id)).toEqual(['back', 'target', 'front'])
    expect(drawCalls.slice(3, 6).map((call) => call.id)).toEqual(['back', 'target', 'front'])
    expect(drawCalls.filter((call) => call.id === 'target').map((call) => call.alpha)).toEqual([0, 1])
    expect(drawCalls.filter((call) => call.id !== 'target').every((call) => call.alpha === 1)).toBe(true)
  })

  test('previousImageがある場合は対象画像の下地として描画されること', async () => {
    const { drawer, drawCalls } = createDrawerForAnimation()
    mockAnimationFrames([0, 1000])
    const displayedImages = {
      back: { image: mockImage('back'), size: {}, 'z-index': 1 },
      target: { image: mockImage('target'), size: {}, 'z-index': 2 },
      front: { image: mockImage('front'), size: {}, 'z-index': 3 },
    } as unknown as DisplayedImageMap

    await drawer.animateImageAlpha('target', displayedImages, 0, 1, 1000, {
      image: mockImage('previous'),
      pos: { x: 0, y: 0 },
      size: { width: 100, height: 100 },
    })

    expect(drawCalls.slice(0, 4).map((call) => call.id)).toEqual(['back', 'previous', 'target', 'front'])
    expect(drawCalls.slice(4, 8).map((call) => call.id)).toEqual(['back', 'previous', 'target', 'front'])
    expect(drawCalls.filter((call) => call.id === 'previous').every((call) => call.alpha === 1)).toBe(true)
  })
})
