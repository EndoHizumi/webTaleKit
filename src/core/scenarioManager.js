export class ScenarioManager {
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

  setHistory (text) {
    this.backlist.push(text)
  }

  setSelectedChoice (prompt, id) {
    this.progress.selected[this.progress.currentScene] = {prompt, id}
  }
}
