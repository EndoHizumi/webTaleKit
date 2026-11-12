// Mock browser APIs needed by ImageObject（ScenarioManager 経由で読み込まれる）
class MockImage {
  src: string = ''
  onload: (() => void) | null = null
}
;(global as any).Image = MockImage
;(global as any).document = {
  createElement: () => ({ getContext: () => null }),
}

import { JumpHandler } from './JumpHandler'
import { LabelHandler } from './LabelHandler'
import { ScenarioManager } from '../core/scenarioManager'
import { ExecutionContext } from '../core/CommandRegistry'
import { validateScenarioObjects } from '../utils/validateScenario'

const t = (s: string) => ({ type: 'text', content: [s] })

function run(sm: ScenarioManager, line: any) {
  new JumpHandler().execute(line, { scenarioManager: sm } as unknown as ExecutionContext)
}

describe('<jump to="…"> と <label name="…">', () => {
  let sm: ScenarioManager
  beforeEach(() => {
    sm = new ScenarioManager()
  })

  test('<label> は実行しても何もしない', () => {
    expect(() => new LabelHandler().execute()).not.toThrow()
  })

  test('前方のラベルへ飛べる（一度も通っていなくてよい）', () => {
    sm.setScenario([t('a'), { type: 'jump', to: 'end' }, t('とばす'), { type: 'label', name: 'end' }, t('ここ')], 's')
    sm.next()
    sm.next() // jump
    run(sm, { type: 'jump', to: 'end' })
    expect(sm.next().type).toBe('label')
    expect(sm.next().content).toEqual(['ここ'])
  })

  test('後ろのラベルへ戻ると、選択肢で差し込まれた分岐は取り除かれる（ループで分岐が積み重ならない）', () => {
    const base = [{ type: 'label', name: 'turn' }, { type: 'choice', content: [] }, { type: 'jump', to: 'turn' }]
    sm.setScenario(base, 's')
    for (let round = 0; round < 3; round++) {
      sm.next() // label
      sm.next() // choice
      sm.addScenario([t(`分岐${round}`)]) // 選んだ分岐
      sm.next() // 分岐
      sm.next() // jump
      run(sm, { type: 'jump', to: 'turn' })
      expect(sm.getIndex()).toBe(0)
      expect(sm.getScenario()).toHaveLength(base.length)
    }
  })

  test('分岐が差し込まれて行がずれていても、ラベルの今の位置へ飛ぶ', () => {
    sm.setScenario([{ type: 'choice', content: [] }, { type: 'label', name: 'after' }, t('後')], 's')
    sm.next() // choice
    sm.addScenario([t('分岐1'), t('分岐2'), { type: 'jump', to: 'after' }])
    sm.next()
    sm.next()
    sm.next() // jump（この時点でラベルは 4 行目にずれている）
    run(sm, { type: 'jump', to: 'after' })
    expect(sm.next()).toMatchObject({ type: 'label', name: 'after' })
    expect(sm.next().content).toEqual(['後'])
  })

  test('同じ名前なら、元のシナリオの行を優先する', () => {
    sm.setScenario([{ type: 'label', name: 'x' }, t('元'), { type: 'choice', content: [] }], 's')
    sm.next()
    sm.next()
    sm.next() // choice
    sm.addScenario([{ type: 'label', name: 'x' }, t('分岐')])
    run(sm, { type: 'jump', to: 'x' })
    expect(sm.getIndex()).toBe(0)
  })

  test('選択肢の中のラベルへは前方なら飛べる', () => {
    sm.setScenario([{ type: 'choice', content: [] }, t('後')], 's')
    sm.next()
    sm.addScenario([{ type: 'jump', to: 'in' }, t('とばす'), { type: 'label', name: 'in' }, t('分岐の中')])
    sm.next() // jump
    run(sm, { type: 'jump', to: 'in' })
    expect(sm.next()).toMatchObject({ type: 'label', name: 'in' })
    expect(sm.next().content).toEqual(['分岐の中'])
  })

  test('選択肢の中のラベルへ後ろ向きには飛べず、わかるエラーになる', () => {
    sm.setScenario([{ type: 'choice', content: [] }, t('後')], 's')
    sm.next()
    sm.addScenario([{ type: 'label', name: 'in' }, t('分岐'), { type: 'jump', to: 'in' }])
    sm.next()
    sm.next()
    sm.next() // jump
    expect(() => run(sm, { type: 'jump', to: 'in' })).toThrow(/選択肢の中のラベル「in」へは戻れません/)
  })

  test('ないラベルへはわかるエラーになる', () => {
    sm.setScenario([t('a')], 's')
    expect(() => run(sm, { type: 'jump', to: 'nothing' })).toThrow(/ラベル「nothing」が見つかりません/)
  })

  test('index を指定したときは、これまでどおり行番号で飛ぶ', () => {
    sm.setScenario([t('0'), t('1'), t('2')], 's')
    run(sm, { type: 'jump', index: 2 })
    expect(sm.next().content).toEqual(['2'])
  })
})

describe('validateScenarioObjects', () => {
  const commands = { text: () => {}, jump: () => {}, label: () => {}, choice: () => {} }
  test('飛び先のラベルがなければ警告する（選択肢の中のラベルも数える）', () => {
    const ok = validateScenarioObjects(
      [{ type: 'choice', content: [{ type: 'item', label: 'A', content: [{ type: 'label', name: 'in' }] }] }, { type: 'jump', to: 'in' }],
      commands as any,
    )
    expect(ok.warnings.filter((w: any) => w.type === 'jump')).toHaveLength(0)
    const ng = validateScenarioObjects([{ type: 'jump', to: 'nothing' }], commands as any)
    expect(ng.warnings.some((w: any) => /ラベル「nothing」がありません/.test(w.message))).toBe(true)
  })
})
