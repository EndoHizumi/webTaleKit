/*
 drawerの目的
  UIのHTMLとcanvasを描画する。
*/
export class Drawer {
  constructor () {
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

  setConfig (config) {
    // 背景画像をcanvasに描画する
    this.config = config
    const img = new Image()
    img.onload = () => {
      this.ctx.drawImage(img, 0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
    }
    img.src = this.config.background
  }

  drawText (scene) {
    // テキストを描画する(座標は、読み込んだUIのHTMLのmessageBox要素に合わせる)
    // テキストは一文字ずつ描画する
    const messageText = document.getElementById('messageWindow')
    messageText.innerHTML = ''
    this.ctx.font = '20px serif'
    this.ctx.fillStyle = 'black'
    scene.msg.split('').forEach((char, i) => {
      setTimeout(() => {
        messageText.innerHTML = messageText.innerHTML + char
      }, 100 * i)
    })
  }
}
