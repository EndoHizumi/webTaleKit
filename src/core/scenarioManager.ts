import { ImageObject } from "../resource/ImageObject"
export class ScenarioManager {
  private backlist: any
  private saveDataList: any
  private progress: any
  private ctx: any
  private background: ImageObject

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

  setHistory (text: string): void {
    this.backlist.push(text)
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
