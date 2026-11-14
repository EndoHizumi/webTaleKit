import { SoundHandler } from './SoundHandler'
import { ExecutionContext } from '../core/CommandRegistry'

const createContext = (bgm: any = null) => {
  const core: any = {
    bgm,
    usedSounds: {},
    getSoundObject: jest.fn(async (line: any) => ({ src: line.src, play: jest.fn(), stop: jest.fn(), isPlaying: false })),
  }
  return { core, context: { core } as unknown as ExecutionContext }
}

describe('SoundHandler（BGM の省略）', () => {
  test('src の無い BGM は読み込まず、エラーにならない', async () => {
    const { core, context } = createContext()
    await expect(new SoundHandler().execute({ mode: 'bgm', src: undefined, loop: true, play: true }, context)).resolves.toBeUndefined()
    expect(core.getSoundObject).not.toHaveBeenCalled()
    expect(core.bgm).toBeNull()
  })

  test('src の無い BGM に変わると、前のシーンの BGM を止めて無音にする', async () => {
    const previous = { isPlaying: true, stop: jest.fn() }
    const { core, context } = createContext(previous)
    await new SoundHandler().execute({ mode: 'bgm', src: '', loop: true, play: true }, context)
    expect(previous.stop).toHaveBeenCalledTimes(1)
    expect(core.bgm).toBeNull()
    expect(core.usedSounds).toEqual({})
  })

  test('src のある BGM は、これまでどおり読み込んで流す', async () => {
    const { core, context } = createContext()
    await new SoundHandler().execute({ mode: 'bgm', src: './bgm/title.mp3', loop: true, play: true }, context)
    expect(core.getSoundObject).toHaveBeenCalledTimes(1)
    expect(core.bgm.play).toHaveBeenCalledWith(true)
    expect(core.usedSounds['title.mp3']).toBeDefined()
  })
})
