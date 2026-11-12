import { CommandHandler, ExecutionContext, ScenarioCommand } from '../core/CommandRegistry'

export class ChoiceHandler implements CommandHandler {
  async execute(command: ScenarioCommand, context: ExecutionContext): Promise<void> {
    const { core, eventBus, scenarioManager } = context
    const line: any = command
    if (line.prompt) core.textHandler(line.prompt)
    // <item if="…"> の条件が false の項目は表示しない。
    // 元の line は書き換えず、写しを渡す（同じ選択肢へ戻ったとき、そのときの条件で選び直すため）。
    // 選んだ結果は choice.id で返るので、項目を除いても履歴の selectId はずれない
    const visible = line.content.filter((choice: any) => choice.if === undefined || core.executeCode(`return ${choice.if}`))
    // ムスタッシュ構文があるときは、変数の展開
    visible.forEach((choice: any) => {
      choice.label = core.expandVariable(choice.label)
    })
    // choice:showイベントを発行して選択肢の表示と選択結果の取得をDefaultUIHandlerに委譲する
    const [result] = await eventBus.emit('choice:show', { ...line, content: visible })
    const { selectId, onSelect: selectHandler } = result || {}
    if (selectHandler !== undefined) {
      scenarioManager.addScenario(selectHandler)
    }
    scenarioManager.setHistory({ line, ...selectId })
    core.isNext = false
  }
}
