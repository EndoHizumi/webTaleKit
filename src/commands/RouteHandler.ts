import { CommandHandler, ExecutionContext, ScenarioCommand } from '../core/CommandRegistry'

export class RouteHandler implements CommandHandler {
  async execute(command: ScenarioCommand, context: ExecutionContext): Promise<void> {
    const { core } = context
    const line: any = command
    // シーン遷移時は全トリガーを自動解除する（リスナーリーク防止）
    core.clearAllTriggers()
    core.newpageHandler()
    if (core.sceneFile.cleanUp) {
      // 終了処理を実行する
      core.sceneFile.cleanUp()
    }
    // sceneファイルを読み込む
    await core.loadScene(line.to)
    // 画面を表示する
    await core.loadScreen(core.sceneConfig)
    // BGMを再生する
    core.soundHandler({
      mode: 'bgm',
      src: core.sceneConfig.bgm,
      loop: true,
      play: true,
    })
  }
}
