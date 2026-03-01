import * as PIXI from 'pixi.js'
import { ImageObject } from '../resource/ImageObject'
import { sleep } from '../utils/waitUtil'

/*
 drawerの目的
  UIのHTMLとcanvasを描画する。
*/
export class Drawer {
  private gameScreen: HTMLElement
  private nameView!: HTMLElement
  private messageText!: HTMLElement
  private interactiveView!: HTMLElement
  private screenHtml!: HTMLElement
  private config: any
  private app!: PIXI.Application
  private imageContainer!: PIXI.Container
  private fadeContainer!: PIXI.Container
  isSkip: boolean = false
  readySkip: boolean = false

  constructor(gameContainer: HTMLElement) {
    this.gameScreen = gameContainer
    // ウィンドウのリサイズ時にスケールを調整
    window.addEventListener('resize', () => this.adjustScale(this.gameScreen))
    // 初期ロード時にもスケールを調整
    this.adjustScale(this.gameScreen)
  }

  setScreen(screenHtml: HTMLElement, resolution: { width: number; height: number }) {
    this.screenHtml = screenHtml
    this.nameView = screenHtml.querySelector('#nameView') as HTMLElement
    this.messageText = screenHtml.querySelector('#messageView') as HTMLElement
    this.interactiveView = screenHtml.querySelector('#interactiveView') as HTMLElement

    const width = resolution.width || 1280
    const height = resolution.height || 720

    // Pixi.js Applicationを作成する
    this.app = new PIXI.Application({
      width,
      height,
      backgroundColor: 0x000000,
    })
    // Pixi.jsのcanvasをDOMに追加する
    this.gameScreen.appendChild(this.app.view as HTMLCanvasElement)

    // 画像表示用コンテナとフェード用コンテナをステージに追加する
    this.imageContainer = new PIXI.Container()
    this.fadeContainer = new PIXI.Container()
    this.app.stage.addChild(this.imageContainer)
    this.app.stage.addChild(this.fadeContainer)

    // 初期ロード時にもスケールを調整
    this.adjustScale(this.gameScreen)
  }

  drawName(name: string) {
    this.nameView.innerHTML = name
  }

  async drawText(text: string, wait: number, containerElement?: HTMLElement) {
    let element: HTMLElement = this.messageText
    // テキストを表示するコンテナ要素を指定した場合は、その要素に追加する
    if (containerElement) {
      this.messageText.appendChild(containerElement)
      element = containerElement
    }

    // パフォーマンス最適化: テキストノードを使用してDOM再構築を回避
    const textNode = document.createTextNode('')
    element.appendChild(textNode)

    let displayedLength = 0
    for (const char of text) {
      //prettier-ignore
      setTimeout(() => { this.readySkip = true, wait });
      // 100ミリ秒待ってから、スキップボタンが押されたら即座に表示
      if (!this.isSkip) {
        textNode.textContent += char
        displayedLength++
        await sleep(wait)
      } else {
        if (this.readySkip) {
          textNode.textContent += text.slice(displayedLength)
          this.readySkip = false
          this.isSkip = false
          break
        }
      }
      await sleep(wait)
    }
  }

  async drawLineBreak() {
    // パフォーマンス最適化: createElement を使用
    const br = document.createElement('br')
    this.messageText.appendChild(br)
  } 

  clearText() {
    if (this.messageText) {
      this.messageText.innerHTML = ''
    }
  }

  createDecoratedElement(element: any): HTMLElement {
    switch (element.type) {
      case 'color':
        const span = document.createElement('span')
        span.style.color = element.value
        return span
      case 'ruby':
        const ruby = document.createElement('ruby')
        const rt = document.createElement('rt')
        rt.textContent = element.text
        ruby.appendChild(rt)
        return ruby
      case 'b':
        return document.createElement('strong')
      case 'i':
        return document.createElement('i')
      default:
        return document.createElement('span')
    }
  }

  async drawChoices(choices: any): Promise<{ selectId: number; onSelect: any }> {
    let isSelect = false
    let selectId = 0
    let onSelect = 0

    // 選択肢ボタンの配置を設定する
    const interactiveView = document.querySelector('#interactiveView') as HTMLElement
    const CHOICE_HEIGHT = 50 // 1つの選択肢の高さ（px） - button.style.heightと一致させる必要がある
    const TWO_COLUMN_THRESHOLD = 6 // 2列レイアウトに切り替える選択肢の数

    if (choices.position == 'auto' || choices.position === undefined) {
      interactiveView.className = 'auto'
      
      // 選択肢の数に応じてレイアウトを調整
      const choiceCount = choices.content.length
      
      if (choiceCount >= TWO_COLUMN_THRESHOLD) {
        // 6つ以上の選択肢がある場合、2列レイアウトに切り替え
        interactiveView.style.flexWrap = 'wrap'
        interactiveView.style.columnGap = '20px' // 列間の余白を減らす
        interactiveView.style.alignContent = 'center'
      } else {
        // 少数の選択肢の場合、通常通り表示
        interactiveView.style.flexWrap = 'wrap'
        interactiveView.style.columnGap = ''
        interactiveView.style.alignContent = 'center'
      }
    } else {
      interactiveView.className = 'manual'
    }
    // 選択肢を表示
    const choiceCount = choices.content.length
    const useTwoColumns = choiceCount >= TWO_COLUMN_THRESHOLD
    
    for (const choice of choices.content) {
      const defaultImage =
        choice.default !== undefined ? choice.default : './src/resource/system/systemPicture/02_button/button.png'
      const hoverImage =
        choice.hover !== undefined ? choice.hover : './src/resource/system/systemPicture/02_button/button2.png'
      const selectImage =
        choice.select !== undefined ? choice.select : './src/resource/system/systemPicture/02_button/button3.png'
      const button = document.createElement('div')
      button.className = 'choice'
      if (interactiveView.className == 'manual') {
        button.style.position = 'absolute'
        button.style.top = choice.position?.y || 0
        button.style.left = choice.position?.x || 0
      }
      button.style.color = choice.color !== undefined ? choice.color.default : 'black'
      // 2列レイアウトの場合は幅を調整
      button.style.width = useTwoColumns ? 'calc(50% - 10px)' : '100%'
      button.style.height = '50px'
      button.style.backgroundImage = `url(${defaultImage})`
      button.style.textAlign = 'center'
      button.style.backgroundRepeat = 'no-repeat'
      button.style.backgroundPosition = 'center'
      button.style.paddingTop = '20px'
      button.addEventListener('mouseenter', function () {
        // マウスが要素の上にあるときの背景色
        this.style.backgroundImage = `url(${hoverImage})`
        this.style.color = choice.color !== undefined ? choice.color.hover : 'black'
      })
      button.addEventListener('mouseleave', function () {
        // マウスが要素から離れたときの背景色
        this.style.backgroundImage = `url(${defaultImage})`
        this.style.color = choice.color !== undefined ? choice.color.default : 'black'
      })
      button.addEventListener('mousedown', function () {
        // マウスが要素を選択したときの背景色
        this.style.backgroundImage = `url(${selectImage})`
        this.style.color = choice.color !== undefined ? choice.color.select : 'black'
      })
      button.innerHTML = choice.label
      button.onclick = () => {
        this.interactiveView.querySelectorAll('.choice').forEach((element) => {
          element.parentNode?.removeChild(element)
        })
        selectId = choice.id
        onSelect = choice.content
        isSelect = true
      }
      this.interactiveView.appendChild(button)
    }

    // 選択待ち
    return new Promise((resolve) => {
      const intervalId = setInterval(() => {
        if (isSelect) {
          clearInterval(intervalId)
          resolve({ selectId, onSelect })
        }
      }, 100)
    })
  }

  async fadeIn(duration: number = 1000, img?: ImageObject, option?: object): Promise<void> {
    return this.fade(0, 1, duration, img, option)
  }

  async fadeOut(duration: number = 1000, img?: ImageObject, option?: object): Promise<void> {
    return this.fade(1, 0, duration, img, option)
  }

  private fade(start: number, end: number, duration: number, img?: ImageObject, option?: any): Promise<void> {
    return new Promise<void>((resolve) => {
      const startTime = performance.now()
      const pos: { x: number; y: number } = option?.pos || {
        x: 0,
        y: 0,
      }
      const size: { width: number; height: number } = option?.size || {
        width: this.app.screen.width,
        height: this.app.screen.height,
      }
      const reverse: boolean = option?.look || false

      // フェード用コンテナをクリアして、対象スプライトを追加する
      this.fadeContainer.removeChildren()
      if (img) {
        this.drawCanvas(img, pos, size, reverse, this.fadeContainer)
      } else {
        const graphics = new PIXI.Graphics()
        graphics.beginFill(0x000000)
        graphics.drawRect(0, 0, size.width, size.height)
        graphics.endFill()
        this.fadeContainer.addChild(graphics)
      }

      const animate = (currentTime: number) => {
        const elapsedTime = currentTime - startTime
        const progress = Math.abs(Math.min(elapsedTime / duration, 1))
        const currentAlpha = start + (end - start) * progress

        this.fadeContainer.alpha = currentAlpha

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          this.fadeContainer.removeChildren()
          resolve()
        }
      }

      requestAnimationFrame(animate)
    })
  }

  show(displayedImages: any) {
    this.imageContainer.removeChildren()
    for (let key in displayedImages) {
      const img: ImageObject = displayedImages[key].image
      const pos: { x: number; y: number } = displayedImages[key].pos || {
        x: 0,
        y: 0,
      }
      const size: { width: number; height: number } = displayedImages[key].size
      const reverse: boolean = displayedImages[key].look || false
      const entry: { time: number; wait: boolean } = displayedImages[key].entry || { time: 1, wait: false }
      if (entry.wait) {
        // 表示開始までの遅延処理
        setTimeout(() => {
          this.drawCanvas(img, pos, size, reverse)
        }, entry.time * 1000)
      } else {
        this.drawCanvas(img, pos, size, reverse)
      }
    }
    this.adjustScale(this.gameScreen)
  }

  moveTo(name: string, displayedImages: any, pos: { x: number; y: number }, durning: number) {
    return new Promise((resolve) => {
      const target = displayedImages[name]
      const startPos = { x: target.pos.x, y: target.pos.y }
      const dest = { x: startPos.x + Number(pos.x), y: startPos.y + Number(pos.y) }
      const startTime = performance.now()

      const move = (currentTime: any) => {
        const elapsedTime = (currentTime - startTime) / 1000 // 秒単位の経過時間
        const progress = Math.min(elapsedTime / durning, 1) // 0から1の進捗

        target.pos.x = startPos.x + (dest.x - startPos.x) * progress
        target.pos.y = startPos.y + (dest.y - startPos.y) * progress

        this.show(displayedImages)

        if (progress < 1) {
          window.requestAnimationFrame(move)
        } else {
          // 最終位置を正確に設定
          target.pos.x = dest.x
          target.pos.y = dest.y
          this.show(displayedImages)
          resolve(null)
        }
      }

      window.requestAnimationFrame(move)
    })
  }

  clear() {
    this.imageContainer.removeChildren()
  }

  drawCanvas(img: ImageObject, pos: any, size: any, reverse: any, container?: PIXI.Container) {
    if (container === undefined) {
      container = this.imageContainer
    }
    const canvas = img.draw(reverse).getCanvas()
    // ImageObjectのcanvasは描画のたびに更新されるため、キャッシュを回避して
    // 常に最新のcanvas内容からテクスチャを生成してスプライトとして描画する
    const baseTexture = new PIXI.BaseTexture(canvas)
    const texture = new PIXI.Texture(baseTexture)
    const sprite = new PIXI.Sprite(texture)
    sprite.x = pos.x
    sprite.y = pos.y
    container.addChild(sprite)
  }

  adjustScale(targetElement: HTMLElement) {
    // ターゲット要素の元の幅と高さ
    const originalWidth = targetElement.scrollWidth // 例: 1280px
    const originalHeight = targetElement.scrollHeight // 例: 720px

    // ビューポートの幅と高さを取得
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // 幅と高さのスケールを計算
    const scaleX = viewportWidth / originalWidth
    const scaleY = viewportHeight / originalHeight

    // 幅と高さのうち、小さい方のスケールを選択（アスペクト比を維持）
    const scale = Math.min(scaleX, scaleY)

    // スケール後のサイズを計算
    const scaledWidth = originalWidth * scale
    const scaledHeight = originalHeight * scale

    // 中央配置のための位置を計算
    const offsetX = (viewportWidth - scaledWidth) / 2
    const offsetY = (viewportHeight - scaledHeight) / 2

    // ターゲット要素にスケールと位置を適用
    targetElement.style.transformOrigin = 'top left'
    targetElement.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`
  }

  setVisibility(name: string, isVisible: boolean) {
    const target = this.screenHtml.querySelector(name) as HTMLElement
    if (target) {
      target.style.visibility = isVisible ? 'visible' : 'hidden'
    }
  }
}
