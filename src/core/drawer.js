/*
 drawerの目的
  UIのHTMLとcanvasを描画する。
*/
export class Drawer {
  constructor() {
    this.game = document.getElementById('gameContainer')
    // canvasをDOMに追加する(800 x 600)
    const canvas = document.createElement('canvas')
    canvas.width = 1280
    canvas.height = 720
    // canvasのコンテキストを取得する
    this.game.appendChild(canvas)
    this.ctx = canvas.getContext('2d')
    // 黒で塗りつぶす
    this.ctx.fillStyle = 'black'
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
    // ウィンドウのリサイズ時にスケールを調整
    window.addEventListener('resize', this.adjustScale)

    // 初期ロード時にもスケールを調整
    this.adjustScale()
  }

  setConfig(config) {
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

  async drawText(scene) {
    let isSkip = false
    const messageText = document.querySelector('#messageWindow p')
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
      messageText.innerHTML = ''
    }
    const displayText = scene.msg.split('\n')
    for (const line of displayText) {
      for (const char of line) {
        if (isSkip) {
          messageText.innerHTML = ''
          messageText.innerHTML += line
          isSkip = false
          break
        }
        await this.sleep(50) // 50ミリ秒待機
        messageText.innerHTML += char
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

  async drawChoices(choices) {
    let isSelect = false
    let selectId = 0
    // 選択肢のタイトルを表示
    const messageText = document.querySelector('#messageWindow p')
    messageText.innerHTML = choices.prompt

    // 選択肢を表示
    const gameScreen = document.getElementById('gameScreen')
    console.log(choices)
    for (const choice of choices.items) {
      const backgroundImages =
        choices.src !== undefined ? choices.src : choice.src
        console.log(backgroundImages)
      const defaultImage =
        backgroundImages?.default !== undefined
          ? backgroundImages.default
          : './systemPicture/02_button/button.png'
      const hoverImage =
        backgroundImages?.hover !== undefined
          ? backgroundImages.hover
          : './systemPicture/02_button/button2.png'
      const selectImage =
        backgroundImages?.select !== undefined
          ? backgroundImages.select
          : './systemPicture/02_button/button3.png'
      const button = document.createElement('div')
      button.className = 'choice'
      console.log(choice.color !== undefined ? choice.color.default : 'black')
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
        choice.onSelect()
        document.querySelectorAll('.choice').forEach((element) => {
          element.parentNode.removeChild(element)
        })
        selectId = choice.id
        isSelect = true
      }
      gameScreen.appendChild(button)
    }

    // 選択待ち
    return new Promise((resolve) => {
      const intervalId = setInterval(() => {
        if (isSelect) {
          clearInterval(intervalId)
          resolve(selectId)
        }
      }, 100)
    })
  }

  // クリック待ち処理
  clickWait() {
    const waitCircle = document.getElementById('wait')
    waitCircle.style.visibility = 'visible'

    return new Promise((resolve) => {
      const clickHandler = () => {
        document
          .getElementById('gameContainer')
          .removeEventListener('click', clickHandler)
        waitCircle.style.visibility = 'hidden'
        resolve()
      }
      document
        .getElementById('gameContainer')
        .addEventListener('click', clickHandler)

      document.body.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          clickHandler()
        }
      })
    })
  }

  // sleep関数
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  adjustScale() {
    // ターゲット要素の元の幅と高さ
    const originalWidth = 1280; // 例: 1280px
    const originalHeight = 720; // 例: 720px
  
    // ビューポートの幅と高さを取得
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
  
    // 幅と高さのスケールを計算
    const scaleX = viewportWidth / originalWidth;
    const scaleY = viewportHeight / originalHeight;
  
    // 幅と高さのうち、小さい方のスケールを選択（アスペクト比を維持）
    const scale = Math.min(scaleX, scaleY);

    // ターゲット要素にスケールを適用
    const targetElement = document.getElementById('gameContainer');
    targetElement.style.transform = `scale(${scale})`;
  }
}
