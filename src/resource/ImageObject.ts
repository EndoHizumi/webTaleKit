export class ImageObject {
  // 表示済みの画像を管理するクラス
  private image: any = null
  private imagePromise: any = null

  constructor() {
    // 画像の読み込みと表示処理
    this.image = new Image()
  }

  getImage() {
    return this.image
  }

  setImage(img: HTMLImageElement) {
    // 画像の読み込みと表示処理
    this.image = img
    return this
  }

  async setImageAsync(src: string): Promise<ImageObject> {
    // 画像の読み込みと表示処理
    this.image.src = src
    return new Promise((resolve, reject) => {
      this.image.onload = () => {
        console.log('画像の読み込みに成功しました')
        resolve(this)
      }
      this.image.onError = () => {
        console.error('画像の読み込みに失敗しました')
        reject(new Error('画像の読み込みに失敗しました'));
      }
    })
  }

  draw(reverse = false): HTMLCanvasElement {
    const canvas = document.createElement('canvas')
    canvas.width = this.image.width
    canvas.height = this.image.height
    const ctx = canvas.getContext('2d')
    if (reverse) {
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(this.image, -canvas.width,0, canvas.width, canvas.height);
      ctx.restore();
    } else {
      ctx.drawImage(this.image, 0, 0, canvas.width, canvas.height);
    }
    return canvas
  }

  // 画像の透明度を変更
  setOpacity(opacity: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = this.image.width
    canvas.height = this.image.height
    ctx.drawImage(this.image, 0, 0)
    // 透明度を設定
    ctx.globalAlpha = opacity
    return canvas
  }

  // アニメーション(フェードイン/フェードアウト)

  // セピア化
  setSepia(num = 100): HTMLCanvasElement {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = this.image
    canvas.width = img.width
    canvas.height = img.height
    ctx.drawImage(img, 0, 0)
    // フィルターをかける
    ctx.filter = `sepia(${num}%)}`
    // 画像データを取得
    return canvas
  }

  // モノクロ化
  setMonochrome(num = 100) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = this.image
    canvas.width = img.width
    canvas.height = img.height
    ctx.drawImage(img, 0, 0)
    // フィルターをかける
    ctx.filter = `grayscale(${num}%)`
    // 画像データを取得
    return canvas
  }

  // ぼかし
  setBlur(num = 2) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = this.image
    canvas.width = img.width
    canvas.height = img.height
    ctx.drawImage(img, 0, 0)
    // フィルターをかける
    ctx.filter = `blur(${num}px)`
    // 画像データを取得
   return canvas
  }

  // フィルターの解除
  clearFilter() {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = this.image
    canvas.width = img.width
    canvas.height = img.height
    ctx.drawImage(img, 0, 0)
    // フィルターをかける
    ctx.filter = 'none'
    // 画像データを取得
    return canvas
  }
}
