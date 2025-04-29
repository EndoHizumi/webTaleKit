import { TextMeasurer, DecoratedText } from '../../src/utils/TextMeasurer'

describe('TextMeasurer', () => {
  let textMeasurer: TextMeasurer
  let mockCtx: CanvasRenderingContext2D

  beforeEach(() => {
    // Canvas要素とコンテキストのモック
    const mockCanvas = document.createElement('canvas')
    mockCtx = mockCanvas.getContext('2d')!
    
    // TextMeasurerのインスタンス作成
    textMeasurer = new TextMeasurer()
  })

  describe('measureText', () => {
    it('通常のテキストの寸法を正しく計測できること', () => {
      const text = 'テストテキスト'
      const metrics = textMeasurer.measureText(text)
      
      expect(metrics.width).toBeGreaterThan(0)
      expect(metrics.height).toBeGreaterThan(0)
    })

    it('空文字列の寸法を計測できること', () => {
      const metrics = textMeasurer.measureText('')
      
      expect(metrics.width).toBe(0)
      expect(metrics.height).toBeGreaterThan(0) // 行の高さは存在する
    })
  })

  describe('measureDecoratedText', () => {
    it('太字テキストの寸法を計測できること', () => {
      const decoratedText: DecoratedText = {
        type: 'b',
        content: ['太字テキスト']
      }
      
      const metrics = textMeasurer.measureDecoratedText(decoratedText)
      expect(metrics.width).toBeGreaterThan(0)
      expect(metrics.height).toBeGreaterThan(0)
    })

    it('斜体テキストの寸法を計測できること', () => {
      const decoratedText: DecoratedText = {
        type: 'i',
        content: ['斜体テキスト']
      }
      
      const metrics = textMeasurer.measureDecoratedText(decoratedText)
      expect(metrics.width).toBeGreaterThan(0)
      expect(metrics.height).toBeGreaterThan(0)
    })
  })

  describe('splitIntoLines', () => {
    it('テキストを適切な長さで行分割できること', () => {
      const content = ['これは長いテキストで、複数行に分割される必要があります。']
      const maxWidth = 100 // テスト用の幅

      const lines = textMeasurer.splitIntoLines(content, maxWidth)
      expect(lines.length).toBeGreaterThan(1)
      lines.forEach(line => {
        expect(line.width).toBeLessThanOrEqual(maxWidth)
      })
    })

    it('装飾テキストを含むコンテンツを行分割できること', () => {
      const content = [
        'これは',
        { type: 'b', content: ['太字テキスト'] } as DecoratedText,
        'を含む行です。'
      ]
      const maxWidth = 150

      const lines = textMeasurer.splitIntoLines(content, maxWidth)
      expect(lines.length).toBeGreaterThan(0)
      lines.forEach(line => {
        expect(line.width).toBeLessThanOrEqual(maxWidth)
      })
    })
  })

  describe('checkOverflow', () => {
    it('テキストが領域を超える場合にtrueを返すこと', () => {
      const content = ['これは非常に長いテキストで、指定された高さを超えることが予想されます。'.repeat(5)]
      const maxWidth = 100
      const maxHeight = 50

      const hasOverflow = textMeasurer.checkOverflow(content, maxWidth, maxHeight)
      expect(hasOverflow).toBe(true)
    })

    it('テキストが領域内に収まる場合にfalseを返すこと', () => {
      const content = ['短いテキスト']
      const maxWidth = 200
      const maxHeight = 100

      const hasOverflow = textMeasurer.checkOverflow(content, maxWidth, maxHeight)
      expect(hasOverflow).toBe(false)
    })
  })
})