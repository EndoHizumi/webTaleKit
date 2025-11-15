export class SoundObject {
  // 表示済みの画像を管理するクラス
  private audio: any = null
  private ctx: AudioContext = new AudioContext()
  private isPlaying: boolean = false
  public source: AudioBufferSourceNode | null = this.ctx.createBufferSource()
  public src: string = ''

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

  getFileInfo() {
    // return filename, fileSize, playTime
    return
  }

  async setAudioAsync(src: string): Promise<SoundObject> {
    if (!src || src.length == 0) {
      return this
    }
    this.src = src
    const arrayBuffer = await (await fetch(src)).arrayBuffer()
    this.audio = await this.ctx.decodeAudioData(arrayBuffer)
    return this
  }

  // music control
  play(loop: boolean): void {
    if (this.isPlaying) {
      this.stop()
    }

    if (!this.audio) {
      console.error('No audio loaded')
      return
    }
    this.source = this.ctx.createBufferSource()
    this.source.buffer = this.audio
    this.source.connect(this.ctx.destination)
    this.source.loop = loop;
    this.source.start(0)

    this.isPlaying = true

    this.source.onended = () => {
      if (!this.source?.loop) {
        this.isPlaying = false
      }
    }
  }

  stop(): void {
    if (this.source) {
      this.source.stop()
      this.source.disconnect()
      this.source = null
      this.isPlaying = false
    }
  }

  get playing(): boolean {
    return this.isPlaying
  }
  // other effect 
  // volume control
}
