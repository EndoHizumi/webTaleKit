import { ImageObject } from "../resource/ImageObject"
import { outputLog } from "../utils/logger"
export class ScenarioManager {
  private backlist: any
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
    outputLog('call','debug', {scenario, sceneName})
    this.scenarioData = scenario
    this.progress.currentScene = sceneName
    this.progress.currentIndex = 0
  }

  addScenario (scenario: any, index: number): void {
    // 区別にsub=trueを追加
    const _scenario =  scenario.map((item: any) => ({ ...item, sub: true }))
    outputLog('call','debug', {scenario, index})
    // index指定がある場合はその値に挿入する
    if(index) {
      this.scenarioData.splice(index, 0, ..._scenario)
    } else {
      // 現在の位置に挿入する
      this.scenarioData.splice(this.progress.currentIndex, 0, ..._scenario)
    }
    outputLog('call','debug', this.scenarioData)
  }

  getScenario (): any {
    return this.scenarioData
  }

  next(): any {
   outputLog('call: index:','debug', this.progress.currentIndex)
   if(this.progress.currentIndex <= this.scenarioData.length) {
     const nextScenario = this.scenarioData[this.progress.currentIndex] 
     this.progress.currentIndex += 1
     return  nextScenario
   } else {
    return null
   }
  }

  hasNext(): boolean {
    return this.progress.currentIndex < this.scenarioData.length
  }

  getIndex(): number {
    return this.progress.currentIndex
  }

  setIndex(index: number): void {
    outputLog('call index:','debug', index)
    this.progress.currentIndex = index
  }

  setSceneName(sceneName: string): void {
    this.progress.currentScene = sceneName
  }

  getSceneName(): string {
    return this.progress.currentScene
  }

  setHistory (text: string): void {
    this.backlist.push(text)
  }

  getHistory (): any[] {
    return this.backlist
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
