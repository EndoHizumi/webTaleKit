import { CommandHandler, ExecutionContext, ScenarioCommand } from '../core/CommandRegistry'

export class CallHandler implements CommandHandler {
  async execute(command: ScenarioCommand, context: ExecutionContext): Promise<void> {
    const { core } = context
    const result = core.executeCode(command.method!)
    if (result && typeof (result as PromiseLike<unknown>).then === 'function') {
      await result
    }
  }
}
