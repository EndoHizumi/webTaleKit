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
  private ctx!: CanvasRenderingContext2D
  private screenHtml!: HTMLElement
  private config: any
  private fadeCanvas!: HTMLCanvasElement
  private fadeCtx!: CanvasRenderingContext2D
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

    // canvasをDOMに追加する
    const canvas = document.createElement('canvas')
    canvas.width = resolution.width || 1280
    canvas.height = resolution.height || 720
    // canvasのコンテキストを取得する
    this.gameScreen.appendChild(canvas)
    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    // 黒で塗りつぶす
    this.ctx.fillStyle = 'black'
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
    // 初期ロード時にもスケールを調整
    this.adjustScale(this.gameScreen)

    // フェード用キャンバスをDOMに追加する
    this.fadeCanvas = document.createElement('canvas')
    this.fadeCanvas.className = 'fadeCanvas'
    this.fadeCanvas.style.position = 'absolute'
    this.fadeCanvas.style.top = '0'
    this.fadeCanvas.style.left = '0'
    this.fadeCanvas.style.pointerEvents = 'none' // クリックイベントを通過させる
    this.gameScreen.insertBefore(this.fadeCanvas, document.getElementById('messageWindow'))
    this.fadeCtx = this.fadeCanvas.getContext('2d')!
    // フェード用キャンバスのサイズを設定
    this.fadeCanvas.width = resolution.width
    this.fadeCanvas.height = resolution.height
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
    for (const char of text) {
      //prettier-ignore
      setTimeout(() => { this.readySkip = true, wait });
      // 100ミリ秒待ってから、スキップボタンが押されたら即座に表示
      if (!this.isSkip) {
        element.innerHTML += char
        await sleep(wait)
      } else {
        if (this.readySkip) {
          element.innerHTML += text.slice(element.textContent!.length)
          this.readySkip = false
          this.isSkip = false
          break
        }
      }
      await sleep(wait)
    }
  }

  async drawLineBreak() {
    // メッセージテキストに改行を追加する
    this.messageText.innerHTML += '<br>'
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
    if (choices.position == 'auto' || choices.position === undefined) {
      interactiveView.className = 'auto'
    } else {
      interactiveView.className = 'manual'
    }
    // 選択肢を表示
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
      button.style.width = '100%'
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
    ('Fade in', 'debug', duration)
    return this.fade(0, 1, duration, img, option)
  }

  async fadeOut(duration: number = 1000, img?: ImageObject, option?: object): Promise<void> {
    ('Fade out', 'debug', duration)
    return this.fade(1, 0, duration, img, option)
  }

  private fade(start: number, end: number, duration: number, img?: ImageObject, option?: any): Promise<void> {
    return new Promise<void>((resolve) => {
      const startTime = performance.now()
      const pos: { x: number; y: number } = option?.pos || {
        x: 0,
        y: 0,
      }
      const size: { width: number; height: number } = option?.size || { width: this.fadeCanvas.width, height: this.fadeCanvas.height }
      const reverse: boolean = option?.look || false

      const animate = (currentTime: number) => {
        const elapsedTime = currentTime - startTime
        const progress = Math.abs(Math.min(elapsedTime / duration, 1))
        const currentAlpha = start + (end - start) * progress

        this.fadeCtx.clearRect(0, 0, this.fadeCanvas.width, this.fadeCanvas.height)
        this.fadeCtx.globalAlpha = currentAlpha
        if (img) {
          this.drawCanvas(
            img,
            pos,
            size,
            reverse,
            this.fadeCtx,
          )
        } else {
          this.fadeCtx.fillRect(0, 0, this.fadeCanvas.width, this.fadeCanvas.height)
        }

        ('Fade animation', 'debug', { progress, alpha: currentAlpha })
        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          ('Fade animation complete', 'debug')
          this.clear(this.fadeCtx)
          resolve()
        }
      }

      requestAnimationFrame(animate)
    })
  }

  show(displayedImages: any) {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
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

  clear(ctx?: CanvasRenderingContext2D) {
    if (ctx === undefined) {
      ctx = this.ctx
    }
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  }

  drawCanvas(img: ImageObject, pos: any, size: any, reverse: any, ctx?: CanvasRenderingContext2D) {
    ('drawCanvas', 'debug', { img, pos, size, reverse })
    if (ctx === undefined) {
      ctx = this.ctx
    }
    const canvas = img.draw(reverse).getCanvas()
    // canvasから画像を取得して、this.ctxに描画
    ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, pos.x, pos.y, canvas.width, canvas.height) //CanvasRenderingContext2D.drawImage: Passed-in canvas is empty
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

    // ターゲット要素にスケールを適用
    targetElement.style.transform = `scale(${scale})`
  }

  setVisibility(name: string, isVisible: boolean) {
    const target = this.screenHtml.querySelector(name) as HTMLElement
    if (target) {
      target.style.visibility = isVisible ? 'visible' : 'hidden'
    }
  }
}
