// Core.loadScreen が、画面の入れ直しの前後に screen:beforeLoad / screen:loaded を出すことを確かめる
;(global as any).Image = class {
  src = ''
  onload: (() => void) | null = null
}
;(global as any).document = { createElement: () => ({ getContext: () => null }) }

import { Core } from './index'
import { EventBus } from '../utils/eventBus'

const createCore = () => {
  const core: any = Object.create(Core.prototype)
  const order: string[] = []
  core.eventBus = new EventBus()
  core.scenarioManager = { progress: {}, setSceneName: jest.fn() }
  core.gameContainer = { clientWidth: 1280, clientHeight: 720 }
  core.displayedImages = {}
  core.drawer = { show: jest.fn(() => order.push('drawer.show')) }
  core.checkResourceExists = jest.fn(async () => true)
  // 画面の入れ直し（DefaultUIHandler の screen:load の代わり）
  core.eventBus.on('screen:load', () => order.push('screen:load'))
  return { core, order }
}

describe('Core.loadScreen の画面イベント', () => {
  test('screen:load の前に screen:beforeLoad、背景を描いた後に screen:loaded を出す', async () => {
    const { core, order } = createCore()
    const seen: any[] = []
    core.eventBus.on('screen:beforeLoad', (data: any) => {
      order.push('screen:beforeLoad')
      seen.push(data)
    })
    core.eventBus.on('screen:loaded', (data: any) => {
      order.push('screen:loaded')
      seen.push(data)
    })
    await core.loadScreen({ name: 'battle', template: './src/screen/main.html' }, { skipBackground: true })
    expect(order).toEqual(['screen:beforeLoad', 'screen:load', 'screen:loaded'])
    expect(seen[0]).toEqual({ template: './src/screen/main.html', sceneName: 'battle', isDialog: false })
    expect(seen[1]).toBe(seen[0])
  })

  test('拡張は screen:loaded で、入れ直した画面に自分の層を付け直せる', async () => {
    const { core } = createCore()
    // 画面の入れ直しで、gameContainer の子が新しくなる
    let children: string[] = ['vrmCanvas']
    core.eventBus.on('screen:load', () => {
      children = ['canvas', 'messageWindow']
    })
    core.eventBus.on('screen:loaded', ({ isDialog }: any) => {
      if (!isDialog && !children.includes('vrmCanvas')) children.unshift('vrmCanvas')
    })
    await core.loadScreen({ name: 'next', template: './t.html' }, { skipBackground: true })
    expect(children).toEqual(['vrmCanvas', 'canvas', 'messageWindow'])
  })

  test('ダイアログの読み込みでは isDialog: true を渡す', async () => {
    const { core } = createCore()
    const loaded = jest.fn()
    core.eventBus.on('screen:loaded', loaded)
    await core.loadScreen({ name: 'save', template: './dialog.html' }, { isDialog: true, skipBackground: true })
    expect(loaded).toHaveBeenCalledWith(expect.objectContaining({ isDialog: true }))
  })
})
