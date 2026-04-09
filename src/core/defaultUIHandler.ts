import { EventBus } from '../utils/eventBus'
import { Drawer } from './drawer'

export class DefaultUIHandler {
  /**
   * 指定されたEventBusにDOM操作関連のイベントハンドラをすべて登録する。
   *
   * @param eventBus      - 共有EventBusインスタンス
   * @param drawer        - Drawerインスタンス（キャンバス・テキスト描画）
   * @param gameContainer - ゲームのルートコンテナ要素
   * @param resolution    - キャンバス初期化に使用するエンジン解像度
   */
  static register(
    eventBus: EventBus,
    drawer: Drawer,
    gameContainer: HTMLElement,
    resolution: { width: number; height: number },
  ): void {
    // ----------------------------------------------------------------
    // screen:load
    //   テンプレートURLからHTMLを読み込み・パースしてDOMに注入する。
    //   通常モードはgameContainerのinnerHTMLを置換し、drawer.setScreenを呼び出す。
    //   ダイアログモードはダイアログ要素を追加し、スタイルにマークを付ける。
    //   data.template         — テンプレートファイルのURL
    //   data.isDialog         — ダイアログモードかどうか
    //   data.fallbackTemplate — テンプレートが見つからない場合のフォールバック関数
    // ----------------------------------------------------------------
    eventBus.on('screen:load', async (data: any) => {
      const { template, isDialog, fallbackTemplate } = data

      // テンプレートHTMLをフェッチしてパースする
      const htmlString = await (await fetch(template)).text()
      const parser = new DOMParser()
      const doc = parser.parseFromString(htmlString, 'text/html')

      // ダイアログ用は#dialogContainer、通常画面は#mainを取得する
      let mainDiv: HTMLElement | null = isDialog
        ? doc.getElementById('dialogContainer')
        : doc.getElementById('main')

      if (!mainDiv) {
        // 対象要素が見つからない場合はフォールバックテンプレートを使用する
        if (fallbackTemplate) {
          console.warn('テンプレートにメイン要素が見つからないため、フォールバックを使用します')
          const fallbackContent = fallbackTemplate()
          const wrapper = doc.createElement('div')
          wrapper.innerHTML = fallbackContent.htmlString
          mainDiv = wrapper
          // フォールバックのスタイルをdocに追加する（styleContentの抽出に使用）
          const styleEl = doc.head.getElementsByTagName('style')[0] || doc.createElement('style')
          styleEl.textContent = fallbackContent.styleString || ''
          doc.head.appendChild(styleEl)
        } else {
          throw new Error('テンプレートにメイン要素が見つからず、フォールバックも指定されていません。')
        }
      }

      // <style>タグの内容を取り出す
      const styleElement = doc.head.getElementsByTagName('style')[0]
      const styleContent = styleElement ? styleElement.textContent : null

      if (!isDialog) {
        // 既存のスタイルシートを削除する
        const styleTags = Array.from(document.head.getElementsByTagName('style'))
        styleTags.forEach((tag) => document.head.removeChild(tag))

        // HTMLコンテンツを注入する
        gameContainer.innerHTML = mainDiv.innerHTML

        // キャンバスと各ビューの参照を初期化する
        drawer.setScreen(gameContainer, resolution)

        // テンプレートのスタイルシートを適用する
        if (styleContent) {
          const styleEl = document.createElement('style')
          styleEl.textContent = styleContent
          document.head.appendChild(styleEl)
        }
      } else {
        // 古いダイアログ用スタイルシートを削除する
        document.head
          .querySelectorAll('style[data-dialog-style]')
          .forEach((tag) => document.head.removeChild(tag))

        // 既存のダイアログを閉じて削除する
        const existingDialog = document.querySelector('#dialogContainer') as HTMLDialogElement | null
        if (existingDialog) {
          existingDialog.close()
          existingDialog.remove()
        }

        // 新しいダイアログ要素を追加する
        gameContainer.appendChild(mainDiv)

        // ダイアログ用スタイルシートにマークを付けて適用する
        if (styleContent) {
          const styleEl = document.createElement('style')
          styleEl.textContent = styleContent
          styleEl.setAttribute('data-dialog-style', 'true')
          document.head.appendChild(styleEl)
        }
      }
    })

    // ----------------------------------------------------------------
    // text:clear
    //   メッセージテキスト表示領域をクリアする。
    // ----------------------------------------------------------------
    eventBus.on('text:clear', () => {
      drawer.clearText()
    })

    // ----------------------------------------------------------------
    // text:show
    //   話者名を表示し、コンテンツを1文字ずつアニメーションで描画する。
    //   data.expandVariable — Coreから渡される変数展開コールバック
    //   data.waitFn         — Coreから渡されるwaitHandlerコールバック（<wait>タグ用）
    // ----------------------------------------------------------------
    eventBus.on('text:show', async (data: any) => {
      const { name, content, speed, expandVariable, waitFn } = data
      drawer.drawName(name)
      for (const text of content) {
        if (typeof text === 'string') {
          await drawer.drawText(expandVariable(text), speed)
        } else {
          if (text.type === 'br' || text.type === 'wait') {
            if (text.type === 'br') drawer.drawLineBreak()
            if (text.type === 'wait' && !text.nw) {
              await waitFn({ wait: text.time })
            }
          } else {
            const container = drawer.createDecoratedElement(text)
            await drawer.drawText(expandVariable(text.content[0]), text.speed || speed, container)
          }
        }
      }
    })

    // ----------------------------------------------------------------
    // choice:show
    //   インタラクティブビューを表示し、Drawerで選択肢ボタンを描画して、
    //   選択後に非表示に戻す。選択結果 { selectId, onSelect } を返す。
    // ----------------------------------------------------------------
    eventBus.on('choice:show', async (data: any) => {
      const interactiveView = document.querySelector('#interactiveView') as HTMLElement | null
      if (interactiveView) interactiveView.style.visibility = 'visible'
      const result = await drawer.drawChoices(data)
      if (interactiveView) interactiveView.style.visibility = 'hidden'
      return result
    })

    // ----------------------------------------------------------------
    // dialog:show
    //   読み込まれたダイアログコンテナにプロンプトテキストとアクションボタンを
    //   設定し、モーダルを表示する。ダイアログが閉じられると選択されたアクションの
    //   IDで解決するPromiseを返す。
    //   data.expandVariable — Coreから渡される変数展開コールバック
    //   data.addScenario    — scenarioManager.addScenarioコールバック
    // ----------------------------------------------------------------
    eventBus.on('dialog:show', async (data: any) => {
      const { content, expandVariable, addScenario } = data
      let result: any = null

      const dialogContainer = document.querySelector('#dialogContainer') as HTMLDialogElement | null
      if (!dialogContainer) {
        throw new Error('Dialog container not found.')
      }

      content.forEach((item: any) => {
        if (item.type === 'prompt') {
          const promptElement = dialogContainer.querySelector('.dialog-prompt')
          if (promptElement) {
            promptElement.innerHTML = item.content
              .map((text: any) => expandVariable(text))
              .join('\n')
          }
        } else if (item.type === 'actions') {
          const buttonContainer = dialogContainer.querySelector('.dialog-buttons')
          if (!buttonContainer) return
          item.content.forEach((action: any) => {
            action.label = expandVariable(action.label)
            let button = buttonContainer.querySelector(
              `#dialog-button-${action.id}`,
            ) as HTMLButtonElement | null
            if (!button) {
              // ボタンが存在しない場合は新規作成する
              button = document.createElement('button')
              button.id = `dialog-button-${action.id}`
              button.classList.add('dialog-button')
              buttonContainer.appendChild(button)
            }
            button.innerText = action.label
            button.addEventListener('click', () => {
              // 選択されたアクションのシナリオを追加してダイアログを閉じる
              addScenario(action.content)
              result = action.id
              dialogContainer.close()
            })
          })
        }
      })

      dialogContainer.showModal()
      return new Promise<any>((resolve) => {
        dialogContainer.addEventListener('close', () => {
          resolve(result)
        })
      })
    })

    // ----------------------------------------------------------------
    // input:bind
    //   ゲームコンテナにキーボードとクリックのリスナーをバインドする。
    //   data.onNext  — ユーザーが進行操作（Enter / クリック）した際に呼ばれる
    //   data.setSkip — (drawerSkip: boolean, coreNext: boolean) => void
    //   再度 input:bind が発行された際は以前のリスナーを先に削除する。
    // ----------------------------------------------------------------
    let inputAbortController: AbortController | null = null
    eventBus.on('input:bind', (data: any) => {
      // 重複登録を防ぐために以前バインドしたリスナーを削除する
      if (inputAbortController) inputAbortController.abort()
      inputAbortController = new AbortController()
      const { signal } = inputAbortController
      const { onNext, setSkip, toggleAuto, toggleSkip } = data
      gameContainer.addEventListener(
        'keydown',
        (e: KeyboardEvent) => {
          if (e.key === 'Enter') {
            onNext()
          } else if (e.key === 'Control') {
            setSkip(true, true)
          } else if ((e.key === 'a' || e.key === 'A') && toggleAuto) {
            toggleAuto()
          } else if ((e.key === 's' || e.key === 'S') && toggleSkip) {
            toggleSkip()
          }
        },
        { signal },
      )
      gameContainer.addEventListener(
        'keyup',
        (e: KeyboardEvent) => {
          if (e.key === 'Control') {
            setSkip(true, false)
          }
        },
        { signal },
      )
      gameContainer.addEventListener('click', () => onNext(), { signal })
    })
  }
}
