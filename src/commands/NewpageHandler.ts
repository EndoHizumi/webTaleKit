import { CommandHandler, ExecutionContext, ScenarioCommand } from '../core/CommandRegistry'

export class NewpageHandler implements CommandHandler {
  execute(command: ScenarioCommand, context: ExecutionContext): void {
    const { core, drawer } = context
    core.displayedImages = {
      background: {
        image: core.getBackground(),
        size: {
          width: core.gameContainer.clientWidth,
          height: core.gameContainer.clientHeight,
        },
      },
    }
    drawer.clear()
    drawer.show(core.displayedImages)
  }
}
