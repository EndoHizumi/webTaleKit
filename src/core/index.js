import { Drawer } from './drawer'
import { ScenarioManager } from './scenarioManager'
import { ImageObject } from '../resource/ImageObject'
import { ResourceManager } from './resourceManager'
import { SoundObject } from '../resource/soundObject'
import engineConfig from '../../engineConfig.json'
import packageJson from '../../package.json'
import { sleep } from '../utils/waitUtil'
import { getDefaultDialogTemplate } from '../utils/fallbackTemplate'
import { generateStore } from '../utils/store'

export class Core {
  constructor() {
    // プロパティの初期化
    this.bgm = null
    this.isAuto = false
    this.isNext = false
    this.isSkip = false
    this.onNextHandler = null
    this.sceneFile = {}
    this.sceneConfig = {}
    this.commandList = {
      text: this.textHandler,
      choice: this.choiceHandler,
      show: this.showHandler,
      newpage: this.newpageHandler,
      hide: this.hideHandler,
      jump: this.jumpHandler,
      sound: this.soundHandler,
      say: this.sayHandler,
      if: this.ifHandler,
      call: this.callHandler,
      moveto: this.moveToHandler,
      route: this.routeHandler,
      wait: this.waitHandler,
      dialog: this.dialogHandler,
      save: this.saveHandler,
      load: this.loadHandler,
    }
    // gameContainerの初期化（HTMLのgameContainerを取得する）
    this.gameContainer = document.getElementById('gameContainer')
    // Drawerの初期化（canvasタグのサイズを設定する)
    this.drawer = new Drawer(this.gameContainer)
    // ScenarioManagerの初期化（変数の初期値設定）
    this.scenarioManager = new ScenarioManager()
    // ResourceManagerの初期化（引数にconfigを渡して、リソース管理配列を作る）
    this.resourceManager = new ResourceManager(import(/* webpackIgnore: true */ '/src/resource/config.js')) //  webpackIgnoreでバンドルを無視する
    this.displayedImages = {}
    this.usedSounds = {}
    // ストレージの初期化
    this.store = generateStore()
  }

  setConfig(config) {
    // ゲームの設定情報をセットする
    engineConfig = config
  }

  async start(initScene) {
    // TODO: ブラウザ用のビルドの場合は、最初にクリックしてもらう
    // titleタグの内容を書き換える
    document.title = engineConfig.title
    // sceneファイルを読み込む
    await this.loadScene(initScene || 'title')
    // 画面を表示する
    await this.loadScreen(this.sceneConfig)
    // 入力イベントを設定する
    document.querySelector('#gameContainer').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.onNextHandler()
      } else if (e.key === 'Control') {
        this.drawer.isSkip = true
        this.isNext = true
      }
    })
    document.querySelector('#gameContainer').addEventListener('keyup', (e) => {
      if (e.key === 'Control') {
        this.drawer.isSkip = true
        this.isNext = false
      }
    })
    document.querySelector('#gameContainer').addEventListener('click', (e) => {
      this.onNextHandler()
    })

    await this.textHandler('タップでスタート')
    // BGMを再生する
    this.soundHandler({
      mode: 'bgm',
      src: this.sceneConfig.bgm,
      loop: true,
      play: true,
    })
    // シナリオを実行する
    while (this.scenarioManager.hasNext()) {
      await this.runScenario()
    }
  }

  async loadScene(sceneFileName) {
    // sceneファイルを読み込む
    this.sceneFile = await import(/* webpackChunkName: "[request]" */ `/src/js/${sceneFileName}.js`)
    // sceneファイルの初期化処理を実行
    if (this.sceneFile.init) {
      this.sceneFile.init(this.getAPIForScript())
    }
    // シナリオの進行状況を初期化
    this.scenarioManager.setScenario(this.sceneFile.scenario, sceneFileName)
    this.sceneConfig = { ...this.sceneConfig, ...this.sceneFile.sceneConfig }
  }

  // ファイルの存在確認を行う関数
  async checkResourceExists(url) {
    try {
      const response = await fetch(url, { method: 'HEAD' })
      return response.ok
    } catch (error) {
      return false
    }
  }

  // ファイルの存在確認を行う関数
  async checkResourceExists(url) {
    try {
      const response = await fetch(url, { method: 'HEAD' })
      return response.ok
    } catch (error) {
      return false
    }
  }

  async loadScreen(sceneConfig, options = {}) {
    const {
      isDialog = false, // ダイアログモードかどうか
      fallbackTemplate = null, // フォールバック用テンプレート
      skipBackground = false, // 背景画像の読み込みをスキップ
    } = options

    // 画面名を設定する。
    this.scenarioManager.progress.currentScene = sceneConfig.name
    this.scenarioManager.setSceneName(sceneConfig.name)
    // sceneConfig.templateを読み込んで、HTMLを表示する
    // テンプレートの存在確認
    if (!isDialog && !(await this.checkResourceExists(sceneConfig.template))) {
      console.error(`Template file not found: ${sceneConfig.template}`)
      throw new Error(`Template file not found: ${sceneConfig.template}`)
    }

    const htmlString = await (await fetch(sceneConfig.template)).text()
    // 読み込んだhtmlからIDにmainを持つdivタグとStyleタグ以下を取り出して、gameContainerに表示する
    let parser = new DOMParser()
    let doc = parser.parseFromString(htmlString, 'text/html')

    let mainDiv = isDialog ? doc.getElementById('dialogContainer') : doc.getElementById('main')

    if (!mainDiv) {
      // mainが見つからない場合は、フォールバックテンプレートを使用
      if (fallbackTemplate) {
        console.warn(`Main div not found in  template, using fallback: ${fallbackTemplate}`)
        mainDiv = doc.createElement('div')
        const fallbackTemplateText = fallbackTemplate()
        mainDiv.innerHTML = fallbackTemplateText.htmlString
        // フォールバックテンプレートのスタイルを適用
        const styleElement = doc.head.getElementsByTagName('style')[0] || doc.createElement('style')
        styleElement.textContent = fallbackTemplateText.styleString || ''
        doc.head.appendChild(styleElement)
      } else {
        throw new Error('Main div not found in template and no fallback provided.')
      }
    }
    if (!this.gameContainer) {
      throw new Error('Game container not found.')
    }
    // ゲーム進行用に必要な情報をセットする
    if (!isDialog) {
      // 既に読み込んだスタイルシートがあったら削除する
      const styleTags = document.head.getElementsByTagName('style')
      for (const styleTag of styleTags) {
        document.head.removeChild(styleTag)
      }
      this.gameContainer.innerHTML = mainDiv.innerHTML
      this.drawer.setScreen(this.gameContainer, engineConfig.resolution)
    } else {
      this.gameContainer.appendChild(mainDiv)
    }
    // Styleタグを取り出して、headタグに追加する
    const styleElement = doc.head.getElementsByTagName('style')[0]
    document.head.appendChild(styleElement)

    if (!skipBackground) {
      console.info(`background: ${await this.checkResourceExists(sceneConfig.background)}`)
      // 背景画像の存在確認
      if (!(await this.checkResourceExists(sceneConfig.background))) {
        throw new Error(`Background image not found: ${sceneConfig.background}`)
      } else {
        // 背景画像を表示する
        const background = await new ImageObject().setImageAsync(sceneConfig.background)
        this.displayedImages['background'] = {
          image: background,
          size: {
            width: this.gameContainer.clientWidth,
            height: this.gameContainer.clientHeight,
          },
        }
      }
      this.drawer.show(this.displayedImages)
    }
  }

  async runScenario() {
    let scenarioObject = this.scenarioManager.next()
    if (!scenarioObject) {
      return
    }
    // シナリオオブジェクトのtypeプロパティに応じて、対応する関数を実行する
    const commandType = scenarioObject.type || 'text'
    const commandFunction = this.commandList[commandType]

    // コマンドが存在しない場合のエラーハンドリング
    if (!commandFunction) {
      const errorMessage = `Error: Command type "${commandType}" is not defined`
      throw new Error(errorMessage)
    }

    const boundFunction = commandFunction.bind(this)
    scenarioObject = await this.httpHandler(scenarioObject)

    // ifグローバル属性の処理
    if (scenarioObject.if !== undefined) {
      const condition = this.executeCode(`return ${scenarioObject.if}`)

      // 条件がfalseの場合、このタグの処理をスキップ
      if (!condition) {
        return
      }
    }

    await boundFunction(scenarioObject)
  }

  async textHandler(scenarioObject) {
    // 文章だけの場合は、contentプロパティに配列として設定する
    if (typeof scenarioObject === 'string') scenarioObject = { content: [scenarioObject] }
    // httpレスポンスがある場合は、list.contentに追加して、表示対象に加える
    if (scenarioObject.then || scenarioObject.error) {
      scenarioObject.content = scenarioObject.content.concat(scenarioObject.then || scenarioObject.error)
    }

    // 名前が設定されている場合は、名前を表示する
    if (scenarioObject.name) {
      this.drawer.drawName(scenarioObject.name)
    } else {
      this.drawer.drawName('')
    }

    //prettier-ignore
    this.onNextHandler = () => { this.drawer.isSkip = true }
    this.drawer.clearText() // テキスト表示領域をクリア
    // 表示する文章を1行ずつ表示する
    for (const text of scenarioObject.content) {
      if (typeof text === 'string') {
        await this.drawer.drawText(this.expandVariable(text), scenarioObject.speed || 25)
      } else {
        if (text.type === 'br' || text.type === 'wait') {
          if (text.type === 'br') this.drawer.drawLineBreak()
          if (!text.nw) {
            await this.waitHandler({ wait: text.time })
          }
        } else {
          const container = this.drawer.createDecoratedElement(text)
          await this.drawer.drawText(this.expandVariable(text.content[0]), text.speed || 25, container)
        }
      }
    }
    await this.waitHandler({ wait: scenarioObject.time })
    this.drawer.isSkip = false
    this.scenarioManager.setHistory(scenarioObject.content)
  }

  expandVariable(text) {
    if (typeof text !== 'string') return text
    return text.replace(/{{([^{}]+)}}/g, (match) => {
      const expr = match.slice(2, -2)
      const returnValue = this.executeCode(`return ${expr}`)
      return typeof returnValue == 'object' ? JSON.stringify(returnValue) : returnValue
    })
  }

  async waitHandler(line) {
    // line.timeがある場合、line.waitに代入する
    if (line.time) line.wait = line.time
    //prettier-ignore
    this.onNextHandler = () => { this.isNext = true }

    // line.waitが数値に変換可能な文字列の場合、数値に変換
    if (typeof line.wait === 'string' && !isNaN(Number(line.wait))) {
      line.wait = Number(line.wait)
    }
    if (typeof line.wait === 'number') {
      if (line.wait > 0 || this.isAuto) {
        const waitTime = line.wait || 1500
        // 指定された時間だけ待機
        await sleep(waitTime)
      }
    } else {
      // 改行ごとに入力待ち
      await this.clickWait()
    }
  }

  // クリック待ち処理
  async clickWait() {
    this.drawer.setVisibility('#waitCircle', true)
    return new Promise((resolve) => {
      const intervalId = setInterval(() => {
        if (this.isNext) {
          this.drawer.setVisibility('#waitCircle', false)
          clearInterval(intervalId)
          this.isNext = false
          resolve(null)
        }
      }, 500)
    })
  }

  async sayHandler(line) {
    // say(name:string, pattern: string, voice: {playの引数},  ...text)
    if (line.voice) await this.soundHandler({ path: line.voice, play: true })
    await this.textHandler({ content: line.content, name: line.name, speed: line.speed || 25 })
    this.scenarioManager.setHistory(line)
  }

  async choiceHandler(line) {
    document.querySelector('#interactiveView').style.visibility = 'visible'
    if (line.prompt) this.textHandler(line.prompt)
    // ムスタッシュ構文があるときは、変数の展開
    line.content.forEach((choice) => {
      choice.label = this.expandVariable(choice.label)
    })
    const { selectId, onSelect: selectHandler } = await this.drawer.drawChoices(line)
    if (selectHandler !== undefined) {
      this.scenarioManager.addScenario(selectHandler)
    }
    this.scenarioManager.setHistory({ line, ...selectId })
    document.querySelector('#interactiveView').style.visibility = 'hidden'
  }

  jumpHandler(line) {
    // ジャンプ先が現在の行より小さいときは、今の行とジャンプ先の行の間で、sub=falseの行を抽出して、scenarioManagerに追加する
    if (line.index < this.scenarioManager.getIndex()) {
      // scenarioManagerからシナリオを取得
      const scenario = this.scenarioManager.getScenario()
      // 結合用に、ジャンプ先までのインデックスを取得
      const noEditScenarioList = {
        before: scenario.slice(0, line.index),
        after: scenario.slice(this.scenarioManager.getIndex()),
      }
      // ジャンプ先のインデックスまでのシナリオを取得
      const scenarioList = scenario.slice(line.index, this.scenarioManager.getIndex())
      // sub=falseの行だけを取得
      const subFalseScenario = scenarioList.filter((line) => !line.sub)
      // scenarioManagerに追加
      this.scenarioManager.setScenario([...noEditScenarioList.before, ...subFalseScenario, ...noEditScenarioList.after])
    }
    this.newpageHandler()
    this.scenarioManager.setIndex(Number(line.index))
  }

  async showHandler(line) {
    // ムスタッシュ構文があるときは、変数の展開
    Object.keys(line).forEach((item) => {
      line[item] = this.expandVariable(line[item])
    })
    // 表示する画像の情報を管理オブジェクトに追加
    const modeList = { bg: 'background', cutin: '', chara: '', cg: 'background', effect: 'effect' }
    const key = Object.keys(modeList).includes(line.mode) ? modeList[line.mode] : line.name || line.src.split('/').pop()
    const baseLine = engineConfig.resolution.height / 2
    const centerPoint = {
      left: { x: engineConfig.resolution.width * 0.25, y: baseLine },
      center: { x: engineConfig.resolution.width * 0.5, y: baseLine },
      right: { x: engineConfig.resolution.width * 0.75, y: baseLine },
    }
    line.src = this.expandVariable(line.src) || line.name

    const image = await this.getImageObject(line)
    // 画像の表示位置を設定
    let position = { x: line.x || 0, y: line.y || 0 }
    // prettier-ignore
    let size = line.width && line.height ? { width: line.width, height: line.height } : { width: image.getSize().width, height: image.getSize().height }

    // line.modeが'cutin'の場合、center:middleのエイリアスを強制する
    if (line.mode === 'cutin') {
      line.pos = 'center:middle'
    }

    if (line.mode === 'cg') {
      this.tempImages = { ...this.displayedImages }
      this.displayedImages = { background: line.src }
      size = { width: engineConfig.resolution.width, height: engineConfig.resolution.height }
    }

    if (line.pos) {
      const pos = line.pos.split(':')
      const baseLines = {
        top: 0 + size.height,
        middle: engineConfig.resolution.height / 2,
        bottom: engineConfig.resolution.height - size.height,
      }
      // エイリアスが設定されている場合、画像の中心点を求めて、画像の表示位置を設定する
      position.x = centerPoint[pos[0]].x - size.width / 2
      if (pos[1] === 'middle') {
        position.y = baseLines[pos[1]] - size.width / 2
      } else if (pos[1]) {
        position.y = baseLines[pos[1]]
      } else {
        position.y = baseLine / 2
      }
    }
    this.displayedImages[key] = {
      image,
      pos: position,
      size: size,
      look: line.look,
      entry: line.entry,
    }

    if (line.sepia) this.displayedImages[key].image.setSepia(line.sepia)
    if (line.mono) this.displayedImages[key].image.setMonochrome(line.mono)
    if (line.blur) this.displayedImages[key].image.setBlur(line.blur)
    if (line.opacity) this.displayedImages[key].image.setOpacity(line.opacity)

    if (line.transition === 'fade') {
      // フェードイン効果で表示
      await this.drawer.fadeIn(line.duration || 2000, await this.getImageObject(line), {
        pos: position,
        size,
        look: line.look,
        entry: line.entry,
      })
      this.drawer.show(this.displayedImages)
    } else {
      // 通常の表示処理
      this.drawer.show(this.displayedImages)
    }
  }

  async hideHandler(line) {
    const targetImage = this.displayedImages[line.name]
    if (line.mode === 'cg') {
      this.displayedImages = { ...this.tempImages }
      this.tempImages = {}
    } else {
      delete this.displayedImages[line.name]
    }
    this.drawer.show(this.displayedImages)
    if (line.transition === 'fade') {
      // フェードアウト効果で非表示
      await this.drawer.fadeOut(line.duration || 1000, targetImage.image, {
        pos: targetImage.pos,
        size: targetImage.size,
        look: targetImage.look,
      })
    }
  }

  async moveToHandler(line) {
    const key = line.name
    await this.drawer.moveTo(key, this.displayedImages, { x: line.x, y: line.y }, line.duration | 1)
  }

  async getImageObject(line) {
    const name = line.name || line.src.split('/').pop()
    let image

    // ファイルの存在確認
    if (!(await this.checkResourceExists(line.src))) {
      console.error(`Image file not found: ${line.src}`)

      // エラーメッセージを表示
      await this.textHandler(`エラー: 画像ファイルが見つかりません: ${line.src}`)
      // 空の画像オブジェクトを返す
      return new ImageObject()
    }

    // 既にインスタンスがある場合は、それを使う
    if (Object.hasOwn(this.displayedImages, name)) {
      const targetImage = this.displayedImages[name]
      const imageObject = targetImage ? targetImage.image : new ImageObject()
      image = await imageObject.setImageAsync(line.src)
    } else {
      image = await new ImageObject().setImageAsync(line.src)
    }
    return image
  }

  async soundHandler(line) {
    const soundObject = await this.getSoundObject(line)

    if (line.mode === 'bgm') {
      // BGMの場合、既存のBGMを停止して、新しいBGMをセットする
      if (this.bgm && this.bgm.isPlaying) {
        this.bgm.stop()
      }
      this.bgm = soundObject
      this.bgm.play(true)
    } else {
      if ('play' in line) {
        'loop' in line ? soundObject.play(true) : soundObject.play()
      }
    }

    if ('stop' in line) {
      soundObject.stop()
    } else if ('pause' in line) {
      soundObject.pause()
    }

    // soundObjectを管理オブジェクトに追加
    const key = line.name || line.src.split('/').pop()
    this.usedSounds[key] = {
      audio: soundObject,
    }
  }

  async getSoundObject(line) {
    const name = line.name || line.src.split('/').pop()
    let resource

    // ファイルの存在確認
    if(line.src){
      if (!(await this.checkResourceExists(line.src))) {
        console.error(`Sound file not found: ${line.src}`)
  
        // エラーメッセージを表示
        await this.textHandler(`エラー: 音声ファイルが見つかりません: ${line.src}`)
        // 空のサウンドオブジェクトを返す
        return new SoundObject()
      }
    }

    // 既にインスタンスがある場合は、それを使う
    if (Object.hasOwn(this.usedSounds, name)) {
      const targetResource = this.usedSounds[name]
      const soundObject = targetResource ? targetResource.audio : new SoundObject()
      resource = await soundObject.setAudioAsync(line.src)
    } else {
      resource = await new SoundObject().setAudioAsync(line.src)
    }
    return resource
  }

  newpageHandler() {
    this.displayedImages = {
      background: {
        image: this.getBackground(),
        size: {
          width: this.gameContainer.clientWidth,
          height: this.gameContainer.clientHeight,
        },
      },
    }
    this.drawer.clear()
    this.drawer.show(this.displayedImages)
  }

  async ifHandler(line) {
    const isTrue = this.executeCode(`return ${line.condition}`)
    const appendScenario = isTrue ? line.content[0].content : line.content[1].content
    this.scenarioManager.addScenario(appendScenario)
  }

  async routeHandler(line) {
    if (this.bgm.isPlaying) {
      // BGMを停止する
      this.soundHandler({
        mode: 'bgm',
        src: this.sceneConfig.bgm,
        stop: true,
      })
    }
    this.newpageHandler()
    if (this.sceneFile.cleanUp) {
      // 終了処理を実行する
      this.sceneFile.cleanUp()
    }
    // sceneファイルを読み込む
    await this.loadScene(line.to)
    // 画面を表示する
    await this.loadScreen(this.sceneConfig)
    // BGMを再生する
    this.soundHandler({
      mode: 'bgm',
      src: this.sceneConfig.bgm,
      loop: true,
      play: true,
    })
  }

  // Sceneファイルに、ビルド時に実行処理を追加して、そこに処理をお願いしたほうがいいかも？
  callHandler(line) {
    this.executeCode(line.method)
  }

  async httpHandler(line) {
    if (!(line.get || line.post || line.put || line.delete)) {
      return line
    }
    // progress属性を処理する
    // prettier-ignore
    const progressText = line.content.filter((content) => content.type === 'progress')[0]
    if (progressText) {
      await this.textHandler({ content: [progressText.content][0], wait: 0 })
    }
    // get,post,put,delete属性を処理する
    const headers = line.content
      .filter((content) => content.type === 'header')[0]
      .content.reduce(
        (acc, header) => ({
          ...acc,
          [header.type]: header.content,
        }),
        {},
      )
    const body = line.content
      .filter((content) => content.type === 'data')[0]
      .content.reduce(
        (acc, header) => ({
          ...acc,
          [header.type]: header.content,
        }),
        {},
      )
    const response = await fetch(line.get || line.post || line.put || line.delete, {
      method: line.get ? 'GET' : line.post ? 'POST' : line.put ? 'PUT' : 'DELETE',
      headers: headers,
      body: JSON.stringify(body),
    })
    if (response.ok) {
      const json = await response.json()
      this.sceneFile.res = json
      line.then = line.content.filter((content) => content.type === 'then')[0].content
    } else {
      this.sceneFile.res = json
      line.error = line.content.filter((content) => content.type === 'error')[0].content
    }
    if (line.content) {
      line.content = line.content.filter(
        (content) =>
          !(
            content.type &&
            (content.type === 'header' ||
              content.type === 'data' ||
              content.type === 'then' ||
              content.type === 'error' ||
              content.type === 'progress')
          ),
      )
    }
    return line
  }

  async dialogHandler(scenarioObject) {
    let result = null
    if (!scenarioObject || !scenarioObject.content) {
      throw new Error('Invalid scenario object for dialog handler.')
    }
    // 既にあるダイアログがある場合は、閉じる
    const existingDialog = document.querySelector('#dialogContainer')
    if (existingDialog) {
      existingDialog.close()
      existingDialog.remove()
    }
    // ダイアログのテンプレートを読み込む
    await this.loadScreen(scenarioObject, {
      isDialog: true,
      skipBackground: true,
      skipBgm: true,
      fallbackTemplate: getDefaultDialogTemplate,
    })
    // ダイアログ用のコンテナを取得
    const dialogContainer = document.querySelector('#dialogContainer')
    if (!dialogContainer) {
      throw new Error('Dialog container not found.')
    }
    scenarioObject.content.forEach((content) => {
      if (content.type === 'prompt') {
        let prompt = content
        // プロンプトの内容を設定

        // ムスタッシュ構文があるときは、変数の展開
        const promptElement = dialogContainer.querySelector('.dialog-prompt')
        if (promptElement) {
          promptElement.innerHTML = prompt.content.map((text) => this.expandVariable(text)).join('\n')
        }
      } else if (content.type === 'actions') {
        // ボタンの追加
        let actions = content.content

        const buttonContainer = dialogContainer.querySelector('.dialog-buttons')
        actions.forEach((action) => {
          // ムスタッシュ構文があるときは、変数の展開
          action.label = this.expandVariable(action.label)
          // テンプレートのボタン取得
          let button = buttonContainer.querySelector(`#dialog-button-${action.id}`)

          if (!button) {
            // 無い場合は、新しいボタンを作成
            button = document.createElement('button')
            button.id = `dialog-button-${action.id}`
            button.classList.add('dialog-button')
            button.innerText = action.label
            buttonContainer.appendChild(button)
          }
          button.innerText = action.label
          button.addEventListener('click', () => {
            // 選択されたアクションを処理
            this.scenarioManager.addScenario(action.content)
            result = action.id // 選択されたアクションのIDを保存

            // ダイアログを閉じる
            dialogContainer.close()
          })
        })
      }
    })

    dialogContainer.showModal() // ダイアログを表示
    return new Promise((resolve) => {
      dialogContainer.addEventListener('close', () => {
        resolve(result)
      })
    })
  }

  setBackground(image) {
    this.displayedImages['background'] = image
  }

  getBackground() {
    return this.displayedImages['background'].image
  }

  executeCode(code) {
    try {
      const context = { ...this.sceneFile }
      const func = new Function(...Object.keys(context), code)
      return func.apply(null, Object.values(context))
    } catch (error) {
      console.error('Error executing code:', error)
    }
  }

  // Scriptから安全にアクセスできるメソッドを定義
  getAPIForScript() {
    return {
      drawer: {
        drawName: this.drawer.drawName.bind(this.drawer),
        drawText: this.drawer.drawText.bind(this.drawer),
        drawChoices: this.drawer.drawChoices.bind(this.drawer),
        clearText: this.drawer.clearText.bind(this.drawer),
        show: this.drawer.show.bind(this.drawer),
        moveTo: this.drawer.moveTo.bind(this.drawer),
        fadeIn: this.drawer.fadeIn.bind(this.drawer),
        fadeOut: this.drawer.fadeOut.bind(this.drawer),
      },
      sound: {
        play: this.soundHandler.bind(this),
        stop: (name) => this.soundHandler({ name, stop: true }),
        pause: (name) => this.soundHandler({ name, pause: true }),
      },
      scenario: {
        jump: this.jumpHandler.bind(this),
        addScene: this.scenarioManager.addScenario.bind(this.scenarioManager),
        getProgress: () => this.scenarioManager.progress,
        setProgress: (progress) => (this.scenarioManager.progress = progress),
        getIndex: () => this.scenarioManager.getIndex(),
        setIndex: (index) => this.scenarioManager.setIndex(index),
        hasNext: () => this.scenarioManager.hasNext(),
        next: () => this.scenarioManager.next(),
        getHistory: () => this.scenarioManager.getHistory(),
        setHistory: (history) => this.scenarioManager.setHistory(history),
        setScenario: (scenario) => this.scenarioManager.setScenario(scenario),
        getScenario: () => this.scenarioManager.getScenario(),
        getSceneName: () => this.scenarioManager.progress.currentScene,
        setScreenName: (name) => (this.sceneConfig.name = name),
      },
      images: {
        get: this.getImageObject.bind(this),
        getAll: () => this.displayedImages,
        set: (name, image) => (this.displayedImages[name] = image),
        delete: (name) => delete this.displayedImages[name],
      },
      sounds: {
        get: (name) => this.usedSounds[name],
        getAll: () => this.usedSounds,
        set: (name, sound) => (this.usedSounds[name] = sound),
        delete: (name) => delete this.usedSounds[name],
        load: this.getSoundObject.bind(this),
      },
      background: {
        set: this.setBackground.bind(this),
        get: this.getBackground.bind(this),
      },
      wait: this.waitHandler.bind(this),
      clickWait: this.clickWait.bind(this),
      core: {
        text: this.textHandler.bind(this),
        choice: this.choiceHandler.bind(this),
        show: this.showHandler.bind(this),
        newpage: this.newpageHandler.bind(this),
        hide: this.hideHandler.bind(this),
        jump: this.jumpHandler.bind(this),
        sound: this.soundHandler.bind(this),
        say: this.sayHandler.bind(this),
        if: this.ifHandler.bind(this),
        moveto: this.moveToHandler.bind(this),
        route: this.routeHandler.bind(this),
        wait: this.waitHandler.bind(this),
        save: this.saveHandler.bind(this),
        load: this.loadHandler.bind(this),
      },
      save: {
        save: this.saveHandler.bind(this),
        load: this.loadHandler.bind(this),
        getSaveData: () => this.getSaveData(),
        setSaveData: (data) => this.setSaveData(data),
        getSaveList: () => this.getSaveList(),
        deleteSave: (slot) => this.deleteSave(slot),
      },
    }
  }

  async saveHandler(line) {
    const slot = line.slot || 'auto'
    const name = line.name || `セーブ${slot}`

    const saveData = {
      version: packageJson.version,
      engineVersion: packageJson.version.split('.').slice(0, 2).join('.') + '.x',
      slot: slot,
      name: name,
      timestamp: new Date().toISOString(),
      scenarioManager: {
        progress: JSON.parse(JSON.stringify(this.scenarioManager.progress)),
        sceneName: this.scenarioManager.getSceneName() || this.sceneConfig.name,
        currentIndex: this.scenarioManager.getIndex(),
        history: this.scenarioManager.getHistory ? [...this.scenarioManager.getHistory()] : [],
      },
      sceneConfig: this.sceneConfig,
      displayedImages: Object.keys(this.displayedImages).reduce((acc, key) => {
        if (key !== 'background') {
          acc[key] = {
            src: this.displayedImages[key].image?.src || null,
            pos: this.displayedImages[key].pos,
            size: this.displayedImages[key].size,
            look: this.displayedImages[key].look,
            entry: this.displayedImages[key].entry,
          }
        }
        return acc
      }, {}),
      backgroundImage: this.displayedImages.background?.image?.getImage()?.src || null,
      usedSounds: Object.keys(this.usedSounds).reduce((acc, key) => {
        acc[key] = {
          src: this.usedSounds[key].audio?.src || null,
        }
        return acc
      }, {}),
      bgmSrc: this.bgm?.src || null,
    }

    this.store.set(`save_${slot}`, saveData)

    if (line.message !== false) {
      await this.textHandler(`ゲームをセーブしました: ${name}`)
    }
  }

  async loadHandler(line) {
    const slot = line.slot || 'auto'

    const saveDataRaw = this.store.get ? this.store.get(`save_${slot}`) : this.store[`save_${slot}`]
    if (!saveDataRaw) {
      const errorMsg = `セーブデータが見つかりません: スロット${slot}`

      if (line.message !== false) {
        await this.textHandler(errorMsg)
      }
      return
    }

    // ディープコピーで循環参照を回避
    const saveData = JSON.parse(JSON.stringify(saveDataRaw))

    // バージョンチェック
    if (saveData.version) {
      const currentVersion = packageJson.version
      const savedVersion = saveData.version

      if (savedVersion !== currentVersion) {
        console.warn(`セーブデータのバージョン (${savedVersion}) が現在のエンジンバージョン (${currentVersion}) と異なります`)

        if (line.message !== false) {
          await this.textHandler(`警告: セーブデータのバージョンが異なります (${savedVersion} → ${currentVersion})`)
        }
      }
    } else {
      console.warn('セーブデータにバージョン情報がありません（v0.2.12以前のデータ）')
    }

    try {
      const sceneName = saveData.scenarioManager.sceneName || saveData.sceneConfig.name
      if (!sceneName) {
        throw new Error('Scene name not found in save data')
      }

      // シーンとプログレスを復元
      await this.loadScene(sceneName)
      await this.loadScreen(saveData.sceneConfig, { skipBackground: true, skipBgm: true })

      // 読んだところまで復元
      this.scenarioManager.setSceneName(saveData.scenarioManager.sceneName)
      this.scenarioManager.setIndex(saveData.scenarioManager.currentIndex)
      this.scenarioManager.setHistory(saveData.scenarioManager.history || [])
      this.scenarioManager.progress = { ...this.scenarioManager.progress, ...saveData.scenarioManager.progress }

      // 画面の復元
      this.displayedImages = {}
      if (saveData.backgroundImage) {
        const background = await new ImageObject().setImageAsync(saveData.backgroundImage)
        this.displayedImages['background'] = {
          image: background,
          size: {
            width: this.gameContainer.clientWidth,
            height: this.gameContainer.clientHeight,
          },
        }
      }

      for (const [key, imageData] of Object.entries(saveData.displayedImages)) {
        if (imageData.src) {
          const image = await new ImageObject().setImageAsync(imageData.src)
          this.displayedImages[key] = {
            image: image,
            pos: imageData.pos,
            size: imageData.size,
            look: imageData.look,
            entry: imageData.entry,
          }
        }
      }

      // BGMの復元
      if (saveData.bgmSrc) {
        this.soundHandler({ mode: 'bgm', src: saveData.bgmSrc, loop: true, play: true })
      }

      this.drawer.show(this.displayedImages)

      if (line.message !== false) {
        await this.textHandler(`ゲームをロードしました: ${saveData.name}`)
      }
    } catch (error) {
      const errorMsg = `ロードに失敗しました: ${error.message}`

      if (line.message !== false) {
        await this.textHandler(errorMsg)
      }
    }
  }

  getSaveData() {
    const saveKeys = Object.keys(this.store).filter((key) => key.startsWith('save_'))
    return saveKeys
      .map((key) => this.store[key])
      .sort((a, b) => {
        return new Date(b.timestamp) - new Date(a.timestamp)
      })
  }

  setSaveData(data) {
    this.store.set(`save_${data.slot}`, data)
  }

  getSaveList() {
    return this.getSaveData()
  }

  deleteSave(slot) {
    delete this.store[`save_${slot}`]
  }
}
