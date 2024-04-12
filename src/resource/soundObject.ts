export class SoundObject {
  // 表示済みの画像を管理するクラス
  private audio: any = null
  private ctx: AudioContext
  public source: AudioBufferSourceNode

  constructor() {
    this.ctx = new AudioContext()
  }

  getAudio() {
    return this.audio
  }

  setAudio(track: ArrayBuffer) {
    // 画像の読み込みと表示処理
    this.audio = await this.ctx.decodeAudioData(track)
    const source = await this.ctx.createBufferSource()
    source.buffer = this.audio
    source.connect(this.ctx.destination)
    return this
  }

  getContext() {  
    return this.ctx
  }

  setContext(context) {
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
   source.buffer = this.audio
   source.connect(this.ctx.destination)
   return this
  }

  // music control
  async play(): void {
    this.source.start(0)
  }

  async stop(): boolean {
   this.source.stop()
  }

  // other effect 
  // volume control
}
