import { CommandHandler, ExecutionContext, ScenarioCommand } from '../core/CommandRegistry'

export class MoveToHandler implements CommandHandler {
  async execute(command: ScenarioCommand, context: ExecutionContext): Promise<void> {
    const { core, drawer } = context
    const line = command
    const key = line.name!
    await drawer.moveTo(key, core.displayedImages, { x: Number(line.x), y: Number(line.y) }, Number(line.duration) || 1)
  }
}
