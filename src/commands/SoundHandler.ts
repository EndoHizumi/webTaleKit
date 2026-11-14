import { CommandHandler, ExecutionContext, ScenarioCommand } from '../core/CommandRegistry'

export class SoundHandler implements CommandHandler {
  async execute(command: ScenarioCommand, context: ExecutionContext): Promise<void> {
    const { core } = context
    const line: any = command
    // BGMの指定が無い（sceneConfig.bgm を省いたシーンなど）ときは、流れているBGMを止めて無音のまま進む
    if (line.mode === 'bgm' && !line.src) {
      if (core.bgm && core.bgm.isPlaying) {
        core.bgm.stop()
      }
      core.bgm = null
      return
    }
    const soundObject = await core.getSoundObject(line)

    if (line.mode === 'bgm') {
      // BGMの場合、既存のBGMを停止して、新しいBGMをセットする
      if (core.bgm && core.bgm.isPlaying) {
        core.bgm.stop()
      }
      core.bgm = soundObject
      core.bgm.play(true)
    } else {
      if ('play' in line) {
        'loop' in line ? soundObject.play(true) : soundObject.play()
      }
    }

    if ('stop' in line) {
      soundObject.stop()
    } else if ('pause' in line) {
      soundObject.pause()
    }

    // soundObjectを管理オブジェクトに追加
    const key = line.name || line.src.split('/').pop()
    core.usedSounds[key] = {
      audio: soundObject,
    }
  }
}
