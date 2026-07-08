import { CommandHandler, ExecutionContext, ScenarioCommand } from '../core/CommandRegistry'

export class SaveHandler implements CommandHandler {
  async execute(command: ScenarioCommand, context: ExecutionContext): Promise<void> {
    const { core, scenarioManager } = context
    const line: any = command
    const slot = line.slot || 'auto'
    const name = line.name || `セーブ${slot}`

    const saveData = {
      slot: slot,
      name: name,
      timestamp: new Date().toISOString(),
      scenarioManager: {
        progress: JSON.parse(JSON.stringify((scenarioManager as any).progress)),
        sceneName: scenarioManager.getSceneName() || core.sceneConfig.name,
        currentIndex: scenarioManager.getIndex(),
        history: scenarioManager.getHistory ? [...scenarioManager.getHistory()] : [],
      },
      sceneConfig: core.sceneConfig,
      displayedImages: Object.keys(core.displayedImages).reduce((acc: Record<string, any>, key) => {
        if (key !== 'background') {
          acc[key] = {
            src: core.displayedImages[key].image?.src || null,
            pos: core.displayedImages[key].pos,
            size: core.displayedImages[key].size,
            look: core.displayedImages[key].look,
            entry: core.displayedImages[key].entry,
          }
        }
        return acc
      }, {}),
      backgroundImage: core.displayedImages.background?.image?.getImage()?.src || null,
      usedSounds: Object.keys(core.usedSounds).reduce((acc: Record<string, any>, key) => {
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
