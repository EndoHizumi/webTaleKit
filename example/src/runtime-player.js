import { Core } from 'webtalekit-alpha/src/core/'
import { domParserAdapter } from 'webtalekit-alpha/src/editor/domParserAdapter.js'
import engineConfig from '../engineConfig.json'

const parseScene = require('../../parser/parser.js')
const TYPESCRIPT_COMPILER_PATH = './vendor/typescript.js'

const RUNTIME_CONTAINER_SELECTOR = '#gameContainer'

const scopeTemplateCss = (styleContent) => {
  if (!styleContent || !styleContent.trim()) return ''

  return styleContent.replace(/(^|})\s*([^@}{][^{]+)\{/g, (match, boundary, selectorGroup) => {
    const scopedSelectors = selectorGroup
      .split(',')
      .map((selector) => selector.trim())
      .filter(Boolean)
      .map((selector) => {
        if (selector === 'html' || selector === 'body') {
          return RUNTIME_CONTAINER_SELECTOR
        }

        if (selector === '#main') {
          return RUNTIME_CONTAINER_SELECTOR
        }

        if (selector.startsWith(RUNTIME_CONTAINER_SELECTOR)) {
          return selector
        }

        return `${RUNTIME_CONTAINER_SELECTOR} ${selector}`
      })
      .join(', ')

    return `${boundary}${scopedSelectors}{`
  })
}

const registerRuntimePreviewUI = (eventBus, drawer, gameContainer, resolution) => {
  const getScopedStyleElement = (styleId) => gameContainer.querySelector(`style[data-runtime-style="${styleId}"]`)

  eventBus.on('screen:load', async (data) => {
    const { template, isDialog, fallbackTemplate } = data
    const htmlString = await (await fetch(template)).text()
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlString, 'text/html')

    let mainDiv = isDialog ? doc.getElementById('dialogContainer') : doc.getElementById('main')
    if (!mainDiv) {
      if (!fallbackTemplate) {
        throw new Error('テンプレートにメイン要素が見つかりません。')
      }
      const fallbackContent = fallbackTemplate()
      const wrapper = doc.createElement('div')
      wrapper.innerHTML = fallbackContent.htmlString
      mainDiv = wrapper.firstElementChild || wrapper
      const styleEl = doc.createElement('style')
      styleEl.textContent = fallbackContent.styleString || ''
      doc.head.appendChild(styleEl)
    }

    const styleContent = Array.from(doc.head.querySelectorAll('style'))
      .map((styleEl) => styleEl.textContent || '')
      .join('\n')

    if (!isDialog) {
      const oldStyle = getScopedStyleElement('screen')
      if (oldStyle) oldStyle.remove()

      gameContainer.innerHTML = mainDiv.innerHTML

      const scopedStyleContent = scopeTemplateCss(styleContent)
      if (scopedStyleContent.trim()) {
        const styleEl = document.createElement('style')
        styleEl.dataset.runtimeStyle = 'screen'
        styleEl.textContent = scopedStyleContent
        gameContainer.prepend(styleEl)
      }

      drawer.setScreen(gameContainer, resolution)
      gameContainer.focus()
      return
    }

    const oldDialogStyle = getScopedStyleElement('dialog')
    if (oldDialogStyle) oldDialogStyle.remove()

    const existingDialog = gameContainer.querySelector('#dialogContainer')
    if (existingDialog) {
      existingDialog.remove()
    }

    if (styleContent.trim()) {
      const styleEl = document.createElement('style')
      styleEl.dataset.runtimeStyle = 'dialog'
      styleEl.textContent = styleContent
      gameContainer.appendChild(styleEl)
    }

    gameContainer.appendChild(mainDiv)
  })

  eventBus.on('text:clear', () => {
    drawer.clearText()
  })

  eventBus.on('text:show', async (data) => {
    const { name, content, speed, expandVariable, waitFn } = data
    drawer.drawName(name)
    for (const text of content) {
      if (typeof text === 'string') {
        await drawer.drawText(expandVariable(text), speed)
        continue
      }

      if (text.type === 'br' || text.type === 'wait') {
        if (text.type === 'br') drawer.drawLineBreak()
        if (text.type === 'wait' && !text.nw) {
          await waitFn({ wait: text.time })
        }
        continue
      }

      const container = drawer.createDecoratedElement(text)
      await drawer.drawText(expandVariable(text.content[0]), text.speed || speed, container)
    }
  })

  eventBus.on('choice:show', async (data) => {
    const interactiveView = gameContainer.querySelector('#interactiveView')
    if (interactiveView) interactiveView.style.visibility = 'visible'
    const result = await drawer.drawChoices(data)
    if (interactiveView) interactiveView.style.visibility = 'hidden'
    return result
  })

  eventBus.on('dialog:show', async (data) => {
    const { content, expandVariable, addScenario } = data
    let result = null

    const dialogContainer = gameContainer.querySelector('#dialogContainer')
    if (!dialogContainer) {
      throw new Error('Dialog container not found.')
    }

    content.forEach((item) => {
      if (item.type === 'prompt') {
        const promptElement = dialogContainer.querySelector('.dialog-prompt')
        if (promptElement) {
          promptElement.innerHTML = item.content.map((text) => expandVariable(text)).join('\n')
        }
        return
      }

      if (item.type !== 'actions') return

      const buttonContainer = dialogContainer.querySelector('.dialog-buttons')
      if (!buttonContainer) return

      item.content.forEach((action) => {
        action.label = expandVariable(action.label)
        let button = buttonContainer.querySelector(`#dialog-button-${action.id}`)
        if (!button) {
          button = document.createElement('button')
          button.id = `dialog-button-${action.id}`
          button.classList.add('dialog-button')
          buttonContainer.appendChild(button)
        }
        button.innerText = action.label
        button.addEventListener('click', () => {
          addScenario(action.content)
          result = action.id
          dialogContainer.close()
        })
      })
    })

    dialogContainer.showModal()
    return new Promise((resolve) => {
      dialogContainer.addEventListener(
        'close',
        () => {
          resolve(result)
        },
        { once: true },
      )
    })
  })

  let inputAbortController = null
  eventBus.on('input:bind', (data) => {
    if (inputAbortController) inputAbortController.abort()
    inputAbortController = new AbortController()
    const { signal } = inputAbortController
    const { onNext, setSkip } = data

    gameContainer.addEventListener(
      'keydown',
      (e) => {
        if (e.key === 'Enter') {
          onNext()
        } else if (e.key === 'Control') {
          setSkip(true, true)
        }
      },
      { signal },
    )

    gameContainer.addEventListener(
      'keyup',
      (e) => {
        if (e.key === 'Control') {
          setSkip(true, false)
        }
      },
      { signal },
    )

    gameContainer.addEventListener(
      'click',
      () => {
        gameContainer.focus()
        onNext()
      },
      { signal },
    )
  })
}

const DEFAULT_SCENE_SOURCE = `<scene>
  <scenario>
    <text>ブラウザ版パーサーのリアルタイム実行デモです。</text>
    <text>左側のエディタを編集して、Run Preview を押してください。</text>
    <say name="Guide">このシーンはブラウザ内で WTS をパースしてから、そのまま実行されています。</say>
    <choice prompt="次に何を試しますか？">
      <item label="変数を更新する">
        <call method="counter += 1" />
        <text>counter は {{counter}} になりました。</text>
      </item>
      <item label="別シーンへ route する">
        <route to="runtime-secondary" />
      </item>
    </choice>
  </scenario>

  <script type="text/typescript">
    export let counter = 0

    export const sceneConfig = {
      name: 'runtime-preview',
      background: './src/resource/background/library.jpg',
      template: './src/screen/title.html'
    }
  </script>
</scene>`

const SECOND_SCENE_SOURCE = `<scene>
  <scenario>
    <text>route で遷移したシーンです。</text>
    <text>複数の WTS をブラウザ内で同時に登録できます。</text>
    <choice prompt="戻りますか？">
      <item label="最初のシーンへ戻る">
        <route to="runtime-preview" />
      </item>
    </choice>
  </scenario>

  <script>
    export const sceneConfig = {
      name: 'runtime-secondary',
      background: './src/resource/background/crossroad.jpg',
      template: './src/screen/title.html'
    }
  </script>
</scene>`

const SAMPLE_SCENES = {
  starter: {
    label: 'Starter',
    files: {
      'runtime-preview.scene': DEFAULT_SCENE_SOURCE,
      'runtime-secondary.scene': SECOND_SCENE_SOURCE,
    },
  },
  textOnly: {
    label: 'Text Only',
    files: {
      'runtime-preview.scene': `<scene>
  <scenario>
    <text>最小構成のサンプルです。</text>
    <text>script ブロックなしでも実行できます。</text>
  </scenario>

  <script>
    export const sceneConfig = {
      name: 'runtime-preview',
      background: './src/resource/background/title_bg.png',
      template: './src/screen/title.html'
    }
  </script>
</scene>`,
    },
  },
}

class RuntimePreviewCore extends Core {
  constructor(options = {}) {
    super({ ...options, customUI: true })
    this.runtimeSceneModules = new Map()
    this.isDisposed = false
    registerRuntimePreviewUI(this.eventBus, this.drawer, this.gameContainer, engineConfig.resolution)
  }

  registerRuntimeScene(sceneName, sceneLoader) {
    this.runtimeSceneModules.set(sceneName, sceneLoader)
  }

  async applySceneModule(moduleNamespace, sceneFileName) {
    this.sceneFile = { ...moduleNamespace }
    if (this.sceneFile.init) {
      this.sceneFile.init(this.getAPIForScript())
    }
    this.scenarioManager.setScenario(this.sceneFile.scenario, sceneFileName)
    this.sceneConfig = { ...this.sceneConfig, ...this.sceneFile.sceneConfig }
  }

  async loadScene(sceneFileName) {
    if (this.runtimeSceneModules.has(sceneFileName)) {
      const moduleNamespace = await this.runtimeSceneModules.get(sceneFileName)()
      await this.applySceneModule(moduleNamespace, sceneFileName)
      return
    }

    await super.loadScene(sceneFileName)
  }

  async start(initScene) {
    try {
      document.title = engineConfig.title
      await this.loadScene(initScene || 'title')
      await this.loadScreen(this.sceneConfig)
      await this.eventBus.emit('input:bind', {
        onNext: () => {
          if (this.onNextHandler) this.onNextHandler()
        },
        setSkip: (drawerSkip, coreNext) => {
          this.drawer.isSkip = drawerSkip
          this.isNext = coreNext
        },
      })

      await this.textHandler('タップでスタート')

      if (this.sceneConfig.bgm) {
        await this.soundHandler({
          mode: 'bgm',
          src: this.sceneConfig.bgm,
          loop: true,
          play: true,
        })
      }

      while (!this.isDisposed && this.scenarioManager.hasNext()) {
        await this.runScenario()
      }
    } catch (error) {
      if (this.isDisposed) {
        return
      }
      this.renderRuntimeError(error)
      throw error
    }
  }

  async clickWait() {
    this.drawer.setVisibility('#waitCircle', true)
    return new Promise((resolve) => {
      const intervalId = setInterval(() => {
        if (this.isDisposed || this.isNext) {
          this.drawer.setVisibility('#waitCircle', false)
          clearInterval(intervalId)
          this.isNext = false
          resolve(null)
        }
      }, 100)
    })
  }

  dispose() {
    this.isDisposed = true

    if (this.sceneFile.cleanUp) {
      this.sceneFile.cleanUp()
    }

    if (this.bgm && this.bgm.isPlaying) {
      this.bgm.stop()
    }

    Object.values(this.usedSounds).forEach((resource) => {
      if (resource.audio) {
        resource.audio.stop()
      }
    })

    this.isNext = true
  }

  renderRuntimeError(error) {
    const status = document.getElementById('runtimeStatus')
    if (status) {
      status.textContent = error.message
      status.dataset.state = 'error'
    }
  }
}

const toScriptSource = (script) => {
  if (!script) return ''
  if (Array.isArray(script)) return script.join('\n')
  return String(script)
}

const ensureTypeScript = async () => {
  if (window.ts) {
    return window.ts
  }

  const existingScript = document.querySelector(`script[data-runtime-ts="${TYPESCRIPT_COMPILER_PATH}"]`)
  if (existingScript) {
    await new Promise((resolve, reject) => {
      existingScript.addEventListener('load', () => resolve(), { once: true })
      existingScript.addEventListener('error', () => reject(new Error('Failed to load the TypeScript compiler.')), {
        once: true,
      })
    })
    if (!window.ts) {
      throw new Error('TypeScript compiler did not initialize correctly.')
    }
    return window.ts
  }

  await new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = TYPESCRIPT_COMPILER_PATH
    script.async = true
    script.dataset.runtimeTs = TYPESCRIPT_COMPILER_PATH
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load the TypeScript compiler.'))
    document.head.appendChild(script)
  })

  if (!window.ts) {
    throw new Error('TypeScript compiler did not initialize correctly.')
  }

  return window.ts
}

const transpileScript = async (scriptSource, lang) => {
  if (!scriptSource.trim()) return ''
  if (lang === 'text/typescript') {
    const ts = await ensureTypeScript()
    return ts.transpileModule(scriptSource, {
      compilerOptions: {
        module: ts.ModuleKind.ES2020,
        target: ts.ScriptTarget.ES2018,
      },
    }).outputText
  }
  return scriptSource
}

const formatIssues = (issues) =>
  issues.map((issue) => `- [${issue.type}] ${issue.message || JSON.stringify(issue)}`).join('\n')

const compileRuntimeScene = async (source) => {
  const { scenario, script, lang, errors } = await parseScene(source, domParserAdapter)
  const syntaxErrors = (errors || []).filter((issue) => issue.type !== 'unknown_attribute')
  const warnings = (errors || []).filter((issue) => issue.type === 'unknown_attribute')

  if (syntaxErrors.length > 0) {
    throw new Error(`WTS parse failed\n${formatIssues(syntaxErrors)}`)
  }

  const runtimeScript = await transpileScript(toScriptSource(script), lang)
  const moduleSource = `${runtimeScript}\nexport const scenario = ${JSON.stringify(scenario)};\n`
  const blobUrl = URL.createObjectURL(new Blob([moduleSource], { type: 'text/javascript' }))

  try {
    const moduleNamespace = await import(/* webpackIgnore: true */ blobUrl)
    if (!moduleNamespace.sceneConfig || !moduleNamespace.sceneConfig.name) {
      throw new Error('sceneConfig.name is required for runtime execution.')
    }
    return {
      sceneName: moduleNamespace.sceneConfig.name,
      moduleNamespace,
      warnings,
      dispose: () => URL.revokeObjectURL(blobUrl),
    }
  } catch (error) {
    URL.revokeObjectURL(blobUrl)
    throw error
  }
}

const runtimeState = {
  game: null,
  disposeModules: [],
}

const statusElement = document.getElementById('runtimeStatus')
const editorElement = document.getElementById('runtimeSource')
const sceneListElement = document.getElementById('runtimeSceneList')
const sampleSelectElement = document.getElementById('sampleSelect')
const runButtonElement = document.getElementById('runPreviewButton')
const resetButtonElement = document.getElementById('resetSampleButton')

const setStatus = (message, state = 'idle') => {
  statusElement.textContent = message
  statusElement.dataset.state = state
}

const syncEditorFromFiles = (files) => {
  const names = Object.keys(files)
  const selectedName = sceneListElement.value && files[sceneListElement.value] ? sceneListElement.value : names[0]
  sceneListElement.innerHTML = names
    .map((name) => `<option value="${name}">${name}</option>`)
    .join('')
  sceneListElement.value = selectedName
  editorElement.value = files[selectedName]
}

const buildSampleOptions = () => {
  sampleSelectElement.innerHTML = Object.entries(SAMPLE_SCENES)
    .map(([key, sample]) => `<option value="${key}">${sample.label}</option>`)
    .join('')
}

const getWorkingFiles = () => {
  const activeSample = SAMPLE_SCENES[sampleSelectElement.value]
  if (!activeSample.__workingFiles) {
    activeSample.__workingFiles = { ...activeSample.files }
  }
  return activeSample.__workingFiles
}

const loadSample = (sampleKey) => {
  const sample = SAMPLE_SCENES[sampleKey]
  sample.__workingFiles = { ...sample.files }
  syncEditorFromFiles(sample.__workingFiles)
  setStatus('サンプルを読み込みました。Run Preview で実行できます。', 'idle')
}

const disposeCurrentRuntime = () => {
  if (runtimeState.game) {
    runtimeState.game.dispose()
    runtimeState.game = null
  }

  runtimeState.disposeModules.forEach((dispose) => dispose())
  runtimeState.disposeModules = []

  const gameContainer = document.getElementById('gameContainer')
  if (gameContainer) {
    gameContainer.innerHTML = ''
  }
}

const runPreview = async () => {
  const files = getWorkingFiles()
  files[sceneListElement.value] = editorElement.value

  runButtonElement.disabled = true
  setStatus('ブラウザ版パーサーでシーンを解析しています...', 'running')

  try {
    const compiledScenes = await Promise.all(
      Object.values(files).map((source) => compileRuntimeScene(source)),
    )

    disposeCurrentRuntime()

    const game = new RuntimePreviewCore()
    game.setConfig(engineConfig)

    compiledScenes.forEach((scene) => {
      runtimeState.disposeModules.push(scene.dispose)
      game.registerRuntimeScene(scene.sceneName, async () => scene.moduleNamespace)
    })

    runtimeState.game = game
    setStatus(
      compiledScenes.some((scene) => scene.warnings.length > 0)
        ? `実行開始。属性警告があります。\n${compiledScenes
            .flatMap((scene) => scene.warnings)
            .map((issue) => `- ${issue.message}`)
            .join('\n')}`
        : '実行開始。右側のプレビューをクリックして進めてください。',
      compiledScenes.some((scene) => scene.warnings.length > 0) ? 'warning' : 'success',
    )

    game.start(compiledScenes[0].sceneName).catch((error) => {
      if (!game.isDisposed) {
        setStatus(error.message, 'error')
      }
    })
  } catch (error) {
    disposeCurrentRuntime()
    setStatus(error.message, 'error')
  } finally {
    runButtonElement.disabled = false
  }
}

buildSampleOptions()
loadSample('starter')

sampleSelectElement.addEventListener('change', () => {
  loadSample(sampleSelectElement.value)
})

sceneListElement.addEventListener('change', () => {
  const files = getWorkingFiles()
  files[sceneListElement.value] = editorElement.value
  editorElement.value = files[sceneListElement.value]
})

editorElement.addEventListener('input', () => {
  const files = getWorkingFiles()
  files[sceneListElement.value] = editorElement.value
})

runButtonElement.addEventListener('click', () => {
  runPreview()
})

resetButtonElement.addEventListener('click', () => {
  loadSample(sampleSelectElement.value)
  disposeCurrentRuntime()
})

window.addEventListener('beforeunload', () => {
  disposeCurrentRuntime()
})