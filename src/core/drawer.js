import axios from 'axios'
/*
 drawerの目的
  UIのHTMLとcanvasを描画する。
*/
export class Drawer {
  constructor () {
    const game = document.getElementById('game')
    // canvasをDOMに追加する(800 x 600)
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 600
    // canvasのコンテキストを取得する
    game.appendChild(canvas)
    this.ctx = canvas.getContext('2d')
    // 黒で塗りつぶす
    this.ctx.fillStyle = 'black'
    this.ctx.fillRect(0, 0, this.ctx.width, this.ctx.height)
  }

  setConfig (config) {
    // 背景画像をcanvasに描画する
    console.log(config)
    this.config = config
    const img = new Image()
    img.src = this.config.background
    console.dir(img)
    img.onload = () => {
      console.log('load')
      this.ctx.drawImage(img, 0, 0, this.ctx.width, this.ctx.height)
    }
  }

  drawText (scene) {
    // テキストを描画する(座標は、読み込んだUIのHTMLのmessageBox要素に合わせる)
    // テキストは一文字ずつ描画する
    this.messageText.innerHTML = ''
    this.ctx.font = '20px serif'
    this.ctx.fillStyle = 'black'
    scene.msg.split('').forEach((char, i) => {
      setTimeout(() => {
        this.messageText.innerHTML = this.messageText.innerHTML + char
      }, 100 * i)
    })
  }

  async drawUI () {
    // UIを描画する
    // UI用のHTMLを読み込んで、DOMに追加する
    const ui = document.createElement('div')
    ui.innerHTML = await axios
      .get('http://127.0.0.1:8080/screen.html')
      .then((res) => {
        return res.data
      })
    document.body.appendChild(ui)
    // pタグをmessageBoxに追加する。
    this.messageText = document.createElement('p')
    document.getElementsByClassName('message-window')[0].appendChild(this.messageText)
  }
}
