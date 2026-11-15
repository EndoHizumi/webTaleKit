import { SaveHandler } from './SaveHandler'
import { ExecutionContext } from '../core/CommandRegistry'

function setup(sceneFile: any) {
  const saved = new Map<string, any>()
  const core: any = {
    store: { set: (k: string, v: any) => saved.set(k, JSON.parse(JSON.stringify(v))) },
    sceneConfig: { name: 'hub' },
    sceneFile,
    displayedImages: {},
    usedSounds: {},
    bgm: null,
    expandVariable: (t: string) => t.replace('{{gold}}', '120'),
    textHandler: jest.fn(async () => {}),
  }
  const scenarioManager: any = {
    progress: { currentIndex: 3 },
    getSceneName: () => 'hub',
    getIndex: () => 3,
    getHistory: () => [],
  }
  const context = { core, scenarioManager } as unknown as ExecutionContext
  return { saved, core, context }
}

describe('<save> の要約', () => {
  test('シーンの saveSummary() の戻り値を、セーブデータの summary に入れる', async () => {
    const { saved, context } = setup({ saveSummary: () => ({ day: 3 }) })
    await new SaveHandler().execute({ type: 'save', slot: 1, message: false } as any, context)
    expect(saved.get('save_1').summary).toEqual({ day: 3 })
  })

  test('summary 属性があれば、そちらを展開して入れる', async () => {
    const { saved, context } = setup({ saveSummary: () => ({ day: 3 }) })
    await new SaveHandler().execute({ type: 'save', slot: 2, summary: '金貨 {{gold}}', message: false } as any, context)
    expect(saved.get('save_2').summary).toBe('金貨 120')
  })

  test('どちらも無ければ null', async () => {
    const { saved, context } = setup({})
    await new SaveHandler().execute({ type: 'save', slot: 3, message: false } as any, context)
    expect(saved.get('save_3').summary).toBeNull()
  })
})
