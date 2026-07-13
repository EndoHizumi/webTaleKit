import { CommandHandler, ExecutionContext, ScenarioCommand } from '../core/CommandRegistry'

export class HideHandler implements CommandHandler {
  async execute(command: ScenarioCommand, context: ExecutionContext): Promise<void> {
    const { core, drawer } = context
    const line: any = command
    const targetImage = core.displayedImages[line.name]
    if (!targetImage) {
      throw new Error(`Image not found: ${line.name}`)
    }
    if (line.mode === 'cg') {
      core.displayedImages = { ...core.tempImages }
      core.tempImages = {}
    } else {
      delete core.displayedImages[line.name]
    }
    drawer.show(core.displayedImages)
    if (line.transition === 'fade') {
      // フェードアウト効果で非表示
      await drawer.fadeOut(line.duration || 1000, targetImage.image, {
        pos: targetImage.pos,
        size: targetImage.size,
        look: targetImage.look,
      })
    }
  }
}
