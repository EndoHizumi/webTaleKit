// Mock browser APIs needed by ImageObject（LoadHandler が読み込む）
class MockImage {
  src: string = ''
  onload: (() => void) | null = null
}
;(global as any).Image = MockImage
;(global as any).document = {
  createElement: () => ({ getContext: () => null }),
}

import { SaveHandler } from './SaveHandler'
import { LoadHandler } from './LoadHandler'
import { ScenarioManager } from '../core/scenarioManager'
import { ExecutionContext } from '../core/CommandRegistry'

/** セーブ・ロードに必要な分だけの Core の代わり（store はメモリ上） */
function makeContext(sm: ScenarioManager) {
  const saved = new Map<string, any>()
  const core: any = {
    store: {
      set: (k: string, v: any) => saved.set(k, JSON.parse(JSON.stringify(v))),
      get: (k: string) => saved.get(k),
    },
    sceneConfig: { name: 'scene1' },
    displayedImages: {},
    usedSounds: {},
    bgm: null,
    gameContainer: { clientWidth: 1280, clientHeight: 720 },
    loadScene: jest.fn(async () => {}),
    loadScreen: jest.fn(async () => {}),
    soundHandler: jest.fn(),
    textHandler: jest.fn(async () => {}),
  }
  const drawer: any = { show: jest.fn() }
  return { core, drawer, scenarioManager: sm } as unknown as ExecutionContext
}

describe('LoadHandler の履歴の復元（#242）', () => {
  let sm: ScenarioManager
  let context: ExecutionContext

  beforeEach(() => {
    sm = new ScenarioManager()
    sm.setScenario([{ type: 'text', content: ['a'] }, { type: 'text', content: ['b'] }], 'scene1')
    sm.setSceneName('scene1')
    context = makeContext(sm)
  })

  test('ロード後の履歴は、保存時の履歴と同じ配列になる（ロード前の項目は残らない）', async () => {
    sm.setHistory('a')
    sm.setHistory(['b-1', 'b-2']) // 履歴の 1 件が配列でもよい
    await new SaveHandler().execute({ type: 'save', slot: 1, message: false } as any, context)

    sm.setHistory('ロード前の項目')
    await new LoadHandler().execute({ type: 'load', slot: 1, message: false } as any, context)

    expect(sm.getHistory()).toEqual(['a', ['b-1', 'b-2']])
  })

  test('空の履歴を保存してロードすると、空になる', async () => {
    await new SaveHandler().execute({ type: 'save', slot: 1, message: false } as any, context)
    sm.setHistory('ロード前の項目')
    await new LoadHandler().execute({ type: 'load', slot: 1, message: false } as any, context)
    expect(sm.getHistory()).toEqual([])
  })

  test('同じセーブを何度ロードしても、履歴は増えない', async () => {
    sm.setHistory('a')
    await new SaveHandler().execute({ type: 'save', slot: 1, message: false } as any, context)
    for (let i = 0; i < 3; i++) await new LoadHandler().execute({ type: 'load', slot: 1, message: false } as any, context)
    expect(sm.getHistory()).toEqual(['a'])
  })

  test('セーブ → ロード → 再セーブで、保存される履歴が一致する', async () => {
    sm.setHistory('a')
    sm.setHistory('b')
    const { core } = context as any
    await new SaveHandler().execute({ type: 'save', slot: 1, message: false } as any, context)
    await new LoadHandler().execute({ type: 'load', slot: 1, message: false } as any, context)
    await new SaveHandler().execute({ type: 'save', slot: 2, message: false } as any, context)
    expect(core.store.get('save_2').scenarioManager.history).toEqual(core.store.get('save_1').scenarioManager.history)
  })
})
