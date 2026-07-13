import { CommandHandler, ExecutionContext, ScenarioCommand } from '../core/CommandRegistry'

export class ShowHandler implements CommandHandler {
  async execute(command: ScenarioCommand, context: ExecutionContext): Promise<void> {
    const { core, drawer } = context
    const line: any = command
    const engineConfig = core.engineConfig
    // ムスタッシュ構文があるときは、変数の展開
    Object.keys(line).forEach((item) => {
      line[item] = core.expandVariable(line[item])
    })
    // 表示する画像の情報を管理オブジェクトに追加
    const modeList: Record<string, string> = { bg: 'background', cutin: '', chara: '', cg: 'background', effect: 'effect' }
    const key = Object.keys(modeList).includes(line.mode) ? modeList[line.mode] : line.name || line.src.split('/').pop()
    const baseLine = engineConfig.resolution.height / 2
    const centerPoint: Record<string, { x: number; y: number }> = {
      left: { x: engineConfig.resolution.width * 0.25, y: baseLine },
      center: { x: engineConfig.resolution.width * 0.5, y: baseLine },
      right: { x: engineConfig.resolution.width * 0.75, y: baseLine },
    }
    line.src = core.expandVariable(line.src) || line.name

    const image = await core.getImageObject(line)
    // 画像の表示位置を設定
    const position = { x: line.x || 0, y: line.y || 0 }
    // prettier-ignore
    let size = line.width && line.height ? { width: line.width, height: line.height } : { width: image.getSize().width, height: image.getSize().height }

    // line.modeが'cutin'の場合、center:middleのエイリアスを強制する
    if (line.mode === 'cutin') {
      line.pos = 'center:middle'
    }

    if (line.mode === 'cg') {
      core.tempImages = { ...core.displayedImages }
      core.displayedImages = { background: line.src }
      size = { width: engineConfig.resolution.width, height: engineConfig.resolution.height }
    }

    if (line.pos) {
      const pos = line.pos.split(':')
      const baseLines: Record<string, number> = {
        top: 0 + size.height,
        middle: engineConfig.resolution.height / 2,
        bottom: engineConfig.resolution.height - size.height,
      }
      // エイリアスが設定されている場合、画像の中心点を求めて、画像の表示位置を設定する
      position.x = centerPoint[pos[0]].x - size.width / 2
      if (pos[1] === 'middle') {
        position.y = baseLines[pos[1]] - size.height / 2
      } else if (pos[1]) {
        position.y = baseLines[pos[1]]
      } else {
        position.y = baseLine / 2
      }
    }
    core.displayedImages[key] = {
      image,
      pos: position,
      size: size,
      look: line.look,
      entry: line.entry,
    }

    if (line.sepia) core.displayedImages[key].image.setSepia(line.sepia)
    if (line.mono) core.displayedImages[key].image.setMonochrome(line.mono)
    if (line.blur) core.displayedImages[key].image.setBlur(line.blur)
    if (line.opacity) core.displayedImages[key].image.setOpacity(line.opacity)

    if (line.transition === 'fade') {
      // フェードイン効果で表示
      await drawer.fadeIn(line.duration || 2000, await core.getImageObject(line), {
        pos: position,
        size,
        look: line.look,
        entry: line.entry,
      })
      drawer.show(core.displayedImages)
    } else {
      // 通常の表示処理
      drawer.show(core.displayedImages)
    }
  }
}
