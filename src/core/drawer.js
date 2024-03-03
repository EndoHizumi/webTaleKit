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
        this.ctx.canvas.height
      )
    }
    img.src = this.config.background
  }

  async drawText(scene) {
    const delay = 50
    const messageText = document.querySelector('#messageWindow p')
    if (scene.clear === undefined || scene.clear === true) {
      messageText.innerHTML = ''
    }
    const displayText = scene.msg.split('\n')
    for (const line of displayText) {
      for (const char of line) {
        await this.sleep(delay) // 50ミリ秒待機
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
    for (const choice of choices.items) {
      const button = document.createElement('div')
      button.className = 'choice'
      button.style.width = '100%'
      button.style.height = '50px'
      button.style.backgroundImage = 'url(./systemPicture/02_button/button.png)'
      button.style.textAlign = 'center'
      button.style.backgroundRepeat = 'no-repeat'
      button.style.backgroundPosition = 'center'
      button.style.paddingTop = '20px'
      button.style.color = 'black'
      button.addEventListener('mouseenter', function() {
        this.style.backgroundImage = 'url(./systemPicture/02_button/button2.png)' // マウスが要素の上にあるときの背景色
      })
      button.addEventListener('mouseleave', function() {
        this.style.backgroundImage = 'url(./systemPicture/02_button/button.png)' // マウスが要素から離れたときの背景色
      })
      button.addEventListener('mousedown', function() {
        this.style.backgroundImage = 'url(./systemPicture/02_button/button3.png)' // マウスが要素から離れたときの背景色
      })
      button.innerHTML = choice.label
      button.onclick = () => {
        choice.onSelect()
        selectId = choice.id
        isSelect = true
      }
      gameScreen.appendChild(button)
    }

    // 選択待ち
    return new Promise(resolve => {
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

    return new Promise(resolve => {
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

      document
        .body
        .addEventListener('keydown', (event) => { if (event.key === 'Enter') { clickHandler() } })
    })
  }

  // sleep関数
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
