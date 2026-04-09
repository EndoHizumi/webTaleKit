import * as logger from '../utils/logger'
import {
  assertScenarioValidation,
  createScenarioValidationError,
  formatValidationOutput,
  reportScenarioValidation,
  validateScenarioObjects,
} from '../utils/validateScenario'

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
    expect(result.sanitizedScenario).toEqual(scenario)
    expect(result.sanitized).toBe(false)
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
    const result = validateScenarioObjects(scenario, mockCommandList)
    expect(scenario[0].content[0]).toContain('<script>')
    expect(result.sanitizedScenario[0].content[0]).not.toContain('<script>')
    expect(result.sanitizedScenario[0].content[0]).toContain('&lt;script&gt;')
    expect(result.sanitized).toBe(true)
  })

  test('ネストしたオブジェクトも非破壊でサニタイズされること', () => {
    const scenario = [
      {
        type: 'choice',
        content: [{ type: 'item', label: '<b>危険</b>', content: ['<i>text</i>'] }],
      },
    ]

    const result = validateScenarioObjects(scenario, mockCommandList)

    expect(scenario[0].content[0].label).toBe('<b>危険</b>')
    expect(result.sanitizedScenario[0].content[0].label).toBe('&lt;b&gt;危険&lt;/b&gt;')
    expect(result.sanitizedScenario[0].content[0].content[0]).toBe('&lt;i&gt;text&lt;/i&gt;')
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

  test('formatValidationOutput が warnings と errors を整形すること', () => {
    const result = validateScenarioObjects([{ type: 'say', content: ['hello'] }], mockCommandList)
    const formatted = formatValidationOutput(result)

    expect(formatted.errors).toHaveLength(0)
    expect(formatted.warnings[0]).toContain('[index:0]')
    expect(formatted.warnings[0]).toContain('<say>')
  })

  test('createScenarioValidationError が error をまとめた Error を返すこと', () => {
    const result = validateScenarioObjects([{ type: 'choice', content: [] }], mockCommandList)
    const error = createScenarioValidationError(result, 'Custom context')

    expect(error).toBeInstanceOf(Error)
    expect(error?.message).toContain('Custom context')
    expect(error?.message).toContain('choice コマンドに item が含まれていません')
  })

  test('assertScenarioValidation が invalid 時に throw すること', () => {
    const result = validateScenarioObjects([{ type: 'choice', content: [] }], mockCommandList)
    expect(() => assertScenarioValidation(result)).toThrow(/Scenario validation failed/)
  })

  test('reportScenarioValidation が warning と error を logger に流すこと', async () => {
    const outputLogSpy = jest.spyOn(logger, 'outputLog').mockResolvedValue()
    const logErrorSpy = jest.spyOn(logger, 'logError').mockResolvedValue()
    const result = validateScenarioObjects([
      { type: 'say', content: ['hello'] },
      { type: 'choice', content: [] },
    ], mockCommandList)

    await reportScenarioValidation(result, 'Validation test')

    expect(outputLogSpy).toHaveBeenCalled()
    expect(logErrorSpy).toHaveBeenCalled()

    outputLogSpy.mockRestore()
    logErrorSpy.mockRestore()
  })
})
