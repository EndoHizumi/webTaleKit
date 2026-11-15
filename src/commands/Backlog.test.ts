// ScenarioManager が作る ImageObject のために、ブラウザの Image と document を置き換える
class MockImage {
  src: string = ''
  onload: (() => void) | null = null
}
;(global as any).Image = MockImage
;(global as any).document = { createElement: () => ({ getContext: () => null }) }

import { TextHandler } from './TextHandler'
import { ScenarioManager, BACKLOG_MAX } from '../core/scenarioManager'
import { ExecutionContext } from '../core/CommandRegistry'
import { toPlainText } from '../utils/plainText'

// TextHandler を動かす最小の Core（表示とクリック待ちはしない）
function setup(vars: Record<string, any> = {}) {
  const sm = new ScenarioManager()
  const core: any = {
    isSkip: false,
    expandVariable: (t: any) => (typeof t === 'string' ? t.replace(/{{([^{}]+)}}/g, (_m: string, k: string) => String(vars[k.trim()])) : t),
    waitHandler: jest.fn(async () => {}),
  }
  const context = {
    core,
    eventBus: { emit: jest.fn(async () => {}) },
    drawer: { isSkip: false },
    scenarioManager: sm,
  } as unknown as ExecutionContext
  return { sm, context }
}

describe('ログ（読み返し）', () => {
  test('地の文と台詞を、表示した順に名前つきで残す。{{…}} は展開し、タグは除く', async () => {
    const { sm, context } = setup({ day: 3 })
    const h = new TextHandler()
    await h.execute({ type: 'text', content: ['{{day}} 日目の朝。<br>宿の部屋で考える。'] } as any, context)
    await h.execute({ type: 'text', name: 'コルネイユ', content: ['<b>遅いぞ</b>。'] } as any, context)
    expect(sm.getBacklog()).toEqual([
      { name: '', text: '3 日目の朝。\n宿の部屋で考える。' },
      { name: 'コルネイユ', text: '遅いぞ。' },
    ])
  })

  test('文を出す前（文字送りやクリック待ちのあいだ）に、もうログに入っている', async () => {
    const { sm, context } = setup()
    const seen: number[] = []
    ;(context as any).eventBus.emit = jest.fn(async (name: string) => {
      if (name === 'text:show') seen.push(sm.getBacklog().length)
    })
    ;(context as any).core.waitHandler = jest.fn(async () => {
      seen.push(sm.getBacklog().length)
    })
    await new TextHandler().execute({ type: 'text', content: ['いまの文'] } as any, context)
    expect(seen).toEqual([1, 1])
  })

  test('log: false の文（エンジン自身の案内）は残さない', async () => {
    const { sm, context } = setup()
    await new TextHandler().execute({ type: 'text', content: ['ゲームをセーブしました: セーブ1'], log: false } as any, context)
    expect(sm.getBacklog()).toEqual([])
  })

  test('上限を超えたら古いものから捨てる', () => {
    const sm = new ScenarioManager()
    for (let i = 0; i < BACKLOG_MAX + 5; i++) sm.addBacklog({ name: '', text: `文${i}` })
    const log = sm.getBacklog()
    expect(log.length).toBe(BACKLOG_MAX)
    expect(log[0].text).toBe('文5')
  })

  test('snapshot / restore でログも戻る。backlog の無い古いスナップショットなら空になる', () => {
    const sm = new ScenarioManager()
    sm.setScenario([], 'hub')
    sm.addBacklog({ name: 'A', text: 'はじめ' })
    const snap = sm.snapshot()
    sm.addBacklog({ name: 'A', text: 'つぎ' })
    sm.restore(snap)
    expect(sm.getBacklog()).toEqual([{ name: 'A', text: 'はじめ' }])
    const { backlog, ...old } = snap
    sm.restore(old as any)
    expect(sm.getBacklog()).toEqual([])
  })
})

describe('toPlainText', () => {
  test('入れ子の要素もたどる。展開で例外が出たら、その文字列はそのまま残す', () => {
    const expand = (t: string) => {
      if (t.includes('{{boom}}')) throw new Error('x')
      return t
    }
    expect(toPlainText(['a', { content: ['b', { content: ['c'] }] }, null], expand)).toBe('abc')
    expect(toPlainText(['{{boom}}'], expand)).toBe('{{boom}}')
  })
})
