import { CommandHandler, ExecutionContext, ScenarioCommand } from '../core/CommandRegistry'

export class MoveToHandler implements CommandHandler {
  async execute(command: ScenarioCommand, context: ExecutionContext): Promise<void> {
    const { core, drawer } = context
    const line: any = command
    const key = line.name
    await drawer.moveTo(key, core.displayedImages, { x: line.x, y: line.y }, line.duration | 1)
  }
}
