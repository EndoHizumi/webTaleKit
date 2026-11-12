import { CommandHandler, ExecutionContext, ScenarioCommand } from '../core/CommandRegistry'

/**
 * <jump to="…"> の飛び先（<label name="…">）の位置を、今のシナリオから探す。
 * 選択肢の分岐が差し込まれて行がずれていても、実行するたびに探し直すので正しい位置になる。
 * 同じ名前が複数あるときは、元のシナリオの行（sub でない行）を優先する。
 */
function resolveLabel(scenario: any[], name: string): { index: number; sub: boolean } {
  let subIndex = -1
  for (let i = 0; i < scenario.length; i++) {
    const item = scenario[i]
    if (item?.type !== 'label' || String(item.name) !== name) continue
    if (!item.sub) return { index: i, sub: false }
    if (subIndex < 0) subIndex = i
  }
  if (subIndex >= 0) return { index: subIndex, sub: true }
  throw new Error(`jump: ラベル「${name}」が見つかりません（<label name="${name}" /> を置いてください）`)
}

export class JumpHandler implements CommandHandler {
  execute(command: ScenarioCommand, context: ExecutionContext): void {
    const { scenarioManager } = context
    const line: any = command
    let index = Number(line.index)
    if (line.to !== undefined && line.index === undefined) {
      const target = resolveLabel(scenarioManager.getScenario() ?? [], String(line.to))
      // 選択肢の中のラベルへ後ろ向きに飛ぶと、下の後片付けでラベルごと取り除かれてしまう
      if (target.sub && target.index < scenarioManager.getIndex()) {
        throw new Error(`jump: 選択肢の中のラベル「${line.to}」へは戻れません。ラベルは選択肢の外に置いてください`)
      }
      index = target.index
    }
    // ジャンプ先が現在の行より小さいときは、今の行とジャンプ先の行の間で、sub=falseの行を抽出して、scenarioManagerに追加する
    if (index < scenarioManager.getIndex()) {
      // scenarioManagerからシナリオを取得
      const scenario = scenarioManager.getScenario()
      // 結合用に、ジャンプ先までのインデックスを取得
      const noEditScenarioList = {
        before: scenario.slice(0, index),
        after: scenario.slice(scenarioManager.getIndex()),
      }
      // ジャンプ先のインデックスまでのシナリオを取得
      const scenarioList = scenario.slice(index, scenarioManager.getIndex())
      // sub=falseの行だけを取得
      const subFalseScenario = scenarioList.filter((item: any) => !item.sub)
      // after に残っている sub=true の要素を除去（前回の選択肢の残骸を除去する）
      const filteredAfter = noEditScenarioList.after.filter((item: any) => !item.sub)
      // scenarioManagerに追加
      scenarioManager.setScenario([...noEditScenarioList.before, ...subFalseScenario, ...filteredAfter])
    }
    scenarioManager.setIndex(index)
  }
}
