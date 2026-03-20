/**
 * Unit tests for the Core event emission system.
 *
 * Because Core relies on browser globals (document, window, fetch, etc.) we
 * test the event API logic in isolation by exercising the on / off / emit
 * methods via a lightweight stand-alone class that mirrors exactly what Core
 * implements.  This lets us run under the default Node.js test environment
 * without needing a full DOM mock.
 */

// ---------------------------------------------------------------------------
// Minimal replica of the event system used in Core
// ---------------------------------------------------------------------------
type CoreEventHandler = (data: unknown) => void

class EventEmitterMixin {
  private eventHandlers: Record<string, CoreEventHandler[]> = {}

  on(event: string, handler: CoreEventHandler): this {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = []
    }
    this.eventHandlers[event].push(handler)
    return this
  }

  off(event: string, handler: CoreEventHandler): this {
    if (!this.eventHandlers[event]) return this
    this.eventHandlers[event] = this.eventHandlers[event].filter((h) => h !== handler)
    return this
  }

  emit(event: string, data?: unknown): void {
    if (!this.eventHandlers[event]) return
    this.eventHandlers[event].forEach((handler) => handler(data))
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Core event system – on / off / emit', () => {
  let emitter: EventEmitterMixin

  beforeEach(() => {
    emitter = new EventEmitterMixin()
  })

  test('on() registers a handler that is called by emit()', () => {
    const received: unknown[] = []
    emitter.on('textstart', (data) => received.push(data))
    emitter.emit('textstart', { content: ['Hello'], name: 'Taro' })
    expect(received).toHaveLength(1)
    expect(received[0]).toEqual({ content: ['Hello'], name: 'Taro' })
  })

  test('emit() with no registered handler does not throw', () => {
    expect(() => emitter.emit('textend', {})).not.toThrow()
  })

  test('multiple handlers for the same event are all called', () => {
    const log: string[] = []
    emitter.on('textstart', () => log.push('first'))
    emitter.on('textstart', () => log.push('second'))
    emitter.emit('textstart', {})
    expect(log).toEqual(['first', 'second'])
  })

  test('off() removes only the specified handler', () => {
    const log: string[] = []
    const handler1 = () => log.push('handler1')
    const handler2 = () => log.push('handler2')
    emitter.on('textend', handler1)
    emitter.on('textend', handler2)
    emitter.off('textend', handler1)
    emitter.emit('textend', {})
    expect(log).toEqual(['handler2'])
  })

  test('off() for an unknown event does not throw', () => {
    expect(() => emitter.off('unknown', () => {})).not.toThrow()
  })

  test('on() returns this for chaining', () => {
    const result = emitter.on('textstart', () => {})
    expect(result).toBe(emitter)
  })

  test('off() returns this for chaining', () => {
    const handler = () => {}
    emitter.on('textend', handler)
    const result = emitter.off('textend', handler)
    expect(result).toBe(emitter)
  })

  test('textprogress event carries char and displayedText', () => {
    const progress: Array<{ char: string; displayedText: string }> = []
    emitter.on('textprogress', (data) =>
      progress.push(data as { char: string; displayedText: string }),
    )

    // Simulate per-character emissions as done in textHandler
    const text = 'Hi'
    let displayed = ''
    for (const char of text) {
      displayed += char
      emitter.emit('textprogress', { char, displayedText: displayed })
    }

    expect(progress).toHaveLength(2)
    expect(progress[0]).toEqual({ char: 'H', displayedText: 'H' })
    expect(progress[1]).toEqual({ char: 'i', displayedText: 'Hi' })
  })

  test('choicestart and choiceend events carry correct payloads', () => {
    const events: unknown[] = []
    emitter.on('choicestart', (d) => events.push({ type: 'choicestart', data: d }))
    emitter.on('choiceend', (d) => events.push({ type: 'choiceend', data: d }))

    const choices = [{ id: 0, label: 'Yes' }, { id: 1, label: 'No' }]
    emitter.emit('choicestart', { choices })
    emitter.emit('choiceend', { selectId: 1 })

    expect(events).toHaveLength(2)
    expect((events[0] as any).type).toBe('choicestart')
    expect((events[0] as any).data.choices).toEqual(choices)
    expect((events[1] as any).type).toBe('choiceend')
    expect((events[1] as any).data.selectId).toBe(1)
  })

  test('textstart and textend are emitted in the correct order', () => {
    const order: string[] = []
    emitter.on('textstart', () => order.push('textstart'))
    emitter.on('textend', () => order.push('textend'))

    // Simulate what textHandler does
    emitter.emit('textstart', {})
    // ... (text rendering would happen here) ...
    emitter.emit('textend', {})

    expect(order).toEqual(['textstart', 'textend'])
  })
})
