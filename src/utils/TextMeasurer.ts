import { outputLog } from './logger'

export interface TextMetrics {
  width: number
  height: number
}

export interface TextLine {
  content: (string | DecoratedText)[]
  width: number
}

export interface DecoratedText {
  type: 'color' | 'ruby' | 'b' | 'i'
  content: string[]
  value?: string
  text?: string
}

export class TextMeasurer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private fontStyle: string
  private lineHeight: number

  constructor() {
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')!
    this.fontStyle = '16px sans-serif'
    this.lineHeight = 1.2
    this.ctx.font = this.fontStyle
  }

  /**
   * フォントスタイルを設定
   */
  setFont(font: string, lineHeight: number = 1.2) {
    this.fontStyle = font
    this.lineHeight = lineHeight
    this.ctx.font = font
  }

  /**
   * テキストの寸法を計測
   */
  measureText(text: string): TextMetrics {
    const metrics = this.ctx.measureText(text)
    const fontSize = parseInt(this.fontStyle)
    return {
      width: metrics.width,
      height: fontSize * this.lineHeight
    }
  }

  /**
   * 装飾テキストの寸法を計測
   */
  measureDecoratedText(text: DecoratedText): TextMetrics {
    let tempFont = this.ctx.font

    // 装飾に応じたフォント設定
    switch (text.type) {
      case 'b':
        this.ctx.font = `bold ${this.fontStyle}`
        break
      case 'i':
        this.ctx.font = `italic ${this.fontStyle}`
        break
    }

    const metrics = this.measureText(text.content[0])
    this.ctx.font = tempFont
    return metrics
  }

  /**
   * テキストを行に分割
   */
  splitIntoLines(content: (string | DecoratedText)[], maxWidth: number): TextLine[] {
    const lines: TextLine[] = []
    let currentLine: (string | DecoratedText)[] = []
    let currentWidth = 0

    for (const item of content) {
      if (typeof item === 'string') {
        // 通常のテキスト処理
        for (const char of item) {
          const charWidth = this.measureText(char).width

          if (currentWidth + charWidth > maxWidth && currentLine.length > 0) {
            // 行を確定
            lines.push({
              content: [...currentLine],
              width: currentWidth
            })
            currentLine = []
            currentWidth = 0
          }

          // 文字を追加
          if (currentLine.length > 0 && typeof currentLine[currentLine.length - 1] === 'string') {
            currentLine[currentLine.length - 1] += char
          } else {
            currentLine.push(char)
          }
          currentWidth += charWidth
        }
      } else {
        // 装飾テキスト処理
        const decoratedMetrics = this.measureDecoratedText(item)

        if (currentWidth + decoratedMetrics.width > maxWidth && currentLine.length > 0) {
          // 行を確定
          lines.push({
            content: [...currentLine],
            width: currentWidth
          })
          currentLine = []
          currentWidth = 0
        }

        currentLine.push(item)
        currentWidth += decoratedMetrics.width
      }
    }

    // 最後の行を追加
    if (currentLine.length > 0) {
      lines.push({
        content: currentLine,
        width: currentWidth
      })
    }

    return lines
  }

  /**
   * テキストが指定された領域に収まるかチェック
   */
  checkOverflow(content: (string | DecoratedText)[], maxWidth: number, maxHeight: number): boolean {
    const lines = this.splitIntoLines(content, maxWidth)
    const totalHeight = lines.length * this.measureText('あ').height
    return totalHeight > maxHeight
  }
}