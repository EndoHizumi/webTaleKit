import { listSaveSlots, resolveSaveSummary, summarizeSave } from './saveSlots'

const save = (slot: string, timestamp: string, extra: any = {}) => ({
  slot,
  name: `スロット ${slot}`,
  timestamp,
  scenarioManager: { sceneName: 'hub', history: [], progress: {} },
  sceneConfig: { name: 'hub' },
  ...extra,
})

describe('セーブ枠の一覧', () => {
  test('save_ の付くものだけを、新しい順に要約して返す', () => {
    const store: any = {
      save_1: save('1', '2026-11-15T01:00:00Z', { summary: { day: 3 } }),
      save_2: save('2', '2026-11-15T02:00:00Z'),
      guildDemo: { day: 9 },
      set() {},
    }
    expect(listSaveSlots(store)).toEqual([
      { slot: '2', name: 'スロット 2', timestamp: '2026-11-15T02:00:00Z', sceneName: 'hub', summary: null },
      { slot: '1', name: 'スロット 1', timestamp: '2026-11-15T01:00:00Z', sceneName: 'hub', summary: { day: 3 } },
    ])
  })

  test('壊れたデータは null（一覧からは外れる）', () => {
    expect(summarizeSave(null)).toBeNull()
    expect(listSaveSlots({ save_x: 'broken' } as any)).toEqual([])
  })
})

describe('セーブするときの要約', () => {
  test('summary 属性があればそれを使い、{{…}} を展開する', () => {
    const expand = (t: string) => t.replace('{{day}}', '3')
    expect(resolveSaveSummary({ summary: '{{day}} 日目' }, { saveSummary: () => 'x' }, expand)).toBe('3 日目')
  })

  test('summary 属性がなければ、シーンの saveSummary() の戻り値（JSON にできる形に写す）', () => {
    const sceneFile = { saveSummary: () => ({ day: 3, gold: 120, fn: () => 1 }) }
    expect(resolveSaveSummary({}, sceneFile)).toEqual({ day: 3, gold: 120 })
  })

  test('saveSummary() が無い・例外を出すときは null', () => {
    expect(resolveSaveSummary({}, {})).toBeNull()
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    expect(resolveSaveSummary({}, { saveSummary: () => { throw new Error('x') } })).toBeNull()
    warn.mockRestore()
  })
})
