import { ImageObject } from '../resource/ImageObject.js'

/*
 drawerの目的
  UIのHTMLとcanvasを描画する。
*/
export class Drawer {
  private gameScreen: HTMLElement;
  private messageText: HTMLElement;
  private waitCircle: HTMLElement;
  private interactiveView: HTMLElement;
  private ctx: CanvasRenderingContext2D;
  private config: any;

  constructor(gameContainer: HTMLElement) {
    this.gameScreen = gameContainer
    this.messageText = this.gameScreen.querySelector('#messageView')
    this.waitCircle = this.gameScreen.querySelector('#waitCircle')
    this.interactiveView = this.gameScreen.querySelector('#interactiveView')

    // canvasをDOMに追加する(800 x 600)
    const canvas = document.createElement('canvas')
    canvas.width = 1280
    canvas.height = 720
    // canvasのコンテキストを取得する
    this.gameScreen.appendChild(canvas)
    this.ctx = canvas.getContext('2d')
    // 黒で塗りつぶす
    this.ctx.fillStyle = 'black'
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
    // ウィンドウのリサイズ時にスケールを調整
    window.addEventListener('resize', () => this.adjustScale(this.gameScreen))

    // 初期ロード時にもスケールを調整
    this.adjustScale(this.gameScreen)
  }

  setConfig(config: any) {
    // 背景画像をcanvasに描画する
    this.config = config
    const img = new Image()
    img.onload = () => {
      this.ctx.drawImage(
        img,
        0,
        0,
        this.ctx.canvas.width,
        this.ctx.canvas.height,
      )
    }
    img.src = this.config.background
  }

  async drawText(scene: any) {
    let isSkip = false
    // Enterキーが押されたら全文表示
    setTimeout(() => {
      document.addEventListener('keydown', function eventHandler(event) {
        if (event.key === 'Enter') {
          isSkip = true
          document.removeEventListener('keydown', eventHandler) // イベントリスナーを削除
        }
      })
    }, 100)
    if (scene.clear === undefined || scene.clear === true) {
      this.messageText.innerHTML = ''
    }
    const displayText = scene.msg.split('\n')
    for (const line of displayText) {
      for (const char of line) {
        if (isSkip) {
          this.messageText.innerHTML = ''
          this.messageText.innerHTML += line
          isSkip = false
          break
        }
        await this.sleep(50) // 50ミリ秒待機
        this.messageText.innerHTML += char
      }
      if (
        scene.wait === undefined ||
        scene.wait === true ||
        typeof scene.wait === 'number'
      ) {
        if (typeof scene.wait === 'number') {
          await this.sleep(scene.wait)
        } else {
          // 改行ごとにクリック待ち
          await this.clickWait()
        }
      }
    }
  }

  async drawChoices(choices: any) {
    let isSelect = false
    let selectId = 0
    let onSelect = 0
    // 選択肢のタイトルを表示
    this.messageText.innerHTML = choices.prompt

    // 選択肢を表示
    for (const choice of choices.items) {
      const backgroundImages =
        choices.src !== undefined ? choices.src : choice.src
        console.log(backgroundImages)
      const defaultImage =
        backgroundImages?.default !== undefined
          ? backgroundImages.default
          : './resource/system/systemPicture/02_button/button.png'
      const hoverImage =
        backgroundImages?.hover !== undefined
          ? backgroundImages.hover
          : './resource/system/systemPicture/02_button/button2.png'
      const selectImage =
        backgroundImages?.select !== undefined
          ? backgroundImages.select
          : './resource/system/systemPicture/02_button/button3.png'
      const button = document.createElement('div')
      button.className = 'choice'
      button.style.color = choice.color !== undefined ? choice.color.default : 'black'
      button.style.width = '100%'
      button.style.height = '50px'
      button.style.backgroundImage = `url(${defaultImage})`
      button.style.textAlign = 'center'
      button.style.backgroundRepeat = 'no-repeat'
      button.style.backgroundPosition = 'center'
      button.style.paddingTop = '20px'
      button.addEventListener('mouseenter', function() {
        // マウスが要素の上にあるときの背景色
        this.style.backgroundImage = `url(${hoverImage})`
        this.style.color = choice.color !== undefined ? choice.color.hover : 'black'
      })
      button.addEventListener('mouseleave', function() {
        // マウスが要素から離れたときの背景色
        this.style.backgroundImage = `url(${defaultImage})`
        this.style.color = choice.color !== undefined ? choice.color.default : 'black'
      })
      button.addEventListener('mousedown', function() {
        // マウスが要素を選択したときの背景色
        this.style.backgroundImage = `url(${selectImage})`
        this.style.color = choice.color !== undefined ? choice.color.select : 'black'
      })
      button.innerHTML = choice.label
      button.onclick = () => {
        this.interactiveView.querySelectorAll('.choice').forEach((element) => {
          element.parentNode.removeChild(element)
        })
        selectId = choice.id
        onSelect = choice.onSelect
        isSelect = true
      }
      this.interactiveView.appendChild(button)
    }

    // 選択待ち
    return new Promise((resolve) => {
      const intervalId = setInterval(() => {
        if (isSelect) {
          clearInterval(intervalId)
          resolve({selectId, onSelect})
        }
      }, 100)
    })
  }

  
  show(img: any, pos = { x: 0, y: 0 }, size:any, reverse = false, entry = { time: 1, wait: false }) {
      // 表示開始までの遅延処理
      if (entry.wait) {
        setTimeout(() => {
          this.drawCanvas(img, pos, size, reverse)
        }, entry.time * 1000);
      } else {
        this.drawCanvas(img, pos, size, reverse);
      }
  }

  drawCanvas(img: ImageObject, pos: any, size: any, reverse: any) {
    const canvas = img.draw(reverse);
    // canvasから画像を取得して、this.ctxに描画
    const imageWidth = size !== undefined ? size.width : canvas.width;
    const imageHeight = size !== undefined ? size.height : canvas.height;
    this.ctx.drawImage(canvas, 0,0, canvas.width, canvas.height, pos.x, pos.y, imageWidth, imageHeight);
  }
  // クリック待ち処理
  clickWait() {
    this.waitCircle.style.visibility = 'visible'

    return new Promise((resolve) => {
      const clickHandler = () => {
        this.gameScreen.removeEventListener('click', clickHandler)
        this.waitCircle.style.visibility = 'hidden'
        resolve(null)
      }
      this.gameScreen.addEventListener('click', clickHandler)

      document.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          clickHandler()
        }
      })
    })
  }

  // sleep関数
  sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  adjustScale(targetElement: HTMLElement) {
    // ターゲット要素の元の幅と高さ
    const originalWidth = targetElement.scrollWidth; // 例: 1280px
    const originalHeight = targetElement.scrollHeight; // 例: 720px
  
    // ビューポートの幅と高さを取得
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
  
    // 幅と高さのスケールを計算
    const scaleX = viewportWidth / originalWidth;
    const scaleY = viewportHeight / originalHeight;
  
    // 幅と高さのうち、小さい方のスケールを選択（アスペクト比を維持）
    const scale = Math.min(scaleX, scaleY);

    // ターゲット要素にスケールを適用
    targetElement.style.transform = `scale(${scale})`;
  }
}