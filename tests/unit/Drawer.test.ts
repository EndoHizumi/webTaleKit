import { Drawer } from '../../src/core/drawer'
import { TextMeasurer } from '../../src/utils/TextMeasurer'
import { sleep } from '../../src/utils/waitUtil'

describe('Drawer', () => {
  let drawer: Drawer
  let container: HTMLElement
  let messageView: HTMLElement
  let nameView: HTMLElement
  let interactiveView: HTMLElement

  beforeEach(() => {
    // テスト用のDOM要素を作成
    container = document.createElement('div')
    container.id = 'gameContainer'
    
    const messageWindow = document.createElement('div')
    messageWindow.id = 'messageWindow'
    
    messageView = document.createElement('p')
    messageView.id = 'messageView'
    messageWindow.appendChild(messageView)
    
    nameView = document.createElement('div')
    nameView.id = 'nameView'
    messageWindow.appendChild(nameView)
    
    interactiveView = document.createElement('div')
    interactiveView.id = 'interactiveView'
    container.appendChild(interactiveView)
    
    container.appendChild(messageWindow)
    document.body.appendChild(container)
    
    // Drawerインスタンスを作成
    drawer = new Drawer(container)
    drawer.setScreen(messageWindow, { width: 800, height: 600 })
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  describe('drawText', () => {
    it('通常のテキストを正しく表示できること', async () => {
      const text = 'テストテキスト'
      await drawer.drawText(text, 0)
      
      expect(messageView.textContent).toContain(text)
    })

    it('長いテキストを適切に改行して表示できること', async () => {
      const longText = '這は非常に長いテキストで、自動的に改行される必要があります。表示領域を超えた場合は適切に処理されます。'
      await drawer.drawText(longText, 0)
      
      const lines = messageView.innerHTML.split('<br>')
      expect(lines.length).toBeGreaterThan(1)
    })

    it('装飾テキストを正しく表示できること', async () => {
      const decoratedElement = drawer.createDecoratedElement({
        type: 'color',
        content: ['色付きテキスト'],
        value: 'red'
      })
      
      await drawer.drawText('色付きテキスト', 0, decoratedElement)
      
      expect(messageView.innerHTML).toContain('<span')
      expect(messageView.innerHTML).toContain('style="color: red;')
    }, 10000)
  })

  describe('createDecoratedElement', () => {
    it('色付きテキスト要素を作成できること', () => {
      const element = drawer.createDecoratedElement({
        type: 'color',
        content: ['テスト'],
        value: 'blue'
      })
      
      expect(element.tagName.toLowerCase()).toBe('span')
      expect(element.style.color).toBe('blue')
    })

    it('太字テキスト要素を作成できること', () => {
      const element = drawer.createDecoratedElement({
        type: 'b',
        content: ['テスト']
      })
      
      expect(element.tagName.toLowerCase()).toBe('strong')
    })

    it('ルビ付きテキスト要素を作成できること', () => {
      const element = drawer.createDecoratedElement({
        type: 'ruby',
        content: ['漢字'],
        text: 'かんじ'
      })
      
      expect(element.tagName.toLowerCase()).toBe('ruby')
      expect(element.querySelector('rt')?.textContent).toBe('かんじ')
    })
  })

  describe('テキストオーバーフロー処理', () => {
    it('テキストが表示領域を超えた場合に警告ログを出力すること', async () => {
      const consoleSpy = jest.spyOn(console, 'warn')
      const longText = '非常に長いテキスト。'.repeat(10) // テキストの長さを短縮
      
      // メッセージボックスのサイズを小さく設定
      messageView.style.height = '50px'
      messageView.style.width = '100px'
      
      // 待機時間を0に設定して高速に実行
      await drawer.drawText(longText, 0)
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Text overflow detected'))
    }, 20000) // タイムアウトを20秒に設定
  })

  describe('スキップ機能', () => {
    it('スキップ時に残りのテキストが即座に表示されること', async () => {
      const text = 'スキップテスト用テキスト'
      
      // スキップ処理を実行
      const drawPromise = drawer.drawText(text, 50) // 待機時間を短縮
      await sleep(25) // スキップ前の待機時間を短縮
      
      // スキップをトリガー
      drawer.isSkip = true
      drawer.readySkip = true
      
      await drawPromise
      
      // テキストが完全に表示されるまで少し待機
      await sleep(25) // 待機時間を短縮
      
      // 末尾の改行を除去して比較
      expect(messageView.textContent?.trim().replace(/\n/g, '')).toBe(text)
    }, 20000) // タイムアウトを20秒に設定
  })
})