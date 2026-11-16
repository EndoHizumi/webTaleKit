// CommandRegistry.hook（Core.hookCommand）：タグの前後に処理を足す
import { CommandRegistry, ExecutionContext } from './CommandRegistry'

const ctx = {} as ExecutionContext

describe('CommandRegistry.hook', () => {
  test('before → ハンドラ → after の順に呼び、複数のフックは after を逆順に呼ぶ', async () => {
    const r = new CommandRegistry()
    const order: string[] = []
    r.register('say', { execute: () => void order.push('say') })
    r.hook('say', { before: () => void order.push('b1'), after: () => void order.push('a1') })
    r.hook('SAY', { before: () => void order.push('b2'), after: () => void order.push('a2') })
    await r.execute({ type: 'say' }, ctx)
    expect(order).toEqual(['b1', 'b2', 'say', 'a2', 'a1'])
  })

  test('ハンドラが例外を投げても after は呼ばれ、例外はそのまま伝わる', async () => {
    const r = new CommandRegistry()
    const after = jest.fn()
    r.register('choice', {
      execute: () => {
        throw new Error('boom')
      },
    })
    r.hook('choice', { after })
    await expect(r.execute({ type: 'choice' }, ctx)).rejects.toThrow('boom')
    expect(after).toHaveBeenCalledTimes(1)
  })

  test('フックには実行するコマンドとコンテキストが渡る。ほかのタグでは呼ばれない', async () => {
    const r = new CommandRegistry()
    r.register('text', { execute: () => {} })
    r.register('say', { execute: () => {} })
    const before = jest.fn()
    r.hook('say', { before })
    await r.execute({ type: 'text' }, ctx)
    await r.execute({ type: 'say', name: 'A' }, ctx)
    expect(before).toHaveBeenCalledTimes(1)
    expect(before.mock.calls[0][0]).toMatchObject({ type: 'say', name: 'A' })
    expect(before.mock.calls[0][1]).toBe(ctx)
  })

  test('戻り値の関数で外せる。register で上書きしてもフックは残る', async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    const r = new CommandRegistry()
    r.register('say', { execute: () => {} })
    const keep = jest.fn()
    const drop = jest.fn()
    r.hook('say', { before: keep })
    const off = r.hook('say', { before: drop })
    off()
    r.register('say', { execute: () => {} })
    await r.execute({ type: 'say' }, ctx)
    expect(keep).toHaveBeenCalledTimes(1)
    expect(drop).not.toHaveBeenCalled()
  })
})
