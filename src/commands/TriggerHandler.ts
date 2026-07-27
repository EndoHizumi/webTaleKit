import { CommandHandler, ExecutionContext, ScenarioCommand } from '../core/CommandRegistry'
import { EventBus } from '../utils/eventBus'

/** rect="(x,y,w,h)" / circle="(cx,cy,r)" 形式の属性値を数値配列に変換する */
function parseTuple(value: unknown, length: number, attrName: string): number[] | null {
  if (value === undefined || value === null) return null
  let parts: unknown[]
  if (Array.isArray(value)) {
    parts = value
  } else if (typeof value === 'string') {
    parts = value.replace(/[()\s]/g, '').split(',')
  } else {
    return null
  }
  const nums = parts.map(Number)
  if (nums.length !== length || nums.some((n) => isNaN(n))) {
    throw new Error(`Error: <trigger> invalid ${attrName} attribute: "${value}"`)
  }
  return nums
}

/** once / all のようなブール属性の真偽判定（属性の存在＝true とみなす） */
export function isTruthyAttr(value: unknown): boolean {
  return value !== undefined && value !== null && value !== false && value !== 'false'
}

interface ActiveTrigger {
  domElement: HTMLElement // 生成した透明div、またはtarget要素
  event: string
  handler: EventListener
  pixiId?: string // Canvas側の視覚表示ID（styleあり時のみ）
  ownsElement: boolean // 透明divを自前生成したか（削除責務の判定）
  eventBus: EventBus
}

/**
 * <trigger> タグ — DOMイベントをWTSから扱うための非ブロッキング型タグ。
 * 登録して即returnし、シナリオループを止めない。
 * イベント検知はDOM層（透明div）、視覚表示はEventBus経由でCanvas層が担当する。
 */
export class TriggerHandler implements CommandHandler {
  private activeTriggers = new Map<string, ActiveTrigger>()

  async execute(command: ScenarioCommand, context: ExecutionContext): Promise<void> {
    const { core, eventBus, scenarioManager } = context

    if (!command.event || typeof command.event !== 'string') {
      throw new Error('Error: <trigger> requires an "event" attribute')
    }

    const id: string = command.id ? String(command.id) : `trigger_${Date.now()}`
    // 同一idの再登録は古いトリガーを解除して置き換える
    if (this.activeTriggers.has(id)) this.remove(id)

    const rect = parseTuple(command.rect, 4, 'rect')
    const circle = parseTuple(command.circle, 3, 'circle')

    // 排他制約: target と rect/circle、rect と circle は同時指定不可
    if (command.target && (rect || circle)) {
      throw new Error('Error: <trigger> "target" and "rect"/"circle" are mutually exclusive')
    }
    if (rect && circle) {
      throw new Error('Error: <trigger> "rect" and "circle" are mutually exclusive')
    }

    const cooldown = command.cooldown !== undefined ? Number(command.cooldown) : 500
    const once = isTruthyAttr(command.once)
    const style = command.style || 'none'
    const hitArea = rect
      ? { shape: 'rect', x: rect[0], y: rect[1], width: rect[2], height: rect[3] }
      : circle
        ? { shape: 'circle', cx: circle[0], cy: circle[1], r: circle[2] }
        : null
    let coolingDown = false

    // --- Canvas側: 視覚表示（styleがnone以外のとき、RenderBackendに描画を依頼する） ---
    if (hitArea && style !== 'none') {
      eventBus.emit('trigger:show', { id, hitArea, style })
    }

    // --- DOM側: イベント検知要素の解決 ---
    let el: HTMLElement
    let ownsElement = false

    if (command.target) {
      const found = document.querySelector(command.target) as HTMLElement | null
      if (!found) {
        throw new Error(`Error: <trigger> target element not found: "${command.target}"`)
      }
      el = found
    } else if (hitArea) {
      // 透明divを生成してホットスポットにする
      el = this.createHotspotElement(id, command, rect, circle)
      core.gameContainer.appendChild(el)
      ownsElement = true
    } else {
      el = core.gameContainer
    }

    const handler = (e: Event) => {
      if (coolingDown) return
      // 連打対策: クールダウン中の発火は無視する
      if (cooldown > 0) {
        coolingDown = true
        setTimeout(() => {
          coolingDown = false
        }, cooldown)
      }
      eventBus.emit(`trigger:fired:${id}`, { id, event: e })
      // 子要素をsub:true付きで現在行の次に挿入する（テキスト表示中には割り込まない）
      if (command.content) {
        scenarioManager.addScenario(command.content as ScenarioCommand[])
      }
      if (once) this.remove(id)
    }

    el.addEventListener(command.event, handler, once ? { once: true } : undefined)

    this.activeTriggers.set(id, {
      domElement: el,
      event: command.event,
      handler,
      pixiId: hitArea && style !== 'none' ? id : undefined,
      ownsElement,
      eventBus,
    })
    eventBus.emit('trigger:register', { id, event: command.event, hitArea, style })
    // ← await しない。即 return してシナリオは次の行へ進む
  }

  /**
   * 透明ホットスポット要素を生成する。
   * 座標は論理解像度基準で指定する。gameContainer自体がCSS transformで
   * スケーリングされるため、子要素は論理px指定のままリサイズに追従する。
   */
  private createHotspotElement(
    id: string,
    command: ScenarioCommand,
    rect: number[] | null,
    circle: number[] | null,
  ): HTMLElement {
    const el = document.createElement('div')
    el.id = `trigger-${id}`
    el.style.position = 'absolute'
    el.style.cursor = command.cursor || 'pointer'
    el.style.background = 'transparent'
    el.style.pointerEvents = 'auto'

    if (rect) {
      const [x, y, w, h] = [rect[0], rect[1], rect[2], rect[3]]
      el.style.left = `${x}px`
      el.style.top = `${y}px`
      el.style.width = `${w}px`
      el.style.height = `${h}px`
    } else if (circle) {
      const [cx, cy, r] = [circle[0], circle[1], circle[2]]
      el.style.left = `${cx - r}px`
      el.style.top = `${cy - r}px`
      el.style.width = `${r * 2}px`
      el.style.height = `${r * 2}px`
      el.style.borderRadius = '50%'
    }
    this.applyHoverEffect(el, command.style || 'none')
    return el
  }

  /**
   * style属性に応じて、マウスオーバー時にホットスポットを視覚的に強調する。
   * RenderBackend（Canvas層）の視覚表示が実装されるまでのDOM層での対応。
   * style="none"（デフォルト）は透明のまま（隠しスポット用）。
   * box-shadowベースなのでborderRadius（circle）にも追従する。
   */
  private applyHoverEffect(el: HTMLElement, style: string): void {
    if (style === 'none') return
    el.style.transition = 'box-shadow 0.15s ease, background-color 0.15s ease'
    const on = () => {
      if (style === 'border') {
        el.style.boxShadow = 'inset 0 0 0 3px rgba(255, 240, 150, 0.95)'
      } else if (style === 'glow') {
        el.style.boxShadow =
          '0 0 24px 8px rgba(255, 240, 150, 0.65), inset 0 0 18px 4px rgba(255, 240, 150, 0.45)'
      } else if (style === 'highlight') {
        el.style.background = 'rgba(255, 240, 150, 0.28)'
      }
    }
    const off = () => {
      el.style.boxShadow = ''
      el.style.background = 'transparent'
    }
    el.addEventListener('mouseenter', on)
    el.addEventListener('mouseleave', off)
  }

  /** トリガーを解除する（リスナー解除・透明divの削除・視覚表示の消去） */
  remove(id: string): void {
    const t = this.activeTriggers.get(id)
    if (!t) return
    t.domElement.removeEventListener(t.event, t.handler)
    if (t.ownsElement && t.domElement.parentNode) {
      t.domElement.parentNode.removeChild(t.domElement)
    }
    if (t.pixiId) t.eventBus.emit('trigger:hide', { id: t.pixiId })
    t.eventBus.emit('trigger:remove', { id })
    this.activeTriggers.delete(id)
  }

  /** 全トリガーを解除する（シーン遷移時のリスナーリーク防止にも使用） */
  removeAll(): void {
    Array.from(this.activeTriggers.keys()).forEach((id) => this.remove(id))
  }

  /** アクティブなトリガーのid一覧（デバッグ・テスト用） */
  getActiveTriggerIds(): string[] {
    return Array.from(this.activeTriggers.keys())
  }
}
