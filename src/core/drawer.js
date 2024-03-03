/*
 drawerの目的
  UIのHTMLとcanvasを描画する。
*/
export class Drawer {
  constructor() {
    this.game = document.getElementById('gameContainer')
    // canvasをDOMに追加する(800 x 600)
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 600
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
    const messageText = document.querySelector('#messageWindow p')
    if (scene.clear === undefined || scene.clear === true) {
      messageText.innerHTML = ''
    }

    const displayText = scene.msg.split('\n')
    for (const line of displayText) {
      for (const char of line) {
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
    })
  }

  // sleep関数
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
