import { CommandRegistry, ExecutionContext } from './CommandRegistry'
import { registerBuiltinCommands, TriggerHandler, UntriggerHandler } from '../commands'
import { isTruthyAttr } from '../commands/TriggerHandler'

const createContext = (): ExecutionContext => ({} as ExecutionContext)

describe('CommandRegistry', () => {
  let registry: CommandRegistry

  beforeEach(() => {
    registry = new CommandRegistry()
  })

  describe('register / has / getRegisteredTags', () => {
    it('登録したタグをhas()で確認できる', () => {
      registry.register('myTag', { execute: () => {} })
      expect(registry.has('mytag')).toBe(true)
      expect(registry.has('unknown')).toBe(false)
    })

    it('タグ名は小文字に正規化される', () => {
      registry.register('MyEffect', { execute: () => {} })
      expect(registry.has('myeffect')).toBe(true)
      expect(registry.has('MYEFFECT')).toBe(true)
      expect(registry.getRegisteredTags()).toEqual(['myeffect'])
    })

    it('既存タグへの再登録は上書きされ、警告が出る', async () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
      const first = jest.fn()
      const second = jest.fn()
      registry.register('text', { execute: first })
      registry.register('text', { execute: second })
      expect(warnSpy).toHaveBeenCalledWith('[CommandRegistry] Overriding existing handler for tag: "text"')
      await registry.execute({ type: 'text' }, createContext())
      expect(first).not.toHaveBeenCalled()
      expect(second).toHaveBeenCalled()
      warnSpy.mockRestore()
    })
  })

  describe('registerAll', () => {
    it('複数のハンドラをまとめて登録できる', () => {
      registry.registerAll({
        foo: { execute: () => {} },
        bar: { execute: () => {} },
      })
      expect(registry.has('foo')).toBe(true)
      expect(registry.has('bar')).toBe(true)
    })
  })

  describe('unregister', () => {
    it('登録解除できる', () => {
      registry.register('foo', { execute: () => {} })
      expect(registry.unregister('foo')).toBe(true)
      expect(registry.has('foo')).toBe(false)
      expect(registry.unregister('foo')).toBe(false)
    })
  })

  describe('execute', () => {
    it('typeに対応するハンドラにcommandとcontextを渡して実行する', async () => {
      const execute = jest.fn()
      const context = createContext()
      registry.register('say', { execute })
      const command = { type: 'say', name: 'Alice' }
      await registry.execute(command, context)
      expect(execute).toHaveBeenCalledWith(command, context)
    })

    it('type未指定はtextにフォールバックする', async () => {
      const execute = jest.fn()
      registry.register('text', { execute })
      await registry.execute({ content: ['hello'] }, createContext())
      expect(execute).toHaveBeenCalled()
    })

    it('typeの大文字小文字は区別しない', async () => {
      const execute = jest.fn()
      registry.register('show', { execute })
      await registry.execute({ type: 'SHOW' }, createContext())
      expect(execute).toHaveBeenCalled()
    })

    it('未知のタグは例外を投げる', async () => {
      await expect(registry.execute({ type: 'unknown' }, createContext())).rejects.toThrow(
        'Error: Command type "unknown" is not defined',
      )
    })

    it('非同期ハンドラの完了を待つ', async () => {
      let resolved = false
      registry.register('slow', {
        async execute() {
          await new Promise((resolve) => setTimeout(resolve, 10))
          resolved = true
        },
      })
      await registry.execute({ type: 'slow' }, createContext())
      expect(resolved).toBe(true)
    })
  })
})

describe('registerBuiltinCommands', () => {
  it('組み込み全タグ（16タグ + trigger/untrigger）を登録する', () => {
    const registry = new CommandRegistry()
    const handlers = registerBuiltinCommands(registry)
    const expectedTags = [
      'text', 'say', 'choice', 'show', 'hide', 'newpage', 'jump', 'call',
      'moveto', 'route', 'if', 'sound', 'wait', 'dialog', 'save', 'load',
      'trigger', 'untrigger',
    ]
    expectedTags.forEach((tag) => {
      expect(registry.has(tag)).toBe(true)
    })
    expect(registry.getRegisteredTags().sort()).toEqual([...expectedTags].sort())
    expect(handlers.trigger).toBeInstanceOf(TriggerHandler)
  })
})

describe('UntriggerHandler', () => {
  const createTriggerHandlerMock = () => {
    const triggerHandler = new TriggerHandler()
    jest.spyOn(triggerHandler, 'remove').mockImplementation(() => {})
    jest.spyOn(triggerHandler, 'removeAll').mockImplementation(() => {})
    return triggerHandler
  }

  it('id指定で該当トリガーを解除する', () => {
    const triggerHandler = createTriggerHandlerMock()
    const handler = new UntriggerHandler(triggerHandler)
    handler.execute({ type: 'untrigger', id: 'hint' })
    expect(triggerHandler.remove).toHaveBeenCalledWith('hint')
    expect(triggerHandler.removeAll).not.toHaveBeenCalled()
  })

  it('all指定で全トリガーを解除する', () => {
    const triggerHandler = createTriggerHandlerMock()
    const handler = new UntriggerHandler(triggerHandler)
    handler.execute({ type: 'untrigger', all: true })
    expect(triggerHandler.removeAll).toHaveBeenCalled()
    expect(triggerHandler.remove).not.toHaveBeenCalled()
  })

  it('id・all未指定は何もしない', () => {
    const triggerHandler = createTriggerHandlerMock()
    const handler = new UntriggerHandler(triggerHandler)
    handler.execute({ type: 'untrigger' })
    expect(triggerHandler.remove).not.toHaveBeenCalled()
    expect(triggerHandler.removeAll).not.toHaveBeenCalled()
  })
})

describe('isTruthyAttr', () => {
  it('属性の存在をtrueとみなす（空文字含む）', () => {
    expect(isTruthyAttr(true)).toBe(true)
    expect(isTruthyAttr('')).toBe(true)
    expect(isTruthyAttr('once')).toBe(true)
  })

  it('未指定・false・"false"はfalse', () => {
    expect(isTruthyAttr(undefined)).toBe(false)
    expect(isTruthyAttr(null)).toBe(false)
    expect(isTruthyAttr(false)).toBe(false)
    expect(isTruthyAttr('false')).toBe(false)
  })
})
