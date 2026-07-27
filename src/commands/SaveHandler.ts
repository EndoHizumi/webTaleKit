import { CommandHandler, ExecutionContext, ScenarioCommand } from '../core/CommandRegistry'
import { Progress, SaveData, SavedImageData } from '../core/types'

export class SaveHandler implements CommandHandler {
  async execute(command: ScenarioCommand, context: ExecutionContext): Promise<void> {
    const { core, scenarioManager } = context
    const line = command
    const slot = line.slot || 'auto'
    const name = line.name || `セーブ${slot}`

    const saveData: SaveData = {
      slot: slot,
      name: name,
      timestamp: new Date().toISOString(),
      scenarioManager: {
        progress: JSON.parse(JSON.stringify(scenarioManager.progress)) as Progress,
        sceneName: scenarioManager.getSceneName() || core.sceneConfig.name || '',
        currentIndex: scenarioManager.getIndex(),
        history: scenarioManager.getHistory ? [...scenarioManager.getHistory()] : [],
      },
      sceneConfig: core.sceneConfig,
      displayedImages: Object.keys(core.displayedImages).reduce<Record<string, SavedImageData>>((acc, key) => {
        if (key !== 'background') {
          acc[key] = {
            // ImageObjectはsrcを公開していないため、従来どおり常にnullが保存される
            // （表示エントリ側のsrcはShowHandlerが保持しているが、ここでは参照していない）
            src: (core.displayedImages[key].image as unknown as { src?: string })?.src || null,
            pos: core.displayedImages[key].pos,
            size: core.displayedImages[key].size,
            look: core.displayedImages[key].look,
            entry: core.displayedImages[key].entry,
          }
        }
        return acc
      }, {}),
      backgroundImage: core.displayedImages.background?.image?.getImage()?.src || null,
      usedSounds: Object.keys(core.usedSounds).reduce<Record<string, { src: string | null }>>((acc, key) => {
        acc[key] = {
          src: core.usedSounds[key].audio?.src || null,
        }
        return acc
      }, {}),
      bgmSrc: core.bgm?.src || null,
    }

    core.store.set(`save_${slot}`, saveData)

    if (line.message !== false) {
      await core.textHandler(`ゲームをセーブしました: ${name}`)
    }
  }
}
