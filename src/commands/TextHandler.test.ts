import { TextHandler } from './TextHandler'
import { ExecutionContext } from '../core/CommandRegistry'

const createContext = (): { context: ExecutionContext; emit: jest.Mock } => {
  const emit = jest.fn().mockResolvedValue(undefined)
  const context = {
    core: {
      // {{…}} を中身に置き換える、ごく簡単な変数展開
      expandVariable: (text: any) => String(text ?? '').replace(/\{\{\s*(\w+)\s*\}\}/g, (_m, key) => (key === 'heroName' ? 'シオン' : _m)),
      waitHandler: jest.fn().mockResolvedValue(undefined),
      isSkip: false,
    },
    eventBus: { emit },
    drawer: { isSkip: false },
    scenarioManager: { setHistory: jest.fn() },
  } as unknown as ExecutionContext
  return { context, emit }
}

const showPayload = (emit: jest.Mock) => emit.mock.calls.find(([event]) => event === 'text:show')?.[1]

describe('TextHandler', () => {
  it('話者名の {{…}} を展開して表示する', async () => {
    const { context, emit } = createContext()
    await new TextHandler().execute({ type: 'say', name: '{{heroName}}', content: ['こんばんは。'] } as any, context)
    expect(showPayload(emit).name).toBe('シオン')
  })

  it('話者名が無いときは空文字のまま', async () => {
    const { context, emit } = createContext()
    await new TextHandler().execute({ type: 'text', content: ['地の文。'] } as any, context)
    expect(showPayload(emit).name).toBe('')
  })

  it('変数を含まない話者名は、そのまま渡す', async () => {
    const { context, emit } = createContext()
    await new TextHandler().execute({ type: 'say', name: 'コルネイユ', content: ['……ふん。'] } as any, context)
    expect(showPayload(emit).name).toBe('コルネイユ')
  })
})
