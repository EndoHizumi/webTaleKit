import { CommandHandler, CommandRegistry } from '../core/CommandRegistry'
import { TextHandler } from './TextHandler'
import { SayHandler } from './SayHandler'
import { ChoiceHandler } from './ChoiceHandler'
import { ShowHandler } from './ShowHandler'
import { HideHandler } from './HideHandler'
import { NewpageHandler } from './NewpageHandler'
import { JumpHandler } from './JumpHandler'
import { CallHandler } from './CallHandler'
import { MoveToHandler } from './MoveToHandler'
import { RouteHandler } from './RouteHandler'
import { IfHandler } from './IfHandler'
import { SoundHandler } from './SoundHandler'
import { WaitHandler } from './WaitHandler'
import { DialogHandler } from './DialogHandler'
import { SaveHandler } from './SaveHandler'
import { LoadHandler } from './LoadHandler'
import { TriggerHandler } from './TriggerHandler'
import { UntriggerHandler } from './UntriggerHandler'
import { AddHandler } from './AddHandler'
import { RemoveHandler } from './RemoveHandler'

export {
  TextHandler,
  SayHandler,
  ChoiceHandler,
  ShowHandler,
  HideHandler,
  NewpageHandler,
  JumpHandler,
  CallHandler,
  MoveToHandler,
  RouteHandler,
  IfHandler,
  SoundHandler,
  WaitHandler,
  DialogHandler,
  SaveHandler,
  LoadHandler,
  TriggerHandler,
  UntriggerHandler,
  AddHandler,
  RemoveHandler,
}

/**
 * 組み込みタグをまとめて登録するファクトリ。
 * 生成したハンドラ群を返すので、呼び出し側（Core）は
 * trigger のようにライフサイクル管理が必要なハンドラへの参照を保持できる。
 */
export function registerBuiltinCommands(registry: CommandRegistry): Record<string, CommandHandler> {
  const triggerHandler = new TriggerHandler()
  const handlers: Record<string, CommandHandler> = {
    text: new TextHandler(),
    say: new SayHandler(),
    choice: new ChoiceHandler(),
    show: new ShowHandler(),
    hide: new HideHandler(),
    newpage: new NewpageHandler(),
    jump: new JumpHandler(),
    call: new CallHandler(),
    moveto: new MoveToHandler(),
    route: new RouteHandler(),
    if: new IfHandler(),
    sound: new SoundHandler(),
    wait: new WaitHandler(),
    dialog: new DialogHandler(),
    save: new SaveHandler(),
    load: new LoadHandler(),
    trigger: triggerHandler,
    untrigger: new UntriggerHandler(triggerHandler),
    add: new AddHandler(),
    remove: new RemoveHandler(),
  }
  registry.registerAll(handlers)
  return handlers
}
