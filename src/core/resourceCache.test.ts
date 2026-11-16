// Core.checkResourceExists：あると分かったファイルは問い合わせ直さない。無かったものは次にまた問い合わせる
;(global as any).Image = class {}
;(global as any).document = { createElement: () => ({ getContext: () => null }) }

import { Core } from './index'

describe('Core.checkResourceExists', () => {
  test('あったファイルは 2 回目から fetch しない。無かったファイルは毎回 fetch する', async () => {
    const fetchMock = jest.fn(async (url: string) => ({ ok: url !== '/missing.png' }))
    ;(global as any).fetch = fetchMock
    const core: any = Object.create(Core.prototype)
    expect(await core.checkResourceExists('/bg.jpg')).toBe(true)
    expect(await core.checkResourceExists('/bg.jpg')).toBe(true)
    expect(await core.checkResourceExists('/missing.png')).toBe(false)
    expect(await core.checkResourceExists('/missing.png')).toBe(false)
    expect(fetchMock.mock.calls.map((c) => c[0])).toEqual(['/bg.jpg', '/missing.png', '/missing.png'])
  })
})
