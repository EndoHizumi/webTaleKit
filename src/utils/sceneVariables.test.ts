// Mock browser APIs needed by ImageObject（LoadHandler が読み込む）
class MockImage {
  src: string = ''
  onload: (() => void) | null = null
}
;(global as any).Image = MockImage
;(global as any).document = {
  createElement: () => ({ getContext: () => null }),
}

import { captureSceneVariables, restoreSceneVariables } from './sceneVariables'
import { SaveHandler } from '../commands/SaveHandler'
import { LoadHandler } from '../commands/LoadHandler'
import { ScenarioManager } from '../core/scenarioManager'
import { ExecutionContext } from '../core/CommandRegistry'

class Thing {
  x = 1
}

describe('captureSceneVariables', () => {
  test('JSON にできる値だけを写しで返す（関数・インスタンス・scenario・sceneConfig は除く）', () => {
    const G = { day: 3, items: { potion: 1 }, list: [1, 2] }
    const sceneFile = {
      scenario: [{ type: 'text' }],
      sceneConfig: { name: 's' },
      G,
      count: 5,
      name: 'a',
      flag: false,
      none: null,
      fn: () => 1,
      inst: new Thing(),
      nan: NaN,
    }
    const out = captureSceneVariables(sceneFile)
    expect(out).toEqual({ G: { day: 3, items: { potion: 1 }, list: [1, 2] }, count: 5, name: 'a', flag: false, none: null })
    expect(out.G).not.toBe(G)
  })

  test('循環参照のある値は保存しない', () => {
    const a: any = { v: 1 }
    a.self = a
    expect(captureSceneVariables({ a, b: 2 })).toEqual({ b: 2 })
  })

  test('同じ値を 2 か所で使っていても（循環でなければ）保存する', () => {
    const shared = { n: 1 }
    expect(captureSceneVariables({ pair: [shared, shared] })).toEqual({ pair: [{ n: 1 }, { n: 1 }] })
  })
})

describe('restoreSceneVariables', () => {
  test('オブジェクトと配列は参照を保ったまま中身を入れ替える', () => {
    const G = { day: 1, gold: 80, old: true }
    const list = [9]
    const sceneFile: any = { G, list, count: 0 }
    restoreSceneVariables(sceneFile, { G: { day: 5, gold: 300 }, list: [1, 2, 3], count: 7 })
    expect(sceneFile.G).toBe(G)
    expect(G).toEqual({ day: 5, gold: 300 })
    expect(sceneFile.list).toBe(list)
    expect(list).toEqual([1, 2, 3])
    expect(sceneFile.count).toBe(7)
  })

  test('関数を値で上書きしない・保存がなければ何もしない', () => {
    const fn = () => 1
    const sceneFile: any = { fn, count: 1 }
    restoreSceneVariables(sceneFile, { fn: 3 })
    expect(sceneFile.fn).toBe(fn)
    restoreSceneVariables(sceneFile, undefined)
    expect(sceneFile.count).toBe(1)
  })
})

describe('セーブ → 変数を変える → ロード で、シーン変数が保存時の値に戻る', () => {
  // ゲームの状態を別モジュールの export const G に置いている想定（シーンは同じオブジェクトを参照する）
  const G = { day: 1, affection: 30, items: { potion: 1 } }
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
    // 本物の loadScene と同じく、シーン変数を初期値に戻す（G はモジュールの同じオブジェクト）
    loadScene: jest.fn(async () => {
      core.sceneFile = { G, count: 0, scenario: [{ type: 'text', content: ['x'] }] }
      sm.setScenario(core.sceneFile.scenario, 'hub')
    }),
    loadScreen: jest.fn(async () => {}),
    soundHandler: jest.fn(),
    textHandler: jest.fn(async () => {}),
  }
  const context = { core, drawer: { show: jest.fn() }, scenarioManager: sm } as unknown as ExecutionContext

  test('往復', async () => {
    await core.loadScene('hub')
    sm.setSceneName('hub')
    G.day = 4
    G.affection = 55
    G.items.potion = 3
    core.sceneFile.count = 2
    await new SaveHandler().execute({ type: 'save', slot: 1, message: false } as any, context)

    G.day = 9
    G.affection = 0
    G.items.potion = 0
    core.sceneFile.count = 99
    await new LoadHandler().execute({ type: 'load', slot: 1, message: false } as any, context)

    expect(G).toEqual({ day: 4, affection: 55, items: { potion: 3 } })
    expect(core.sceneFile.G).toBe(G)
    expect(core.sceneFile.count).toBe(2)
  })

  test('sceneVariables のない古いセーブを読んでも、エラーにならず初期値のまま', async () => {
    const old = saved.get('save_1')
    delete old.sceneVariables
    saved.set('save_old', old)
    G.day = 7
    await new LoadHandler().execute({ type: 'load', slot: 'old', message: false } as any, context)
    expect(G.day).toBe(7)
    expect(core.sceneFile.count).toBe(0)
  })
})
