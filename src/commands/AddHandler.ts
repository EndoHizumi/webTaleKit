import { CommandHandler, ExecutionContext, ScenarioCommand } from '../core/CommandRegistry'

export class AddHandler implements CommandHandler {
  async execute(command: ScenarioCommand, context: ExecutionContext): Promise<void> {
    const { core } = context
    const line = command as { target: string; name?: string; class?: string; content?: any[] }
    core.domElementHandler.addElement(line)
  }
}
