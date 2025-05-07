export class SoundObject {
  // 表示済みの画像を管理するクラス
  private audio: any = null
  private ctx: AudioContext = new AudioContext()
  public source: AudioBufferSourceNode | null = this.ctx.createBufferSource()
  private isPlaying: boolean = false
  private startTime: number = 0
  private pausedTime: number = 0
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
    
    // 一時停止していた場合は、その位置から再生
    const offset = this.pausedTime > 0 ? this.pausedTime : 0
    this.source.start(0, offset)
    this.startTime = this.ctx.currentTime - offset
    this.pausedTime = 0

    this.isPlaying = true

    this.source.onended = () => {
      if (!this.source?.loop) {
        this.isPlaying = false
      }
    }
  }

  stop(): void {
    if (this.source && this.isPlaying) {
      this.source.stop()
      this.source.disconnect()
      this.source = null
      this.isPlaying = false
      this.pausedTime = 0
      this.startTime = 0
    }
  }

  pause(): void {
    if (this.source && this.isPlaying) {
      this.pausedTime = this.getCurrentTime()
      this.source.stop()
      this.source.disconnect()
      this.source = null
      this.isPlaying = false
    }
  }

  /**
   * 現在の再生位置を取得する（秒）
   * @returns {number} 現在の再生位置（秒）
   */
  getCurrentTime(): number {
    if (!this.isPlaying) {
      return this.pausedTime
    }
    return this.ctx.currentTime - this.startTime
  }

  /**
   * 再生位置を設定する（秒）
   * @param {number} time - 設定する再生位置（秒）
   */
  setCurrentTime(time: number): void {
    if (time < 0) time = 0
    if (!this.audio) return

    const wasPlaying = this.isPlaying
    
    // 再生中なら一度停止
    if (wasPlaying) {
      this.stop()
    }
    
    this.pausedTime = time
    
    // 再生中だった場合は再開
    if (wasPlaying) {
      this.play(this.source?.loop || false)
    }
  }

  get playing(): boolean {
    return this.isPlaying
  }
  
  // other effect
  // volume control
}
