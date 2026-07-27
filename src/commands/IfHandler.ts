import { CommandHandler, ExecutionContext, ScenarioCommand } from '../core/CommandRegistry'

export class IfHandler implements CommandHandler {
  async execute(command: ScenarioCommand, context: ExecutionContext): Promise<void> {
    const { core, scenarioManager } = context
    const isTrue = core.executeCode(`return ${command.condition}`)
    const branches = (command.content ?? []) as ScenarioCommand[]
    const appendScenario = isTrue ? branches[0].content : branches[1].content
    scenarioManager.addScenario(appendScenario as ScenarioCommand[])
  }
}
