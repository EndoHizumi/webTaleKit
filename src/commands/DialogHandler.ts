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
    // <action if="…"> の条件が false のボタンは出さない（<choice> の <item if> と同じ）。
    // 元の行は書き換えず、写しを渡す（同じダイアログを開き直したとき、そのときの条件で選び直すため）
    const visible = (action: any) => action?.type !== 'action' || action.if === undefined || core.executeCode(`return ${action.if}`)
    const content = scenarioObject.content.map((item: any) =>
      item?.type === 'actions' && Array.isArray(item.content) ? { ...item, content: item.content.filter(visible) } : item,
    )
    // dialog:showイベントを発行してダイアログのDOM操作をDefaultUIHandlerに委譲する
    await eventBus.emit('dialog:show', {
      content,
      expandVariable: core.expandVariable.bind(core),
      addScenario: scenarioManager.addScenario.bind(scenarioManager),
    })
  }
}
