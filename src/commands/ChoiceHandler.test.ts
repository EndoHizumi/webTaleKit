import { ChoiceHandler } from './ChoiceHandler'
import { ExecutionContext } from '../core/CommandRegistry'

/** シーン変数 vars を見て if 式を評価する、最小限の Core の代わり */
function makeContext(vars: Record<string, any>, pick: (shown: any) => any) {
  const shownList: any[] = []
  const history: any[] = []
  const added: any[] = []
  const core: any = {
    textHandler: jest.fn(),
    expandVariable: (text: any) => text,
    executeCode: (code: string) => new Function(...Object.keys(vars), code)(...Object.values(vars)),
    isNext: true,
  }
  const eventBus: any = {
    emit: async (_event: string, data: any) => {
      shownList.push(data)
      return [pick(data)]
    },
  }
  const scenarioManager: any = {
    addScenario: (s: any) => added.push(s),
    setHistory: (h: any) => history.push(h),
  }
  const context = { core, eventBus, scenarioManager } as unknown as ExecutionContext
  return { context, shownList, history, added }
}

const choiceLine = () => ({
  type: 'choice',
  content: [
    { type: 'item', id: 0, label: 'アイテムを使う', if: 'hasItem', content: [{ type: 'text', content: ['使った'] }] },
    { type: 'item', id: 1, label: '魔法を使う', if: 'mp >= 10', content: [{ type: 'text', content: ['唱えた'] }] },
    { type: 'item', id: 2, label: 'やめる', content: [{ type: 'text', content: ['やめた'] }] },
  ],
})

describe('ChoiceHandler の <item if>', () => {
  it('条件が false の項目は表示しない', async () => {
    const line = choiceLine()
    const { context, shownList } = makeContext({ hasItem: false, mp: 12 }, (shown) => ({ selectId: shown.content[0].id, onSelect: shown.content[0].content }))
    await new ChoiceHandler().execute(line as any, context)
    expect(shownList[0].content.map((c: any) => c.label)).toEqual(['魔法を使う', 'やめる'])
  })

  it('if のない項目と、条件が true の項目はすべて表示する', async () => {
    const { context, shownList } = makeContext({ hasItem: true, mp: 20 }, (shown) => ({ selectId: shown.content[0].id, onSelect: shown.content[0].content }))
    await new ChoiceHandler().execute(choiceLine() as any, context)
    expect(shownList[0].content).toHaveLength(3)
  })

  it('元の選択肢は書き換えず、次に実行したときはそのときの条件で選び直す', async () => {
    const line = choiceLine()
    const vars = { hasItem: false, mp: 0 }
    const first = makeContext(vars, (shown) => ({ selectId: shown.content[0].id, onSelect: shown.content[0].content }))
    await new ChoiceHandler().execute(line as any, first.context)
    expect(first.shownList[0].content.map((c: any) => c.label)).toEqual(['やめる'])
    expect(line.content).toHaveLength(3)

    vars.hasItem = true
    const second = makeContext(vars, (shown) => ({ selectId: shown.content[0].id, onSelect: shown.content[0].content }))
    await new ChoiceHandler().execute(line as any, second.context)
    expect(second.shownList[0].content.map((c: any) => c.label)).toEqual(['アイテムを使う', 'やめる'])
  })

  it('項目を除いても、選んだ項目の中身と id を返す', async () => {
    const { context, history, added } = makeContext({ hasItem: false, mp: 0 }, (shown) => {
      const item = shown.content.find((c: any) => c.label === 'やめる')
      return { selectId: item.id, onSelect: item.content }
    })
    const line = choiceLine()
    await new ChoiceHandler().execute(line as any, context)
    expect(added[0]).toEqual([{ type: 'text', content: ['やめた'] }])
    expect(history[0].line).toBe(line)
  })
})
