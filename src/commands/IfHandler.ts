import { CommandHandler, ExecutionContext, ScenarioCommand } from '../core/CommandRegistry'

export class IfHandler implements CommandHandler {
  async execute(command: ScenarioCommand, context: ExecutionContext): Promise<void> {
    const { core, scenarioManager } = context
    const line: any = command
    const isTrue = core.executeCode(`return ${line.condition}`)
    const appendScenario = isTrue ? line.content[0].content : line.content[1].content
    scenarioManager.addScenario(appendScenario)
  }
}
