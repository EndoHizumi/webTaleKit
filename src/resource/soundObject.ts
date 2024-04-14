export class SoundObject {
  // 表示済みの画像を管理するクラス
  private audio: any = null
  private ctx: AudioContext = new AudioContext()
  public source: AudioBufferSourceNode = this.ctx.createBufferSource()

  constructor() {
    this.ctx = new AudioContext()
  }

  getAudio() {
    return this.audio
  }

  async setAudio(track: ArrayBuffer) {
    // 画像の読み込みと表示処理
    this.audio = await this.ctx.decodeAudioData(track)
    const source = this.ctx.createBufferSource()
    source.buffer = this.audio
    source.connect(this.ctx.destination)
    return this
  }

  getContext() {  
    return this.ctx
  }

  setContext(context: AudioContext) {
    this.ctx = context
    return this
  }

  getFileInfo(){
    // return filename, fileSize, playTime
    return 
  }

  async setAudioAsync(src: string): Promise<SoundObject> {
    if (!src || src.length == 0) {
      return this
    }
   const arrayBuffer = await (await fetch(src)).arrayBuffer()
   this.audio = await this.ctx.decodeAudioData(arrayBuffer)
   this.source = await this.ctx.createBufferSource()
   this.source.buffer = this.audio
   this.source.connect(this.ctx.destination)
   return this
  }

  // music control
  play(): void {
    this.source.start(0)
  }

  stop(): void {
   this.source.stop()
  }

  // other effect 
  // volume control
}
