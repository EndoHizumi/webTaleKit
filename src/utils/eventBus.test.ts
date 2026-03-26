import { EventBus } from './eventBus'

describe('EventBus', () => {
  let bus: EventBus

  beforeEach(() => {
    bus = new EventBus()
  })

  describe('on / emit', () => {
    test('ハンドラを登録し、イベント発行時に呼び出されること', async () => {
      const handler = jest.fn()
      bus.on('test', handler)
      await bus.emit('test', { value: 42 })
      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith({ value: 42 })
    })

    test('ハンドラが未登録のイベントを発行すると空配列が返ること', async () => {
      const results = await bus.emit('no-listeners')
      expect(results).toEqual([])
    })

    test('同じイベントに登録した複数のハンドラが登録順に呼び出されること', async () => {
      const order: number[] = []
      bus.on('evt', () => { order.push(1) })
      bus.on('evt', () => { order.push(2) })
      bus.on('evt', () => { order.push(3) })
      await bus.emit('evt')
      expect(order).toEqual([1, 2, 3])
    })

    test('異なるイベントのハンドラは互いに独立していること', async () => {
      const handlerA = jest.fn()
      const handlerB = jest.fn()
      bus.on('a', handlerA)
      bus.on('b', handlerB)
      await bus.emit('a')
      expect(handlerA).toHaveBeenCalledTimes(1)
      expect(handlerB).not.toHaveBeenCalled()
    })

    test('emitがハンドラの戻り値を配列にまとめて返すこと', async () => {
      bus.on('calc', () => 10)
      bus.on('calc', () => 20)
      const results = await bus.emit('calc')
      expect(results).toEqual([10, 20])
    })

    test('emitが非同期ハンドラの完了を待つこと', async () => {
      const log: string[] = []
      bus.on('async', async () => {
        await new Promise<void>((resolve) => setTimeout(resolve, 10))
        log.push('done')
      })
      await bus.emit('async')
      expect(log).toEqual(['done'])
    })

    test('非同期ハンドラが順番に実行されること', async () => {
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

    test('データなしでemitするとハンドラにundefinedが渡ること', async () => {
      const handler = jest.fn()
      bus.on('nodata', handler)
      await bus.emit('nodata')
      expect(handler).toHaveBeenCalledWith(undefined)
    })

    test('同じイベントを複数回emitするとその都度ハンドラが呼ばれること', async () => {
      const handler = jest.fn()
      bus.on('repeat', handler)
      await bus.emit('repeat')
      await bus.emit('repeat')
      await bus.emit('repeat')
      expect(handler).toHaveBeenCalledTimes(3)
    })
  })

  describe('off', () => {
    test('offで削除したハンドラはイベント発行時に呼ばれないこと', async () => {
      const handler = jest.fn()
      bus.on('evt', handler)
      bus.off('evt', handler)
      await bus.emit('evt')
      expect(handler).not.toHaveBeenCalled()
    })

    test('offで指定したハンドラのみ削除され、他のハンドラは残ること', async () => {
      const handlerA = jest.fn()
      const handlerB = jest.fn()
      bus.on('evt', handlerA)
      bus.on('evt', handlerB)
      bus.off('evt', handlerA)
      await bus.emit('evt')
      expect(handlerA).not.toHaveBeenCalled()
      expect(handlerB).toHaveBeenCalledTimes(1)
    })

    test('ハンドラが未登録のイベントにoffを呼んでもエラーにならないこと', () => {
      const handler = jest.fn()
      expect(() => bus.off('nonexistent', handler)).not.toThrow()
    })

    test('登録していないハンドラをoffしてもエラーにならないこと', () => {
      const registered = jest.fn()
      const unregistered = jest.fn()
      bus.on('evt', registered)
      expect(() => bus.off('evt', unregistered)).not.toThrow()
    })

    test('offで削除したハンドラを再登録して使用できること', async () => {
      const handler = jest.fn()
      bus.on('evt', handler)
      bus.off('evt', handler)
      bus.on('evt', handler)
      await bus.emit('evt')
      expect(handler).toHaveBeenCalledTimes(1)
    })
  })
})
