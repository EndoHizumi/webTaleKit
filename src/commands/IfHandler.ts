import { CommandHandler, ExecutionContext, ScenarioCommand } from '../core/CommandRegistry'

export class IfHandler implements CommandHandler {
  async execute(command: ScenarioCommand, context: ExecutionContext): Promise<void> {
    const { core, scenarioManager } = context
    const line: any = command
    const isTrue = core.executeCode(`return ${line.condition}`)
    // <else>は省略可能。該当するブロックがなければ何もしない
    const branch = line.content.find((item: any) => item.type === (isTrue ? 'then' : 'else'))
    if (!branch) return
    scenarioManager.addScenario(branch.content)
  }
}
