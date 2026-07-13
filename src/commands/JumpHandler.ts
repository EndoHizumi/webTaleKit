import { CommandHandler, ExecutionContext, ScenarioCommand } from '../core/CommandRegistry'

export class JumpHandler implements CommandHandler {
  execute(command: ScenarioCommand, context: ExecutionContext): void {
    const { scenarioManager } = context
    const line: any = command
    // ジャンプ先が現在の行より小さいときは、今の行とジャンプ先の行の間で、sub=falseの行を抽出して、scenarioManagerに追加する
    if (line.index < scenarioManager.getIndex()) {
      // scenarioManagerからシナリオを取得
      const scenario = scenarioManager.getScenario()
      // 結合用に、ジャンプ先までのインデックスを取得
      const noEditScenarioList = {
        before: scenario.slice(0, line.index),
        after: scenario.slice(scenarioManager.getIndex()),
      }
      // ジャンプ先のインデックスまでのシナリオを取得
      const scenarioList = scenario.slice(line.index, scenarioManager.getIndex())
      // sub=falseの行だけを取得
      const subFalseScenario = scenarioList.filter((item: any) => !item.sub)
      // after に残っている sub=true の要素を除去（前回の選択肢の残骸を除去する）
      const filteredAfter = noEditScenarioList.after.filter((item: any) => !item.sub)
      // scenarioManagerに追加
      scenarioManager.setScenario([...noEditScenarioList.before, ...subFalseScenario, ...filteredAfter])
    }
    scenarioManager.setIndex(Number(line.index))
  }
}
