import { CommandHandler, ScenarioCommand } from '../core/CommandRegistry'
import { TriggerHandler, isTruthyAttr } from './TriggerHandler'

/** <untrigger> タグ — id指定または all で <trigger> の登録を解除する */
export class UntriggerHandler implements CommandHandler {
  constructor(private triggerHandler: TriggerHandler) {}

  execute(command: ScenarioCommand): void {
    if (isTruthyAttr(command.all)) {
      this.triggerHandler.removeAll()
    } else if (command.id) {
      this.triggerHandler.remove(command.id)
    }
  }
}
