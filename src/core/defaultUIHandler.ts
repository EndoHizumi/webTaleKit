import { EventBus } from '../utils/eventBus'
import { Drawer } from './drawer'

export class DefaultUIHandler {
  /**
   * Register all DOM-related event handlers onto the given EventBus.
   *
   * @param eventBus     - The shared EventBus instance
   * @param drawer       - The Drawer instance (canvas + text rendering)
   * @param gameContainer - The root game container element
   * @param resolution   - Engine resolution used to initialise the canvas
   */
  static register(
    eventBus: EventBus,
    drawer: Drawer,
    gameContainer: HTMLElement,
    resolution: { width: number; height: number },
  ): void {
    // ----------------------------------------------------------------
    // screen:load
    //   Injects parsed template HTML and CSS into the DOM.
    //   For dialog mode it appends the dialog element and marks its style.
    // ----------------------------------------------------------------
    eventBus.on('screen:load', async (data: any) => {
      const { element, html, style, isDialog } = data

      if (!isDialog) {
        // Remove any existing stylesheets
        const styleTags = Array.from(document.head.getElementsByTagName('style'))
        styleTags.forEach((tag) => document.head.removeChild(tag))

        // Inject HTML content
        gameContainer.innerHTML = html

        // Initialise the canvas / named view references
        drawer.setScreen(gameContainer, resolution)

        // Apply the template stylesheet
        if (style) {
          const styleEl = document.createElement('style')
          styleEl.textContent = style
          document.head.appendChild(styleEl)
        }
      } else {
        // Remove stale dialog stylesheets
        document.head
          .querySelectorAll('style[data-dialog-style]')
          .forEach((tag) => document.head.removeChild(tag))

        // Close and remove any existing dialog
        const existingDialog = document.querySelector('#dialogContainer') as HTMLDialogElement | null
        if (existingDialog) {
          existingDialog.close()
          existingDialog.remove()
        }

        // Append the new dialog element
        gameContainer.appendChild(element)

        // Apply the dialog stylesheet with a marker attribute
        if (style) {
          const styleEl = document.createElement('style')
          styleEl.textContent = style
          styleEl.setAttribute('data-dialog-style', 'true')
          document.head.appendChild(styleEl)
        }
      }
    })

    // ----------------------------------------------------------------
    // text:clear
    //   Clears the message text area.
    // ----------------------------------------------------------------
    eventBus.on('text:clear', () => {
      drawer.clearText()
    })

    // ----------------------------------------------------------------
    // text:show
    //   Renders the speaker name and animates content character-by-character.
    //   data.expandVariable — variable expansion callback from Core
    //   data.waitFn         — waitHandler callback from Core (for <wait> tags)
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
    //   Makes the interactive view visible, renders choice buttons via
    //   the Drawer, then hides the view again.
    //   Returns the selection result { selectId, onSelect }.
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
    //   Populates the loaded dialog container with prompt text and
    //   action buttons, shows the modal, and returns a Promise that
    //   resolves with the selected action id when the dialog closes.
    //   data.expandVariable — variable expansion callback from Core
    //   data.addScenario    — scenarioManager.addScenario callback
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
    //   Attaches keyboard and click listeners to the game container.
    //   data.onNext   — called when the user advances (Enter / click)
    //   data.setSkip  — (drawerSkip: boolean, coreNext: boolean) => void
    //   Calling input:bind again removes the previous listeners first.
    // ----------------------------------------------------------------
    let inputAbortController: AbortController | null = null
    eventBus.on('input:bind', (data: any) => {
      // Remove any previously bound listeners to avoid duplicates
      if (inputAbortController) inputAbortController.abort()
      inputAbortController = new AbortController()
      const { signal } = inputAbortController
      const { onNext, setSkip } = data
      gameContainer.addEventListener(
        'keydown',
        (e: KeyboardEvent) => {
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
