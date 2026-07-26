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
    // 画像の表示位置を設定するための画面上の基準点を定義
    const baseLine = engineConfig.resolution.height / 2
    const centerPoint: Record<string, { x: number; y: number }> = {
      left: { x: engineConfig.resolution.width * 0.25, y: baseLine },
      center: { x: engineConfig.resolution.width * 0.5, y: baseLine },
      right: { x: engineConfig.resolution.width * 0.75, y: baseLine },
    }
    line.src = core.expandVariable(line.src)

    const sourceImage = core.displayedImages[key]
    const activeImage = sourceImage
      ? { ...sourceImage, pos: { ...sourceImage.pos }, size: { ...sourceImage.size } }
      : { image: null, pos: { x: 0, y: 0 }, size: { width: 0, height: 0 }, look: '', entry: '', 'z-index': 0 }
    // srcが指定されておらず既存画像がある場合はそのまま再利用し、srcが変わった場合のみ読み込み直す
    if (!activeImage.image || (line.src && activeImage.src !== line.src)) {
      activeImage.image = await core.getImageObject({ ...line, src: line.src || activeImage.src })
    }
    activeImage.src = line.src ? line.src : activeImage.src
    // 画像の表示位置を設定（座標指定がある場合はそれを優先、ない場合はdisplayImages.posの値を参照して設定）
    activeImage.pos.x = line.x || activeImage.pos.x || 0
    activeImage.pos.y = line.y || activeImage.pos.y || 0
    activeImage.size.width = line.width || activeImage.size.width || activeImage.image.getSize().width
    activeImage.size.height = line.height || activeImage.size.height || activeImage.image.getSize().height

    // charaモード（modeが未指定の場合も含む、bg/cg/cutin/effect以外）でwidth/heightが未指定の場合、
    // 解像度に収まるようアスペクト比を保って自動縮小する（拡大はしない）
    const isCharaLikeMode = !['bg', 'cg', 'cutin', 'effect'].includes(line.mode)
    if (isCharaLikeMode && !line.width && !line.height) {
      const naturalSize = activeImage.image.getSize()
      const fitScale = Math.min(
        engineConfig.resolution.width / naturalSize.width,
        engineConfig.resolution.height / naturalSize.height,
        1
      )
      activeImage.size.width = naturalSize.width * fitScale
      activeImage.size.height = naturalSize.height * fitScale
    }

    activeImage.look = line.look || activeImage.look || ''
    activeImage.entry = line.entry || activeImage.entry || ''
    activeImage['z-index'] = line['z-index'] || activeImage['z-index'] || 0

    // line.modeが'cutin'の場合、center:middleのエイリアスを強制する
    if (line.mode === 'cutin') {
      line.pos = 'center:middle'
    }

    // line.modeが'cg'の場合、表示済み画像を一時的に保存して、表示する画像を背景画像として設定する
    if (line.mode === 'cg') {
      core.tempImages = { ...core.displayedImages }
      core.displayedImages = { background: line.src }
      activeImage.size = { width: engineConfig.resolution.width, height: engineConfig.resolution.height }
    }

    if (line.pos) {
      const pos = line.pos.split(':')
      const baseLines: Record<string, number> = {
        top: 0 + activeImage.size.height,
        middle: engineConfig.resolution.height / 2,
        bottom: engineConfig.resolution.height - activeImage.size.height,
      }
      // エイリアスが設定されている場合、画像の中心点を求めて、画像の表示位置を設定する
      activeImage.pos.x = centerPoint[pos[0]].x - activeImage.size.width / 2
      if (pos[1] === 'middle') {
        activeImage.pos.y = baseLines[pos[1]] - activeImage.size.height / 2
      } else if (pos[1]) {
        activeImage.pos.y = baseLines[pos[1]]
      } else {
        activeImage.pos.y = baseLines['middle'] - activeImage.size.height / 2
      }
    }

    if (line.sepia) activeImage.image.setSepia(line.sepia)
    if (line.mono) activeImage.image.setMonochrome(line.mono)
    if (line.blur) activeImage.image.setBlur(line.blur)
    if (line.opacity) activeImage.image.setOpacity(line.opacity)

    core.displayedImages[key] = activeImage

    if (line.transition === 'fade') {
      // フェードイン効果で表示
      await drawer.fadeIn(line.duration || 2000, await core.getImageObject(line), {
        pos: activeImage.pos,
        size: activeImage.size,
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
