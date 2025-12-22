import { ImageObject } from "../resource/ImageObject"
export class ScenarioManager {
  private backlist: any
  private saveDataList: any
  private progress: any
  private ctx: any
  private background: ImageObject = new ImageObject()
  private scenarioData: any
  private addedScenarios: Array<{index: number, scenarios: any[]}> = []
  private originalScenarioLength: number = 0

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
    this.scenarioData = scenario
    this.progress.currentScene = sceneName
    this.progress.currentIndex = 0
    this.addedScenarios = []
    this.originalScenarioLength = scenario ? scenario.length : 0
  }

  addScenario (scenario: any, index: number): void {
    // 区別にsub=trueを追加
    const _scenario =  scenario.map((item: any) => ({ ...item, sub: true }))
    // この行を消すと動く
    // ('call','debug', {scenario, index})
    // index指定がある場合はその値に挿入する
    const insertIndex = index || this.progress.currentIndex
    if(index) {
      this.scenarioData.splice(index, 0, ..._scenario)
    } else {
      // 現在の位置に挿入する
      this.scenarioData.splice(this.progress.currentIndex, 0, ..._scenario)
    }
    
    // Track the added scenarios for save/load
    this.addedScenarios.push({
      index: insertIndex,
      scenarios: _scenario
    })
  }

  getScenario (): any {
    return this.scenarioData
  }

  next(): any {
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

  getAddedScenarios(): Array<{index: number, scenarios: any[]}> {
    return this.addedScenarios
  }

  setAddedScenarios(addedScenarios: Array<{index: number, scenarios: any[]}>): void {
    this.addedScenarios = addedScenarios
  }

  getOriginalScenarioLength(): number {
    return this.originalScenarioLength
  }

  setOriginalScenarioLength(length: number): void {
    this.originalScenarioLength = length
  }

  restoreAddedScenarios(addedScenarios: Array<{index: number, scenarios: any[]}>): void {
    // Sort by index in descending order to insert from the end
    // This prevents index shifts during insertion
    const sortedAdditions = [...addedScenarios].sort((a, b) => b.index - a.index)
    
    for (const addition of sortedAdditions) {
      this.scenarioData.splice(addition.index, 0, ...addition.scenarios)
    }
    
    this.addedScenarios = addedScenarios
  }
}
