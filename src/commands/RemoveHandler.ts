import { CommandHandler, ExecutionContext, ScenarioCommand } from '../core/CommandRegistry'

export class RemoveHandler implements CommandHandler {
  async execute(command: ScenarioCommand, context: ExecutionContext): Promise<void> {
    const { core } = context
    const line = command as { name: string }
    core.domElementHandler.removeElement(line)
  }
}
