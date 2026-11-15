import { ImageObject } from "../resource/ImageObject"

export interface ScenarioSnapshot {
  scenario: any[]
  index: number
  sceneName: string
  progress: any
  history: any[]
  backlog?: BacklogEntry[]
}

/** ログ（読み返し）の 1 件。text は {{…}} を展開し、タグを除いた素の文字列 */
export interface BacklogEntry {
  name: string
  text: string
}

/** ログに残す件数の上限（古いものから捨てる） */
export const BACKLOG_MAX = 300

export class ScenarioManager {
  private backlist: any
  private backlog: BacklogEntry[] = []
  private saveDataList: any
  private progress: any
  private ctx: any
  private background: ImageObject = new ImageObject()
  private scenarioData: any

  constructor () {
    this.backlist = []
    this.saveDataList = []
    this.progress = {
      currentBackground: '',
      currentScene: '',
      currentIndex: 0,
      selected: {
        // '{scene名}'：[id]
      }
    }
  }

  setScenario (scenario: any, sceneName: string=''): void {
    const normalizedScenario = scenario ?? []
    this.scenarioData = JSON.parse(JSON.stringify(normalizedScenario))
    this.progress.currentScene = sceneName
    this.progress.currentIndex = 0
  }

  addScenario (scenario: any, index?: number): void {
    // 区別にsub=trueを追加
    const _scenario =  scenario.map((item: any) => ({ ...item, sub: true }))
    // この行を消すと動く(原因があまりにも単純でまぬけすぎたので、残しておく)
    // ('call','debug', {scenario, index})
    // index指定がある場合はその値に挿入する
    if(index !== undefined) {
      this.scenarioData.splice(index, 0, ..._scenario)
    } else {
      // 現在の位置に挿入する
      this.scenarioData.splice(this.progress.currentIndex, 0, ..._scenario)
    }
  }

  getScenario (): any {
    return this.scenarioData
  }

  next(): any {
    if (!Array.isArray(this.scenarioData)) {
      return null
    }
    if (this.progress.currentIndex >= this.scenarioData.length) {
      return null
    }

    const nextScenario = this.scenarioData[this.progress.currentIndex]
    this.progress.currentIndex += 1
    return nextScenario
  }

  hasNext(): boolean {
    if (!Array.isArray(this.scenarioData)) {
      return false
    }
    return this.progress.currentIndex < this.scenarioData.length
  }

  getIndex(): number {
    return this.progress.currentIndex
  }

  setIndex(index: number): void {
    this.progress.currentIndex = index
  }

  setSceneName(sceneName: string): void {
    this.progress.currentScene = sceneName
  }

  getSceneName(): string {
    return this.progress.currentScene
  }

  setHistory (text: any): void {
    this.backlist.push(text)
  }

  getHistory (): any[] {
    return this.backlist
  }

  /** ログに 1 件足す（空の文は残さない） */
  addBacklog (entry: BacklogEntry): void {
    if (!entry || !entry.text) return
    this.backlog.push({ name: entry.name || '', text: entry.text })
    if (this.backlog.length > BACKLOG_MAX) this.backlog.splice(0, this.backlog.length - BACKLOG_MAX)
  }

  /** ログの写し（古い順） */
  getBacklog (): BacklogEntry[] {
    return this.backlog.map((e) => ({ ...e }))
  }

  /** ログを入れ替える（ロード用） */
  replaceBacklog (list: BacklogEntry[] | undefined): void {
    this.backlog = Array.isArray(list) ? list.map((e) => ({ name: e.name || '', text: e.text || '' })) : []
  }

  snapshot(): ScenarioSnapshot {
    return {
      scenario: JSON.parse(JSON.stringify(this.scenarioData ?? [])),
      index: this.getIndex(),
      sceneName: this.getSceneName(),
      progress: JSON.parse(JSON.stringify(this.progress)),
      history: [...this.getHistory()],
      backlog: this.getBacklog(),
    }
  }

  restore(snap: ScenarioSnapshot): void {
    this.scenarioData = JSON.parse(JSON.stringify(snap.scenario))
    this.progress = JSON.parse(JSON.stringify(snap.progress))
    this.progress.currentIndex = snap.index
    this.progress.currentScene = snap.sceneName
    this.backlist = [...snap.history]
    this.replaceBacklog(snap.backlog)
  }

  setSelectedChoice (prompt:string, id:number):void {
    this.progress.selected[this.progress.currentScene] = {prompt, id}
  }

  setBackground(image: ImageObject): void {
   this.background = image
  }

  getBackground():ImageObject{
    return this.background;
  }
}
