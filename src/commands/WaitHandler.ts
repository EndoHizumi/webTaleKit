import { CommandHandler, ExecutionContext, ScenarioCommand } from '../core/CommandRegistry'

export class WaitHandler implements CommandHandler {
  async execute(command: ScenarioCommand, context: ExecutionContext): Promise<void> {
    // 待機処理はオートモード・スキップ・クリック待ちと密結合のため、Coreの共通ユーティリティに委譲する
    await context.core.waitHandler(command)
  }
}
