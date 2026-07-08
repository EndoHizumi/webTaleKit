import { CommandHandler, ExecutionContext, ScenarioCommand } from '../core/CommandRegistry'

export class TextHandler implements CommandHandler {
  async execute(command: ScenarioCommand, context: ExecutionContext): Promise<void> {
    const { core, eventBus, drawer, scenarioManager } = context
    // 文章だけの場合は、contentプロパティに配列として設定する
    let scenarioObject: any = command
    if (typeof scenarioObject === 'string') scenarioObject = { content: [scenarioObject] }
    // httpレスポンスがある場合は、list.contentに追加して、表示対象に加える
    if (scenarioObject.then || scenarioObject.error) {
      scenarioObject.content = scenarioObject.content.concat(scenarioObject.then || scenarioObject.error)
    }

    //prettier-ignore
    core.onNextHandler = () => { drawer.isSkip = true }

    // text:clearイベントを発行してテキスト表示領域をクリアする
    await eventBus.emit('text:clear')

    // text:showイベントを発行してテキスト表示をDefaultUIHandlerに委譲する
    await eventBus.emit('text:show', {
      name: scenarioObject.name || '',
      content: scenarioObject.content,
      speed: core.isSkip ? 1 : scenarioObject.speed || 25,
      expandVariable: core.expandVariable.bind(core),
      waitFn: core.waitHandler.bind(core),
    })

    await core.waitHandler({ wait: scenarioObject.time })
    drawer.isSkip = false
    scenarioManager.setHistory(scenarioObject.content)
  }
}
