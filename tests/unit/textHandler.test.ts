import { Core } from '../../src/core/index'
import { Drawer } from '../../src/core/drawer'
import { ScenarioManager } from '../../src/core/scenarioManager'
import { TextMeasurer } from '../../src/utils/TextMeasurer'
import { ResourceManager } from '../../src/core/resourceManager'

jest.mock('../../src/core/resourceManager')
import { TextLine } from '../../src/utils/TextMeasurer'

// Core.executeCodeの型定義
declare module '../../src/core/index' {
  interface Core {
    executeCode(code: string): string | object | number | boolean;
    waitHandler(line: any): Promise<void>;
    clickWait(): Promise<void>;
    loadScreen(): Promise<void>;
    loadScene(scene: string): Promise<void>;
  }
}

jest.mock('../../src/core/drawer')
jest.mock('../../src/core/scenarioManager')
jest.mock('../../src/utils/TextMeasurer')

describe('textHandler', () => {
  let core: Core
  jest.setTimeout(5000) // タイムアウトを5秒に短縮（waitHandlerをモック化したため）

  // config.jsのモック
  jest.mock('/src/resource/config.js', () => ({}), { virtual: true })
  let mockDrawer: jest.Mocked<Drawer>
  let mockScenarioManager: jest.Mocked<ScenarioManager>
  let mockTextMeasurer: jest.Mocked<TextMeasurer>

  beforeEach(() => {
    // Core関連のメソッドをモック化
    jest.spyOn(Core.prototype, 'loadScreen').mockImplementation(async () => {});
    jest.spyOn(Core.prototype, 'waitHandler').mockImplementation(async () => {});
    jest.spyOn(Core.prototype, 'clickWait').mockImplementation(async () => {});
    jest.spyOn(Core.prototype, 'loadScene').mockImplementation(async () => {});
    jest.spyOn(Core.prototype, 'executeCode').mockImplementation((code: string) => {
      if (code.includes('userName')) return 'テストユーザー';
      if (code.includes('firstName')) return '太郎';
      if (code.includes('lastName')) return '山田';
      if (code.includes('userData')) return { id: 1, name: 'テスト' };
      return '';
    });

    // TextMeasurerのモック
    mockTextMeasurer = {
      measureText: jest.fn().mockReturnValue({ width: 100, height: 20 }),
      measureDecoratedText: jest.fn().mockReturnValue({ width: 100, height: 20 }),
      checkOverflow: jest.fn(),
      splitIntoLines: jest.fn(),
      setFont: jest.fn(),
      canvas: document.createElement('canvas'),
      ctx: document.createElement('canvas').getContext('2d'),
      fontStyle: '16px sans-serif',
      lineHeight: 1.2
    } as unknown as jest.Mocked<TextMeasurer>

    // TextMeasurerのインスタンスメソッドをモック化
    jest.spyOn(TextMeasurer.prototype, 'measureText').mockImplementation(mockTextMeasurer.measureText)
    jest.spyOn(TextMeasurer.prototype, 'measureDecoratedText').mockImplementation(mockTextMeasurer.measureDecoratedText)
    jest.spyOn(TextMeasurer.prototype, 'checkOverflow').mockImplementation(mockTextMeasurer.checkOverflow)
    jest.spyOn(TextMeasurer.prototype, 'splitIntoLines').mockImplementation(mockTextMeasurer.splitIntoLines)
    jest.spyOn(TextMeasurer.prototype, 'setFont').mockImplementation(mockTextMeasurer.setFont)

    // DOMのモック
    document.body.innerHTML = `
      <div id="gameContainer">
        <div id="messageView" style="width: 800px; height: 200px; font: 16px Arial;"></div>
      </div>
    `

    // ResourceManagerのモック
    const mockResourceManager = {
      addResource: jest.fn(),
      getResourcePath: jest.fn()
    }
    jest.spyOn(ResourceManager.prototype, 'addResource').mockImplementation(mockResourceManager.addResource)
    jest.spyOn(ResourceManager.prototype, 'getResourcePath').mockImplementation(mockResourceManager.getResourcePath)

    // モックのリセット
    jest.clearAllMocks()

    // Coreインスタンスの作成
    core = new Core()
    mockDrawer = core.drawer as jest.Mocked<Drawer>
    mockScenarioManager = core.scenarioManager as jest.Mocked<ScenarioManager>
    mockTextMeasurer = core.textMeasurer as jest.Mocked<TextMeasurer>
  })

  describe('基本的なテキスト処理', () => {
    describe('文字列入力の処理', () => {
      it('単一の文字列を配列に変換して処理すること', async () => {
        const input = 'こんにちは'
        
        await core.textHandler(input)

        expect(mockDrawer.drawText).toHaveBeenCalledWith(
          'こんにちは',
          25
        )
      })
    })

    describe('配列入力の処理', () => {
      it('配列形式の入力を正しく処理すること', async () => {
        const input = { content: ['テスト1', 'テスト2'] }
        
        await core.textHandler(input)

        expect(mockDrawer.drawText).toHaveBeenCalledTimes(2)
        expect(mockDrawer.drawText).toHaveBeenNthCalledWith(1, 'テスト1', 25)
        expect(mockDrawer.drawText).toHaveBeenNthCalledWith(2, 'テスト2', 25)
      })
    })

    describe('HTTPレスポンスの処理', () => {
      it('thenプロパティのテキストを追加すること', async () => {
        const input = {
          content: ['基本テキスト'],
          then: ['追加テキスト']
        }
        
        await core.textHandler(input)

        expect(mockDrawer.drawText).toHaveBeenCalledTimes(2)
        expect(mockDrawer.drawText).toHaveBeenNthCalledWith(1, '基本テキスト', 25)
        expect(mockDrawer.drawText).toHaveBeenNthCalledWith(2, '追加テキスト', 25)
      })

      it('errorプロパティのテキストを追加すること', async () => {
        const input = {
          content: ['基本テキスト'],
          error: ['エラーテキスト']
        }
        
        await core.textHandler(input)

        expect(mockDrawer.drawText).toHaveBeenCalledTimes(2)
        expect(mockDrawer.drawText).toHaveBeenNthCalledWith(1, '基本テキスト', 25)
        expect(mockDrawer.drawText).toHaveBeenNthCalledWith(2, 'エラーテキスト', 25)
      })
    })
  })

  describe('変数展開機能', () => {

    it('{{}}で囲まれた変数を正しく展開すること', async () => {
      const input = { content: ['名前は{{userName}}です'] }
      
      await core.textHandler(input)

      expect(mockDrawer.drawText).toHaveBeenCalledWith(
        '名前はテストユーザーです',
        25
      )
    })

    it('複数の変数を展開できること', async () => {
      const input = { content: ['{{firstName}} {{lastName}}さん'] }
      
      await core.textHandler(input)

      expect(mockDrawer.drawText).toHaveBeenCalledWith(
        '太郎 山田さん',
        25
      )
    })

    it('オブジェクト型の変数をJSON文字列として展開すること', async () => {
      const input = { content: ['データ: {{userData}}'] }
      
      await core.textHandler(input)

      expect(mockDrawer.drawText).toHaveBeenCalledWith(
        'データ: {"id":1,"name":"テスト"}',
        25
      )
    })
  })

  describe('メッセージボックス制御', () => {
    describe('テキストオーバーフロー検出', () => {
      it('テキストが表示領域を超える場合に検出すること', async () => {
        mockTextMeasurer.checkOverflow.mockReturnValue(true)
        mockTextMeasurer.splitIntoLines.mockReturnValue([
          { content: ['短いテキスト'], width: 100 },
          { content: ['次の行'], width: 80 }
        ])
        
        const input = { content: ['長いテキスト...'] }
        await core.textHandler(input)

        expect(mockTextMeasurer.checkOverflow).toHaveBeenCalled()
        expect(mockScenarioManager.addScenario).toHaveBeenCalled()
      })

      it('テキストが表示領域内の場合に検出しないこと', async () => {
        mockTextMeasurer.checkOverflow.mockReturnValue(false)
        
        const input = { content: ['短いテキスト'] }
        await core.textHandler(input)

        expect(mockTextMeasurer.checkOverflow).toHaveBeenCalled()
        expect(mockScenarioManager.addScenario).not.toHaveBeenCalled()
      })
    })

    describe('テキスト分割処理', () => {

      it('長いテキストを適切に分割すること', async () => {
        mockTextMeasurer.checkOverflow.mockReturnValue(true);
        mockTextMeasurer.splitIntoLines.mockReturnValue([
          { content: ['1', '行', '目'], width: 100 },
          { content: ['2', '行', '目'], width: 100 },
          { content: ['3', '行', '目'], width: 100 }
        ] as TextLine[]);
        mockTextMeasurer.measureText.mockReturnValue({ width: 100, height: 20 });
        
        const input = { content: ['表示領域を超える長いテキスト...'] };
        await core.textHandler(input);

        // 最初の2行が表示され、3行目が次のシナリオに追加される
        expect(mockDrawer.drawText).toHaveBeenCalledWith('1行目', 25);
        expect(mockDrawer.drawText).toHaveBeenCalledWith('2行目', 25);
        expect(mockScenarioManager.addScenario).toHaveBeenCalledWith(
          [{ type: 'text', content: ['3行目'], speed: undefined }],
          expect.any(Number)
        );
      })

      it('分割されたテキストが正しい速度で表示されること', async () => {
        mockTextMeasurer.checkOverflow.mockReturnValue(true);
        mockTextMeasurer.splitIntoLines.mockReturnValue([
          { content: ['1', '行', '目'], width: 100 },
          { content: ['2', '行', '目'], width: 100 }
        ] as TextLine[]);
        mockTextMeasurer.measureText.mockReturnValue({ width: 100, height: 20 });
        
        const input = {
          content: ['長いテキスト...'],
          speed: 50
        };
        await core.textHandler(input);

        // 最初の行が表示され、2行目が次のシナリオに追加される
        expect(mockDrawer.drawText).toHaveBeenCalledWith('1行目', 50);
        expect(mockScenarioManager.addScenario).toHaveBeenCalledWith(
          [{ type: 'text', content: ['2行目'], speed: 50 }],
          expect.any(Number)
        );
      })
    })
  })

  describe('テキスト表示制御', () => {
    describe('名前表示', () => {
      it('名前が指定された場合に表示すること', async () => {
        const input = {
          content: ['テキスト'],
          name: 'キャラクター名'
        }
        
        await core.textHandler(input)

        expect(mockDrawer.drawName).toHaveBeenCalledWith('キャラクター名')
      })

      it('名前が指定されない場合に空文字を表示すること', async () => {
        const input = { content: ['テキスト'] }
        
        await core.textHandler(input)

        expect(mockDrawer.drawName).toHaveBeenCalledWith('')
      })
    })

    describe('テキスト表示速度', () => {
      it('指定された速度でテキストを表示すること', async () => {
        const input = {
          content: ['テキスト'],
          speed: 50
        }
        
        await core.textHandler(input)

        expect(mockDrawer.drawText).toHaveBeenCalledWith('テキスト', 50)
        })

      it('速度指定がない場合にデフォルト速度を使用すること', async () => {
        const input = { content: ['テキスト'] }
        
        await core.textHandler(input)

        expect(mockDrawer.drawText).toHaveBeenCalledWith('テキスト', 25)
        })
    })

    describe('装飾要素の処理', () => {
      it('改行タグを正しく処理すること', async () => {
        const input = {
          content: ['テキスト', { type: 'br' }, '次の行']
        }
        
        await core.textHandler(input)

        expect(mockDrawer.drawLineBreak).toHaveBeenCalled()
        expect(mockDrawer.drawText).toHaveBeenCalledTimes(2)
      })

      it('待機タグを正しく処理すること', async () => {
        const input = {
          content: ['テキスト', { type: 'wait', time: 1000 }, '次のテキスト']
        }
        
        await core.textHandler(input)

        // waitHandlerが呼ばれることを確認
        expect(mockDrawer.drawText).toHaveBeenCalledTimes(2)
      })

      it('装飾付きテキストを正しく処理すること', async () => {
        const mockContainer = document.createElement('div')
        mockDrawer.createDecoratedElement.mockReturnValue(mockContainer)

        const input = {
          content: [{
            type: 'decorated',
            content: ['装飾テキスト'],
            speed: 30
          }]
        }
        
        await core.textHandler(input)

        expect(mockDrawer.createDecoratedElement).toHaveBeenCalled()
        expect(mockDrawer.drawText).toHaveBeenCalledWith(
          '装飾テキスト',
          30,
          mockContainer
        )
      })
    })
  })

  describe('履歴管理', () => {
    it('表示したテキストを履歴に保存すること', async () => {
      const input = { content: ['テキスト1', 'テキスト2'] }
      
      await core.textHandler(input)

      expect(mockScenarioManager.setHistory).toHaveBeenCalledWith(['テキスト1', 'テキスト2'])
    })
  })
})