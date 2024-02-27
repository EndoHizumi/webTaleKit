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
    this.config = config
    const img = new Image()
    img.src = this.config.background
    img.onload = () => {
      this.ctx.drawImage(img, 0, 0, this.ctx.width, this.ctx.height)
    }
  }

  drawText (scene) {
    // テキストを描画する(座標は、読み込んだUIのHTMLのmessageBox要素に合わせる)
    // pタグをmessageBoxに追加する。
    const messageText = document.createElement('p')
    document.getElementById('messageBox').appendChild(messageText)
    // テキストは一文字ずつ描画する
    this.ctx.font = '20px serif'
    this.ctx.fillStyle = 'black'
    scene.text.split('').forEach((char, i) => {
      setTimeout(() => {
        messageText.innerHTML = messageText.innerHTML + char
      }, 100 * i)
    })
  }

  drawUI() {
    // UIを描画する
    // UI用のHTMLを読み込んで、DOMに追加する
    const ui = document.createElement('div')
    ui.innerHTML = axios
      .get('hhttp://127.0.0.1:8080/screen.html')
      .then((res) => {
        return res.data
      })
    document.body.appendChild(ui)
  }
}
