import { EventBus } from './eventBus'

describe('EventBus', () => {
  let bus: EventBus

  beforeEach(() => {
    bus = new EventBus()
  })

  describe('on / emit', () => {
    test('registers a handler and calls it when the event is emitted', async () => {
      const handler = jest.fn()
      bus.on('test', handler)
      await bus.emit('test', { value: 42 })
      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith({ value: 42 })
    })

    test('emitting an event with no handlers returns an empty array', async () => {
      const results = await bus.emit('no-listeners')
      expect(results).toEqual([])
    })

    test('multiple handlers for the same event are all called in order', async () => {
      const order: number[] = []
      bus.on('evt', () => { order.push(1) })
      bus.on('evt', () => { order.push(2) })
      bus.on('evt', () => { order.push(3) })
      await bus.emit('evt')
      expect(order).toEqual([1, 2, 3])
    })

    test('handlers for different events are independent', async () => {
      const handlerA = jest.fn()
      const handlerB = jest.fn()
      bus.on('a', handlerA)
      bus.on('b', handlerB)
      await bus.emit('a')
      expect(handlerA).toHaveBeenCalledTimes(1)
      expect(handlerB).not.toHaveBeenCalled()
    })

    test('emit returns array of resolved handler return values', async () => {
      bus.on('calc', () => 10)
      bus.on('calc', () => 20)
      const results = await bus.emit('calc')
      expect(results).toEqual([10, 20])
    })

    test('emit awaits async handlers before proceeding', async () => {
      const log: string[] = []
      bus.on('async', async () => {
        await new Promise<void>((resolve) => setTimeout(resolve, 10))
        log.push('done')
      })
      await bus.emit('async')
      expect(log).toEqual(['done'])
    })

    test('async handlers are executed sequentially', async () => {
      const log: number[] = []
      bus.on('seq', async () => {
        await new Promise<void>((resolve) => setTimeout(resolve, 20))
        log.push(1)
      })
      bus.on('seq', async () => {
        await new Promise<void>((resolve) => setTimeout(resolve, 5))
        log.push(2)
      })
      await bus.emit('seq')
      expect(log).toEqual([1, 2])
    })

    test('emit with no data passes undefined to handlers', async () => {
      const handler = jest.fn()
      bus.on('nodata', handler)
      await bus.emit('nodata')
      expect(handler).toHaveBeenCalledWith(undefined)
    })

    test('emitting the same event multiple times calls the handler each time', async () => {
      const handler = jest.fn()
      bus.on('repeat', handler)
      await bus.emit('repeat')
      await bus.emit('repeat')
      await bus.emit('repeat')
      expect(handler).toHaveBeenCalledTimes(3)
    })
  })

  describe('off', () => {
    test('removes a specific handler so it is no longer called', async () => {
      const handler = jest.fn()
      bus.on('evt', handler)
      bus.off('evt', handler)
      await bus.emit('evt')
      expect(handler).not.toHaveBeenCalled()
    })

    test('only removes the specified handler, leaving others intact', async () => {
      const handlerA = jest.fn()
      const handlerB = jest.fn()
      bus.on('evt', handlerA)
      bus.on('evt', handlerB)
      bus.off('evt', handlerA)
      await bus.emit('evt')
      expect(handlerA).not.toHaveBeenCalled()
      expect(handlerB).toHaveBeenCalledTimes(1)
    })

    test('calling off for an event with no listeners does not throw', () => {
      const handler = jest.fn()
      expect(() => bus.off('nonexistent', handler)).not.toThrow()
    })

    test('calling off for a handler that was never registered does not throw', () => {
      const registered = jest.fn()
      const unregistered = jest.fn()
      bus.on('evt', registered)
      expect(() => bus.off('evt', unregistered)).not.toThrow()
    })

    test('handler can be re-registered after being removed', async () => {
      const handler = jest.fn()
      bus.on('evt', handler)
      bus.off('evt', handler)
      bus.on('evt', handler)
      await bus.emit('evt')
      expect(handler).toHaveBeenCalledTimes(1)
    })
  })
})
