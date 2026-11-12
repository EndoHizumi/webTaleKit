import { CommandHandler } from '../core/CommandRegistry'

/** <label name="…" />：<jump to="…"> の飛び先の目印。実行しても何もしない */
export class LabelHandler implements CommandHandler {
  execute(): void {}
}
