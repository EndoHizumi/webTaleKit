// Mock browser APIs needed by ImageObject
class MockImage {
  src: string = ''
  onload: (() => void) | null = null
}

class MockCanvas {
  getContext() {
    return null
  }
}

;(global as any).Image = MockImage
;(global as any).document = {
  createElement: () => new MockCanvas(),
}

import { ScenarioManager } from '../core/scenarioManager'

describe('ScenarioManager snapshot / restore', () => {
  let sm: ScenarioManager

  beforeEach(() => {
    sm = new ScenarioManager()
  })

  test('snapshot() が現在の状態を返すこと', () => {
    const scenario = [{ type: 'text', content: ['hello'] }, { type: 'text', content: ['world'] }]
    sm.setScenario(scenario, 'scene1')
    sm.next()
    sm.setHistory('hello')

    const snap = sm.snapshot()

    expect(snap.scenario).toEqual(scenario)
    expect(snap.index).toBe(1)
    expect(snap.sceneName).toBe('scene1')
    expect(snap.history).toEqual(['hello'])
    expect(snap.progress.currentScene).toBe('scene1')
    expect(snap.progress.currentIndex).toBe(1)
  })

  test('snapshot() がディープコピーを返すこと', () => {
    const scenario = [{ type: 'text', content: ['hello'] }]
    sm.setScenario(scenario, 'scene1')
    const snap = sm.snapshot()

    // スナップショット後にオリジナルを変更してもスナップショットに影響しないこと
    scenario[0].content[0] = 'changed'
    sm.next()

    expect(snap.scenario[0].content[0]).toBe('hello')
    expect(snap.index).toBe(0)
  })

  test('restore() でスナップショット時の状態に戻ること', () => {
    const originalScenario = [
      { type: 'text', content: ['original'] },
      { type: 'text', content: ['second'] },
    ]
    sm.setScenario(originalScenario, 'main-scene')
    sm.next()
    sm.setHistory('original')

    const snap = sm.snapshot()

    // 別のシナリオを設定して進める
    sm.setScenario([{ type: 'text', content: ['sandbox'] }], 'sandbox-scene')
    sm.next()
    sm.setHistory('sandbox text')

    // 復元
    sm.restore(snap)

    expect(sm.getSceneName()).toBe('main-scene')
    expect(sm.getIndex()).toBe(1)
    expect(sm.getScenario()).toEqual(originalScenario)
    expect(sm.getHistory()).toEqual(['original'])
  })

  test('restore() 後にシナリオ実行が続行できること', () => {
    const scenario = [
      { type: 'text', content: ['A'] },
      { type: 'text', content: ['B'] },
      { type: 'text', content: ['C'] },
    ]
    sm.setScenario(scenario, 'scene1')
    sm.next() // index -> 1

    const snap = sm.snapshot()

    // sandbox
    sm.setScenario([{ type: 'text', content: ['sandbox'] }], 'sandbox')
    sm.next()

    sm.restore(snap)

    expect(sm.hasNext()).toBe(true)
    const next = sm.next()
    expect(next).toEqual({ type: 'text', content: ['B'] })
  })

  test('restore() 後のシナリオ変更がスナップショットに影響しないこと', () => {
    const scenario = [{ type: 'text', content: ['original'] }]
    sm.setScenario(scenario, 'scene1')
    const snap = sm.snapshot()

    sm.setScenario([{ type: 'text', content: ['sandbox'] }], 'sandbox')
    sm.restore(snap)

    // 復元後にシナリオを変更してもスナップショットは影響を受けない
    sm.getScenario()[0].content[0] = 'mutated'
    expect(snap.scenario[0].content[0]).toBe('original')
  })
})
