import { CommandHandler, ExecutionContext, ScenarioCommand } from '../core/CommandRegistry'

export class CallHandler implements CommandHandler {
  async execute(command: ScenarioCommand, context: ExecutionContext): Promise<void> {
    const { core } = context
    const line: any = command
    const result = core.executeCode(line.method)
    if (result && typeof result.then === 'function') {
      await result
    }
  }
}
