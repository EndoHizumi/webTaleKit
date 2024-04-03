export class ImageObject {
  // 表示済みの画像を管理するクラス
  private image: any = null
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D

  constructor() {
    // 画像の読み込みと表示処理
    this.image = new Image()
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D
  }

  getImage() {
    return this.image
  }

  setImage(img: HTMLImageElement) {
    // 画像の読み込みと表示処理
    this.image = img
    return this
  }

  getCanvas() {  
    return this.canvas
  }

  setCanvas(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    return this
  }

  getSize(){
    return {width: this.image.width, height: this.image.height}
  }

  async setImageAsync(src: string): Promise<ImageObject> {
    // 画像の読み込みと表示処理
    this.image.src = src
    return new Promise((resolve, reject) => {
      this.image.onload = () => {
        console.log('画像の読み込みに成功しました')
        this.canvas.width = this.image.width
        this.canvas.height = this.image.height
        resolve(this)
      }
      this.image.onError = () => {
        console.error('画像の読み込みに失敗しました')
        reject(new Error('画像の読み込みに失敗しました'));
      }
    })
  }

  draw(reverse = false): ImageObject {// FIXME: this.imageの中身が空になってる??
    console.log('draw')
    console.log('reverse:', reverse)
    console.dir('ImageObject.draw:', this.image)
    if (reverse) {
      this.ctx.save();
      this.ctx.scale(-1, 1);
      this.ctx.drawImage(this.image, -this.image.width,0);
      this.ctx.restore();
    } else {
      this.ctx.drawImage(this.image, 0, 0); 
    }
    return this
  }

  // 画像の透明度を変更
  setOpacity(opacity: number): ImageObject {
    this.ctx.drawImage(this.image, 0, 0)
    // 透明度を設定
    this.ctx.globalAlpha = opacity
    return this
  }

  // アニメーション(フェードイン/フェードアウト)

  // セピア化
  setSepia(num = 100): ImageObject {
    this.ctx.drawImage(this.image, 0, 0)
    // フィルターをかける
    this.ctx.filter = `sepia(${num}%)}`
    // 画像データを取得
    return this
  }

  // モノクロ化
  setMonochrome(num = 100): ImageObject {
    this.ctx.drawImage(this.image, 0, 0)
    // フィルターをかける
    this.ctx.filter = `grayscale(${num}%)`
    // 画像データを取得
    return this
  }

  // ぼかし
  setBlur(num = 2): ImageObject {
    this.ctx.drawImage(this.image, 0, 0)
    // フィルターをかける
    this.ctx.filter = `blur(${num}px)`
    // 画像データを取得
   return this
  }

  // フィルターの解除
  clearFilter(): ImageObject {
    this.ctx.drawImage(this.image, 0, 0)
    // フィルターをかける
    this.ctx.filter = 'none'
    // 画像データを取得
    return this
  }
}
