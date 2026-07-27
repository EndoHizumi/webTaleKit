// Mock browser APIs needed by ImageObject (ScenarioManager経由で読み込まれる)
// と TriggerHandler のホットスポット生成 (document.createElement)
class MockImage {
  src: string = ''
  onload: (() => void) | null = null
}

const globalRef = global as unknown as Record<string, unknown>
globalRef.Image = MockImage
globalRef.document = {
  // ImageObject用のcanvas兼TriggerHandler用のdivとして振る舞う疑似要素を返す
  createElement: () => {
    const el = new FakeElement() as unknown as Record<string, unknown>
    el.getContext = () => null
    return el
  },
}

import { TriggerHandler } from './TriggerHandler'
import { UntriggerHandler } from './UntriggerHandler'
import { ExecutionContext } from '../core/CommandRegistry'
import { ScenarioManager } from '../core/scenarioManager'
import { EventBus } from '../utils/eventBus'

/** イベントリスナーと子要素だけを扱う疑似DOM要素（gameContainer / 透明div代用） */
class FakeElement {
  id = ''
  style: Record<string, string> = {}
  parentNode: FakeElement | null = null
  children: FakeElement[] = []
  private listeners = new Map<string, EventListener[]>()

  addEventListener(event: string, handler: EventListener): void {
    if (!this.listeners.has(event)) this.listeners.set(event, [])
    this.listeners.get(event)!.push(handler)
  }

  removeEventListener(event: string, handler: EventListener): void {
    const handlers = this.listeners.get(event) || []
    const index = handlers.indexOf(handler)
    if (index !== -1) handlers.splice(index, 1)
  }

  appendChild(el: FakeElement): void {
    el.parentNode = this
    this.children.push(el)
  }

  removeChild(el: FakeElement): void {
    el.parentNode = null
    this.children = this.children.filter((child) => child !== el)
  }

  fire(event: string): void {
    const handlers = [...(this.listeners.get(event) || [])]
    handlers.forEach((handler) => handler({ type: event } as Event))
  }

  listenerCount(event: string): number {
    return (this.listeners.get(event) || []).length
  }
}

const createContext = (gameContainer: FakeElement) => {
  const scenarioManager = new ScenarioManager()
  scenarioManager.setScenario([{ type: 'text', content: ['A'] }, { type: 'text', content: ['B'] }], 'test')
  const eventBus = new EventBus()
  const context = {
    eventBus,
    scenarioManager,
    drawer: {},
    core: { gameContainer },
  } as unknown as ExecutionContext
  return { context, scenarioManager, eventBus }
}

describe('TriggerHandler', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('event属性がない場合は例外を投げる', async () => {
    const handler = new TriggerHandler()
    const { context } = createContext(new FakeElement())
    await expect(handler.execute({ type: 'trigger' }, context)).rejects.toThrow(
      'Error: <trigger> requires an "event" attribute',
    )
  })

  it('targetとrectの同時指定は例外を投げる', async () => {
    const handler = new TriggerHandler()
    const { context } = createContext(new FakeElement())
    await expect(
      handler.execute({ type: 'trigger', event: 'click', target: '#btn', rect: '(0,0,10,10)' }, context),
    ).rejects.toThrow('mutually exclusive')
  })

  it('rectとcircleの同時指定は例外を投げる', async () => {
    const handler = new TriggerHandler()
    const { context } = createContext(new FakeElement())
    await expect(
      handler.execute({ type: 'trigger', event: 'click', rect: '(0,0,10,10)', circle: '(5,5,3)' }, context),
    ).rejects.toThrow('mutually exclusive')
  })

  it('非ブロッキングで登録され、ゲームコンテナにリスナーが付く', async () => {
    const handler = new TriggerHandler()
    const el = new FakeElement()
    const { context } = createContext(el)
    await handler.execute({ type: 'trigger', id: 'hint', event: 'click' }, context)
    expect(handler.getActiveTriggerIds()).toEqual(['hint'])
    expect(el.listenerCount('click')).toBe(1)
  })

  it('発火時に子要素がsub:true付きで現在行の次に挿入される', async () => {
    const handler = new TriggerHandler()
    const el = new FakeElement()
    const { context, scenarioManager } = createContext(el)
    scenarioManager.setIndex(1)
    const content = [{ type: 'text', content: ['ヒント'] }]
    await handler.execute({ type: 'trigger', id: 'hint', event: 'click', content }, context)

    el.fire('click')

    const scenario = scenarioManager.getScenario()
    expect(scenario).toHaveLength(3)
    expect(scenario[1]).toEqual({ type: 'text', content: ['ヒント'], sub: true })
  })

  it('発火時にtrigger:fired:{id}イベントがemitされる', async () => {
    const handler = new TriggerHandler()
    const el = new FakeElement()
    const { context, eventBus } = createContext(el)
    const fired = jest.fn()
    eventBus.on('trigger:fired:bell', fired)
    await handler.execute({ type: 'trigger', id: 'bell', event: 'click' }, context)

    el.fire('click')

    expect(fired).toHaveBeenCalledWith(expect.objectContaining({ id: 'bell' }))
  })

  it('once指定は1回発火したら自動解除される', async () => {
    const handler = new TriggerHandler()
    const el = new FakeElement()
    const { context, scenarioManager } = createContext(el)
    const content = [{ type: 'text', content: ['一度だけ'] }]
    await handler.execute({ type: 'trigger', id: 'secret', event: 'click', once: true, content }, context)

    el.fire('click')
    el.fire('click')

    expect(handler.getActiveTriggerIds()).toEqual([])
    expect(el.listenerCount('click')).toBe(0)
    expect(scenarioManager.getScenario()).toHaveLength(3)
  })

  it('クールダウン中の発火は無視され、経過後は再発火できる', async () => {
    const handler = new TriggerHandler()
    const el = new FakeElement()
    const { context, scenarioManager } = createContext(el)
    const content = [{ type: 'text', content: ['ベル'] }]
    await handler.execute({ type: 'trigger', id: 'bell', event: 'click', cooldown: 1000, content }, context)

    el.fire('click')
    el.fire('click') // クールダウン中 → 無視
    expect(scenarioManager.getScenario()).toHaveLength(3)

    jest.advanceTimersByTime(1000)
    el.fire('click')
    expect(scenarioManager.getScenario()).toHaveLength(4)
  })

  it('cooldown="0"で連続発火できる', async () => {
    const handler = new TriggerHandler()
    const el = new FakeElement()
    const { context, scenarioManager } = createContext(el)
    const content = [{ type: 'text', content: ['連打'] }]
    await handler.execute({ type: 'trigger', id: 'rapid', event: 'click', cooldown: '0', content }, context)

    el.fire('click')
    el.fire('click')
    expect(scenarioManager.getScenario()).toHaveLength(4)
  })

  it('removeAllで全トリガーが解除され、trigger:removeがemitされる', async () => {
    const handler = new TriggerHandler()
    const el = new FakeElement()
    const { context, eventBus } = createContext(el)
    const removed = jest.fn()
    eventBus.on('trigger:remove', removed)
    await handler.execute({ type: 'trigger', id: 't1', event: 'click' }, context)
    await handler.execute({ type: 'trigger', id: 't2', event: 'keydown' }, context)

    handler.removeAll()

    expect(handler.getActiveTriggerIds()).toEqual([])
    expect(el.listenerCount('click')).toBe(0)
    expect(el.listenerCount('keydown')).toBe(0)
    expect(removed).toHaveBeenCalledTimes(2)
  })

  it('<untrigger id>で解除後は発火しない', async () => {
    const triggerHandler = new TriggerHandler()
    const untriggerHandler = new UntriggerHandler(triggerHandler)
    const el = new FakeElement()
    const { context, scenarioManager } = createContext(el)
    const content = [{ type: 'text', content: ['ヒント'] }]
    await triggerHandler.execute({ type: 'trigger', id: 'hint', event: 'click', content }, context)

    untriggerHandler.execute({ type: 'untrigger', id: 'hint' })
    el.fire('click')

    expect(scenarioManager.getScenario()).toHaveLength(2)
  })

  it('rect指定で透明ホットスポットdivが生成され、解除時に削除される', async () => {
    const handler = new TriggerHandler()
    const container = new FakeElement()
    const { context } = createContext(container)
    await handler.execute({ type: 'trigger', id: 'chest', event: 'click', rect: '(10,30,200,150)' }, context)

    expect(container.children).toHaveLength(1)
    const hotspot = container.children[0]
    expect(hotspot.id).toBe('trigger-chest')
    expect(hotspot.style.left).toBe('10px')
    expect(hotspot.style.top).toBe('30px')
    expect(hotspot.style.width).toBe('200px')
    expect(hotspot.style.height).toBe('150px')

    handler.remove('chest')
    expect(container.children).toHaveLength(0)
  })

  it('style指定ありはマウスオーバーで視覚効果が付き、離れると戻る', async () => {
    const handler = new TriggerHandler()
    const container = new FakeElement()
    const { context } = createContext(container)
    await handler.execute(
      { type: 'trigger', id: 'chest', event: 'click', rect: '(10,30,200,150)', style: 'glow' },
      context,
    )
    const hotspot = container.children[0]

    hotspot.fire('mouseenter')
    expect(hotspot.style.boxShadow).toContain('rgba(255, 240, 150')

    hotspot.fire('mouseleave')
    expect(hotspot.style.boxShadow).toBe('')
  })

  it('style="highlight"はマウスオーバーで背景が変わる', async () => {
    const handler = new TriggerHandler()
    const container = new FakeElement()
    const { context } = createContext(container)
    await handler.execute(
      { type: 'trigger', id: 'sofa', event: 'click', rect: '(0,0,100,100)', style: 'highlight' },
      context,
    )
    const hotspot = container.children[0]

    hotspot.fire('mouseenter')
    expect(hotspot.style.background).toContain('rgba(255, 240, 150')

    hotspot.fire('mouseleave')
    expect(hotspot.style.background).toBe('transparent')
  })

  it('style未指定（none）はマウスオーバーしても透明のまま', async () => {
    const handler = new TriggerHandler()
    const container = new FakeElement()
    const { context } = createContext(container)
    await handler.execute({ type: 'trigger', id: 'secret', event: 'click', rect: '(0,0,100,100)' }, context)
    const hotspot = container.children[0]

    expect(hotspot.listenerCount('mouseenter')).toBe(0)
    expect(hotspot.style.background).toBe('transparent')
  })

  it('id未指定はtrigger_付きのidが自動採番される', async () => {
    const handler = new TriggerHandler()
    const el = new FakeElement()
    const { context } = createContext(el)
    await handler.execute({ type: 'trigger', event: 'click' }, context)
    const ids = handler.getActiveTriggerIds()
    expect(ids).toHaveLength(1)
    expect(ids[0]).toMatch(/^trigger_\d+$/)
  })
})
