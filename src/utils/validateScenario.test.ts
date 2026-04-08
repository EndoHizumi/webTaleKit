import { validateScenarioObjects } from '../utils/validateScenario'

const mockCommandList: Record<string, Function> = {
  text: () => {},
  say: () => {},
  show: () => {},
  hide: () => {},
  choice: () => {},
  jump: () => {},
  sound: () => {},
  newpage: () => {},
  wait: () => {},
  call: () => {},
  route: () => {},
  moveto: () => {},
  save: () => {},
  load: () => {},
  if: () => {},
  dialog: () => {},
}

describe('validateScenarioObjects', () => {
  test('正常なシナリオで valid: true が返ること', () => {
    const scenario = [
      { type: 'text', content: ['こんにちは'] },
      { type: 'say', name: 'Alice', content: ['やあ'] },
    ]
    const result = validateScenarioObjects(scenario, mockCommandList)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
    expect(result.warnings).toHaveLength(0)
  })

  test('空配列で valid: false + error が返ること', () => {
    const result = validateScenarioObjects([], mockCommandList)
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
    expect(result.errors[0].message).toMatch(/空/)
  })

  test('未知の type で valid: false + error が返ること', () => {
    const scenario = [{ type: 'unknown_command', content: ['test'] }]
    const result = validateScenarioObjects(scenario, mockCommandList)
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
    expect(result.errors[0].type).toBe('unknown_command')
  })

  test('name のない say で warnings が返り valid: true であること', () => {
    const scenario = [{ type: 'say', content: ['やあ'] }]
    const result = validateScenarioObjects(scenario, mockCommandList)
    expect(result.valid).toBe(true)
    expect(result.warnings.length).toBeGreaterThan(0)
    expect(result.warnings[0].type).toBe('say')
  })

  test('content が空の text で warning が返ること', () => {
    const scenario = [{ type: 'text', content: [] }]
    const result = validateScenarioObjects(scenario, mockCommandList)
    expect(result.valid).toBe(true)
    expect(result.warnings.some((w) => w.type === 'text')).toBe(true)
  })

  test('item のない choice で error が返ること', () => {
    const scenario = [{ type: 'choice', content: [] }]
    const result = validateScenarioObjects(scenario, mockCommandList)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.type === 'choice')).toBe(true)
  })

  test('シナリオ範囲外の jump index で warning が返ること', () => {
    const scenario = [
      { type: 'text', content: ['hello'] },
      { type: 'jump', index: '99' },
    ]
    const result = validateScenarioObjects(scenario, mockCommandList)
    expect(result.valid).toBe(true)
    expect(result.warnings.some((w) => w.type === 'jump')).toBe(true)
  })

  test('HTMLタグを含むテキストがエスケープされること', () => {
    const scenario = [{ type: 'text', content: ['<script>alert("xss")</script>'] }]
    validateScenarioObjects(scenario, mockCommandList)
    expect(scenario[0].content[0]).not.toContain('<script>')
    expect(scenario[0].content[0]).toContain('&lt;script&gt;')
  })

  test('index が正常範囲内の jump で warning が出ないこと', () => {
    const scenario = [
      { type: 'text', content: ['hello'] },
      { type: 'text', content: ['world'] },
      { type: 'jump', index: '0' },
    ]
    const result = validateScenarioObjects(scenario, mockCommandList)
    expect(result.warnings.filter((w) => w.type === 'jump')).toHaveLength(0)
  })
})
