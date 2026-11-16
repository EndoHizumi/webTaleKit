// <dialog> の <action if="…">：条件が false のボタンは出さない。元のシナリオは書き換えない
import { DialogHandler } from './DialogHandler'
import { EventBus } from '../utils/eventBus'

const run = async (line: any, vars: Record<string, any>) => {
  const eventBus = new EventBus()
  let shown: any = null
  eventBus.on('dialog:show', (data: any) => void (shown = data))
  const core: any = {
    loadScreen: async () => {},
    expandVariable: (t: any) => t,
    executeCode: (code: string) => new Function(...Object.keys(vars), code)(...Object.values(vars)),
  }
  await new DialogHandler().execute(line, { core, eventBus, scenarioManager: { addScenario: () => {} } } as any)
  return shown
}

const line = () => ({
  type: 'dialog',
  name: 'day',
  template: './day.html',
  content: [
    { type: 'prompt', content: ['今日はどうする？'] },
    {
      type: 'actions',
      content: [
        { type: 'action', id: 'guild', label: 'ギルド', content: [] },
        { type: 'action', id: 'inn', label: '宿', if: 'fallen', content: [] },
        { type: 'action', id: 'gift', label: '贈り物', if: 'gifts > 0', content: [] },
      ],
    },
  ],
})

describe('DialogHandler の <action if>', () => {
  test('条件が false の action は渡さず、元の行はそのまま残す', async () => {
    const l = line()
    const shown = await run(l, { fallen: false, gifts: 1 })
    expect(shown.content[1].content.map((a: any) => a.id)).toEqual(['guild', 'gift'])
    expect(l.content[1].content.map((a: any) => a.id)).toEqual(['guild', 'inn', 'gift'])
  })

  test('開き直すたびに、そのときの条件で選び直す', async () => {
    const l = line()
    expect((await run(l, { fallen: true, gifts: 0 })).content[1].content.map((a: any) => a.id)).toEqual(['guild', 'inn'])
    expect((await run(l, { fallen: false, gifts: 2 })).content[1].content.map((a: any) => a.id)).toEqual(['guild', 'gift'])
  })
})
