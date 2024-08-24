export class SoundObject {
  // 表示済みの画像を管理するクラス
  private audio: any = null
  private audioCtx: AudioContext = new AudioContext()
  public source: AudioBufferSourceNode | null = this.audioCtx.createBufferSource()
  private _isPlaying: boolean = false
  private currentPosition: number = 0

  constructor() {
    this.audioCtx = new AudioContext()
  }

  get isPlaying(): boolean {
    return this._isPlaying
  }

  getAudio() {
    return this.audio
  }

  async setAudio(track: ArrayBuffer) {
    // 画像の読み込みと表示処理
    this.audio = await this.audioCtx.decodeAudioData(track)
    const source = this.audioCtx.createBufferSource()
    source.buffer = this.audio
    source.connect(this.audioCtx.destination)
    return this
  }

  getContext() {
    return this.audioCtx
  }

  setContext(context: AudioContext) {
    this.audioCtx = context
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
    const arrayBuffer = await (await fetch(src)).arrayBuffer()
    this.audio = await this.audioCtx.decodeAudioData(arrayBuffer)
    return this
  }

  // music control
  play(loop: boolean=false, resume:boolean=false): void {
    if (this._isPlaying) {
      this.stop()
    }

    if (!this.audio) {
      console.error('No audio loaded')
      return
    }
    this.source = this.audioCtx.createBufferSource()
    this.source.buffer = this.audio
    this.source.connect(this.audioCtx.destination)
    this.source.loop = loop;
    this.source.start(resume ? this.currentPosition: 0)

    this._isPlaying = true

    this.source.onended = () => {
      if (!this.source?.loop) {
        this._isPlaying = false
      }
    }
  }

  pause(): void {
    if (this.source && this._isPlaying) {
      this.currentPosition = this.audioCtx.currentTime 
      this.source.stop()
      this._isPlaying = false
    }
  }

  stop(): void {
    if (this.source && this._isPlaying) {
      this.currentPosition = 0
      this.source.stop()
      this.source.disconnect()
      this.source = null
      this._isPlaying = false
    }
  }

  get playing(): boolean {
    return this._isPlaying
  }
  // other effect 
  // volume control
}
