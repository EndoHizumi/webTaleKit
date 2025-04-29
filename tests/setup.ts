// テスト環境のグローバル設定
import '@testing-library/jest-dom'

import { createCanvas } from 'canvas'

// Canvasのセットアップ
const canvas = createCanvas(800, 600)
const ctx = canvas.getContext('2d')

// HTMLCanvasElement のモック
Object.defineProperty(window, 'HTMLCanvasElement', {
  value: class MockHTMLCanvasElement {
    _canvas = canvas
    _ctx = ctx
    
    getContext(contextType: string) {
      if (contextType === '2d') {
        return this._ctx
      }
      return null
    }

    get width() {
      return this._canvas.width
    }

    set width(value) {
      this._canvas.width = value
    }

    get height() {
      return this._canvas.height
    }

    set height(value) {
      this._canvas.height = value
    }

    get style() {
      return {
        position: '',
        top: '',
        left: '',
        pointerEvents: '',
        transform: ''
      }
    }

    set style(value) {
      // スタイルの設定は無視
    }

    get className() {
      return ''
    }

    set className(value) {
      // クラス名の設定は無視
    }

    appendChild() {
      // 何もしない
    }

    removeChild() {
      // 何もしない
    }
  }
})

// requestAnimationFrameのモック
global.requestAnimationFrame = (callback: FrameRequestCallback): number => {
  return setTimeout(() => callback(Date.now()), 0) as unknown as number
}

// cancelAnimationFrameのモック
global.cancelAnimationFrame = (handle: number): void => {
  clearTimeout(handle)
}

// コンソール出力のモック
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
}

// ResizeObserverのモック
class MockResizeObserver {
  observe = jest.fn()
  unobserve = jest.fn()
  disconnect = jest.fn()
}

global.ResizeObserver = MockResizeObserver

// IntersectionObserverのモック
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null
  readonly rootMargin: string = '0px'
  readonly thresholds: ReadonlyArray<number> = [0]
  
  observe = jest.fn()
  unobserve = jest.fn()
  disconnect = jest.fn()
  takeRecords = (): IntersectionObserverEntry[] => []
}

global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver

// window.matchMediaのモック
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
})

// DOMRect のモック
class MockDOMRect implements DOMRect {
  x = 0
  y = 0
  width = 0
  height = 0
  top = 0
  right = 0
  bottom = 0
  left = 0

  toJSON(): any {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      top: this.top,
      right: this.right,
      bottom: this.bottom,
      left: this.left
    }
  }

  static fromRect(other?: DOMRectInit): DOMRect {
    const rect = new MockDOMRect()
    if (other) {
      rect.x = other.x ?? 0
      rect.y = other.y ?? 0
      rect.width = other.width ?? 0
      rect.height = other.height ?? 0
      rect.top = rect.y
      rect.right = rect.x + rect.width
      rect.bottom = rect.y + rect.height
      rect.left = rect.x
    }
    return rect
  }
}

global.DOMRect = MockDOMRect as unknown as typeof DOMRect

// テスト終了時のクリーンアップ
afterEach(() => {
  jest.clearAllMocks()
  document.body.innerHTML = ''
})