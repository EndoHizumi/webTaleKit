import { CommandHandler, ExecutionContext, ScenarioCommand } from '../core/CommandRegistry'

export class ChoiceHandler implements CommandHandler {
  async execute(command: ScenarioCommand, context: ExecutionContext): Promise<void> {
    const { core, eventBus, scenarioManager } = context
    const line: any = command
    if (line.prompt) core.textHandler(line.prompt)
    // ムスタッシュ構文があるときは、変数の展開
    line.content.forEach((choice: any) => {
      choice.label = core.expandVariable(choice.label)
    })
    // choice:showイベントを発行して選択肢の表示と選択結果の取得をDefaultUIHandlerに委譲する
    const [result] = await eventBus.emit('choice:show', line)
    const { selectId, onSelect: selectHandler } = result || {}
    if (selectHandler !== undefined) {
      scenarioManager.addScenario(selectHandler)
    }
    scenarioManager.setHistory({ line, ...selectId })
    core.isNext = false
  }
}
