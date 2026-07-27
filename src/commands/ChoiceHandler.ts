import { CommandHandler, ExecutionContext, ScenarioCommand } from '../core/CommandRegistry'
import { ChoiceItem, ChoiceResult } from '../core/types'

export class ChoiceHandler implements CommandHandler {
  async execute(command: ScenarioCommand, context: ExecutionContext): Promise<void> {
    const { core, eventBus, scenarioManager } = context
    const line = command
    if (line.prompt) core.textHandler(line.prompt)
    // ムスタッシュ構文があるときは、変数の展開
    const choices = (line.content ?? []) as ChoiceItem[]
    choices.forEach((choice) => {
      choice.label = core.expandVariable(choice.label)
    })
    // choice:showイベントを発行して選択肢の表示と選択結果の取得をDefaultUIHandlerに委譲する
    const [result] = (await eventBus.emit('choice:show', line)) as Array<ChoiceResult | undefined>
    const { selectId, onSelect: selectHandler } = result || {}
    if (selectHandler !== undefined) {
      scenarioManager.addScenario(selectHandler)
    }
    // 元実装の { line, ...selectId } と同じ挙動（selectIdは数値なのでスプレッドしても何も追加されない）
    scenarioManager.setHistory(Object.assign({ line }, selectId))
    core.isNext = false
  }
}
