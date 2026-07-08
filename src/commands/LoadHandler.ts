import { CommandHandler, ExecutionContext, ScenarioCommand } from '../core/CommandRegistry'
import { ImageObject } from '../resource/ImageObject'

export class LoadHandler implements CommandHandler {
  async execute(command: ScenarioCommand, context: ExecutionContext): Promise<void> {
    const { core, scenarioManager, drawer } = context
    const line: any = command
    const slot = line.slot || 'auto'

    const saveDataRaw = core.store.get(`save_${slot}`)
    if (!saveDataRaw) {
      throw new Error(`セーブデータが見つかりません: スロット${slot}`)
    }

    // ディープコピーで循環参照を回避
    const saveData = JSON.parse(JSON.stringify(saveDataRaw))

    const sceneName = saveData.scenarioManager.sceneName || saveData.sceneConfig.name
    if (!sceneName) {
      throw new Error('Scene name not found in save data')
    }

    // シーンとプログレスを復元
    await core.loadScene(sceneName)
    await core.loadScreen(saveData.sceneConfig, { skipBackground: true, skipBgm: true })

    // 読んだところまで復元
    scenarioManager.setSceneName(saveData.scenarioManager.sceneName)
    scenarioManager.setIndex(saveData.scenarioManager.currentIndex)
    scenarioManager.setHistory(saveData.scenarioManager.history || [])
    ;(scenarioManager as any).progress = { ...(scenarioManager as any).progress, ...saveData.scenarioManager.progress }

    // 画面の復元
    core.displayedImages = {}
    if (saveData.backgroundImage) {
      const background = await new ImageObject().setImageAsync(saveData.backgroundImage)
      core.displayedImages['background'] = {
        image: background,
        size: {
          width: core.gameContainer.clientWidth,
          height: core.gameContainer.clientHeight,
        },
      }
    }

    for (const [key, imageData] of Object.entries<any>(saveData.displayedImages)) {
      if (imageData.src) {
        const image = await new ImageObject().setImageAsync(imageData.src)
        core.displayedImages[key] = {
          image: image,
          pos: imageData.pos,
          size: imageData.size,
          look: imageData.look,
          entry: imageData.entry,
        }
      }
    }

    // BGMの復元
    if (saveData.bgmSrc) {
      core.soundHandler({ mode: 'bgm', src: saveData.bgmSrc, loop: true, play: true })
    }

    drawer.show(core.displayedImages)

    if (line.message !== false) {
      await core.textHandler(`ゲームをロードしました: ${saveData.name}`)
    }
  }
}
