import { ImageObject } from "../resource/ImageObject"
import { Progress, ScenarioLine } from './types'

export interface ScenarioSnapshot {
  scenario: ScenarioLine[]
  index: number
  sceneName: string
  progress: Progress
  history: unknown[]
}

export class ScenarioManager {
  private backlist: unknown[]
  private saveDataList: unknown[]
  progress: Progress
  private background: ImageObject = new ImageObject()
  private scenarioData: ScenarioLine[] = []

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

  setScenario (scenario: ScenarioLine[] | null | undefined, sceneName: string=''): void {
    const normalizedScenario = scenario ?? []
    this.scenarioData = JSON.parse(JSON.stringify(normalizedScenario))
    this.progress.currentScene = sceneName
    this.progress.currentIndex = 0
  }

  addScenario (scenario: ScenarioLine[], index?: number): void {
    // 区別にsub=trueを追加
    const _scenario =  scenario.map((item) => ({ ...item, sub: true }))
    // この行を消すと動く(原因があまりにも単純でまぬけすぎたので、残しておく)
    // ('call','debug', {scenario, index})
    // index指定がある場合はその値に挿入する
    if(index) {
      this.scenarioData.splice(index, 0, ..._scenario)
    } else {
      // 現在の位置に挿入する
      this.scenarioData.splice(this.progress.currentIndex, 0, ..._scenario)
    }
  }

  getScenario (): ScenarioLine[] {
    return this.scenarioData
  }

  next(): ScenarioLine | null {
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

  setHistory (text: unknown): void {
    this.backlist.push(text)
  }

  getHistory (): unknown[] {
    return this.backlist
  }

  snapshot(): ScenarioSnapshot {
    return {
      scenario: JSON.parse(JSON.stringify(this.scenarioData ?? [])),
      index: this.getIndex(),
      sceneName: this.getSceneName(),
      progress: JSON.parse(JSON.stringify(this.progress)),
      history: [...this.getHistory()],
    }
  }

  restore(snap: ScenarioSnapshot): void {
    this.scenarioData = JSON.parse(JSON.stringify(snap.scenario))
    this.progress = JSON.parse(JSON.stringify(snap.progress))
    this.progress.currentIndex = snap.index
    this.progress.currentScene = snap.sceneName
    this.backlist = [...snap.history]
  }

  setSelectedChoice (prompt:string, id:number):void {
    this.progress.selected[this.progress.currentScene] = {prompt, id}
  }

  setBackground(image: ImageObject): void {
   this.background = image
  }

  getBackground():ImageObject{
    return this.background
  }
}
