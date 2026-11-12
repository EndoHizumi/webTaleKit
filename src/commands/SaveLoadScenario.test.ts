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

// 元のシナリオ：選択肢のあとに「おわり」。選ぶと、選択肢の位置に分岐（sub: true）が差し込まれる
const ORIGINAL = [
  { type: 'text', content: ['はじめ'] },
  { type: 'choice', content: [{ type: 'item', id: 0, label: 'A', content: [] }] },
  { type: 'text', content: ['おわり'] },
]
const BRANCH = [
  { type: 'text', content: ['分岐 1'] },
  { type: 'save', slot: 1, message: false },
  { type: 'text', content: ['分岐 2'] },
]

function setup() {
  const sm = new ScenarioManager()
  const saved = new Map<string, any>()
  const core: any = {
    store: { set: (k: string, v: any) => saved.set(k, JSON.parse(JSON.stringify(v))), get: (k: string) => saved.get(k) },
    sceneConfig: { name: 'hub' },
    sceneFile: {},
    displayedImages: {},
    usedSounds: {},
    bgm: null,
    gameContainer: { clientWidth: 1280, clientHeight: 720 },
    // 本物の loadScene と同じく、元のシナリオを読み直して先頭に戻す
    loadScene: jest.fn(async (name: string) => sm.setScenario(ORIGINAL, name)),
    loadScreen: jest.fn(async () => {}),
    soundHandler: jest.fn(),
    textHandler: jest.fn(async () => {}),
  }
  const context = { core, drawer: { show: jest.fn() }, scenarioManager: sm } as unknown as ExecutionContext
  return { sm, saved, context }
}

describe('選択肢の分岐の途中でセーブ → ロード', () => {
  test('ロード後、セーブした次の行（分岐 2）から続き、その後に元の続き（おわり）が来る', async () => {
    const { sm, context } = setup()
    sm.setScenario(ORIGINAL, 'hub')
    sm.setSceneName('hub')
    sm.next() // はじめ
    sm.next() // choice
    sm.addScenario(BRANCH) // 選んだ分岐を差し込む
    sm.next() // 分岐 1
    sm.next() // save
    await new SaveHandler().execute(BRANCH[1] as any, context)

    sm.next() // 分岐 2（読み進めてからロードする）
    await new LoadHandler().execute({ type: 'load', slot: 1, message: false } as any, context)

    expect(sm.next().content).toEqual(['分岐 2'])
    expect(sm.next().content).toEqual(['おわり'])
    expect(sm.hasNext()).toBe(false)
  })

  test('scenario のない古いセーブは、元のシナリオの位置で読む（これまでどおり）', async () => {
    const { sm, saved, context } = setup()
    sm.setScenario(ORIGINAL, 'hub')
    sm.setSceneName('hub')
    sm.next()
    await new SaveHandler().execute({ type: 'save', slot: 1, message: false } as any, context)
    const old = saved.get('save_1')
    delete old.scenarioManager.scenario
    await new LoadHandler().execute({ type: 'load', slot: 1, message: false } as any, context)
    expect(sm.next().type).toBe('choice')
  })
})
