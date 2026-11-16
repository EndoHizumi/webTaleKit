// Core.clickWait：待っているあいだ isClickWaiting が true になり、clickWait:start / clickWait:end を出す
;(global as any).Image = class {}
;(global as any).document = { createElement: () => ({ getContext: () => null }) }

import { Core } from './index'
import { EventBus } from '../utils/eventBus'

describe('Core.clickWait', () => {
  test('入るときに clickWait:start、クリックで抜けるときに clickWait:end を出す', async () => {
    jest.useFakeTimers()
    const core: any = Object.create(Core.prototype)
    core.eventBus = new EventBus()
    core.drawer = { setVisibility: jest.fn() }
    core.isNext = false
    core.isAuto = false
    core.isSkip = false
    const seen: string[] = []
    core.eventBus.on('clickWait:start', () => void seen.push(`start:${core.isClickWaiting}`))
    core.eventBus.on('clickWait:end', () => void seen.push(`end:${core.isClickWaiting}`))

    const done = core.clickWait()
    await Promise.resolve()
    await Promise.resolve()
    expect(core.isClickWaiting).toBe(true)
    expect(seen).toEqual(['start:true'])

    core.isNext = true
    await jest.advanceTimersByTimeAsync(500)
    await done
    expect(seen).toEqual(['start:true', 'end:false'])
    expect(core.isNext).toBe(false)
    expect(core.drawer.setVisibility).toHaveBeenLastCalledWith('#waitCircle', false)
    jest.useRealTimers()
  })
})
