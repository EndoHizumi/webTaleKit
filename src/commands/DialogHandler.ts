import { CommandHandler, ExecutionContext, ScenarioCommand } from '../core/CommandRegistry'
import { getDefaultDialogTemplate } from '../utils/fallbackTemplate'

export class DialogHandler implements CommandHandler {
  async execute(command: ScenarioCommand, context: ExecutionContext): Promise<void> {
    const { core, eventBus, scenarioManager } = context
    const scenarioObject: any = command
    if (!scenarioObject || !scenarioObject.content) {
      throw new Error('Invalid scenario object for dialog handler.')
    }
    // ダイアログのテンプレートを読み込む
    // screen:loadイベント(isDialog:true)ハンドラ内で既存ダイアログの閉鎖も行われる
    await core.loadScreen(scenarioObject, {
      isDialog: true,
      skipBackground: true,
      skipBgm: true,
      fallbackTemplate: getDefaultDialogTemplate,
    })
    // dialog:showイベントを発行してダイアログのDOM操作をDefaultUIHandlerに委譲する
    await eventBus.emit('dialog:show', {
      content: scenarioObject.content,
      expandVariable: core.expandVariable.bind(core),
      addScenario: scenarioManager.addScenario.bind(scenarioManager),
    })
  }
}
