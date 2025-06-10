/**
 * WebTaleKit Script API Module
 * 
 * This module provides a human-friendly API interface for script files.
 * It extracts the functionality from Core.getAPIForScript() into a separate module
 * with clean, well-documented methods.
 */

export class ScriptAPI {
  private coreInstance: any

  constructor(core: any) {
    this.coreInstance = core
  }

  /**
   * Drawing and visual effects API
   */
  get drawer() {
    return {
      /**
       * Display a character name
       * @param name - The character name to display
       */
      drawName: (name: string) => this.coreInstance.drawer.drawName(name),

      /**
       * Display text with optional animation speed
       * @param text - The text to display
       * @param speed - Animation speed in milliseconds (default: 25)
       * @param container - Optional DOM container element
       */
      drawText: (text: string, speed?: number, container?: HTMLElement) => 
        this.coreInstance.drawer.drawText(text, speed, container),

      /**
       * Display choice options for user interaction
       * @param choiceData - Choice configuration object
       */
      drawChoices: (choiceData: any) => this.coreInstance.drawer.drawChoices(choiceData),

      /**
       * Clear the text display area
       */
      clearText: () => this.coreInstance.drawer.clearText(),

      /**
       * Show all currently displayed images
       * @param images - Object containing image data to display
       */
      show: (images: any) => this.coreInstance.drawer.show(images),

      /**
       * Move an image to a new position with animation
       * @param key - Image identifier
       * @param images - Current image collection
       * @param position - Target position {x, y}
       * @param duration - Animation duration in milliseconds
       */
      moveTo: (key: string, images: any, position: {x: number, y: number}, duration: number) =>
        this.coreInstance.drawer.moveTo(key, images, position, duration),

      /**
       * Fade in an image with animation
       * @param duration - Fade duration in milliseconds
       * @param image - Image object to fade in
       * @param options - Display options {pos, size, look, entry}
       */
      fadeIn: (duration: number, image: any, options: any) =>
        this.coreInstance.drawer.fadeIn(duration, image, options),

      /**
       * Fade out an image with animation
       * @param duration - Fade duration in milliseconds
       * @param image - Image object to fade out
       * @param options - Display options {pos, size, look}
       */
      fadeOut: (duration: number, image: any, options: any) =>
        this.coreInstance.drawer.fadeOut(duration, image, options)
    }
  }

  /**
   * Sound and music control API
   */
  get sound() {
    return {
      /**
       * Play a sound or music file
       * @param soundData - Sound configuration object
       */
      play: (soundData: any) => this.coreInstance.soundHandler(soundData),

      /**
       * Stop a playing sound
       * @param name - Sound identifier
       */
      stop: (name: string) => this.coreInstance.soundHandler({ name, stop: true }),

      /**
       * Pause a playing sound
       * @param name - Sound identifier
       */
      pause: (name: string) => this.coreInstance.soundHandler({ name, pause: true })
    }
  }

  /**
   * Scenario flow control API
   */
  get scenario() {
    return {
      /**
       * Jump to a specific scenario index
       * @param jumpData - Jump configuration object
       */
      jump: (jumpData: any) => this.coreInstance.jumpHandler(jumpData),

      /**
       * Add scenarios to the current scenario queue
       * @param scenarios - Array of scenario objects to add
       */
      addScene: (scenarios: any[]) => this.coreInstance.scenarioManager.addScenario(scenarios),

      /**
       * Get current scenario progress information
       * @returns Current progress object
       */
      getProgress: () => this.coreInstance.scenarioManager.progress,

      /**
       * Set scenario progress
       * @param progress - Progress object to set
       */
      setProgress: (progress: any) => {
        this.coreInstance.scenarioManager.progress = progress
      },

      /**
       * Get current scenario index
       * @returns Current index number
       */
      getIndex: () => this.coreInstance.scenarioManager.getIndex(),

      /**
       * Set scenario index
       * @param index - Index to set
       */
      setIndex: (index: number) => this.coreInstance.scenarioManager.setIndex(index),

      /**
       * Check if there are more scenarios to process
       * @returns True if more scenarios exist
       */
      hasNext: () => this.coreInstance.scenarioManager.hasNext(),

      /**
       * Get the next scenario object
       * @returns Next scenario object
       */
      next: () => this.coreInstance.scenarioManager.next(),

      /**
       * Get scenario history
       * @returns Array of historical scenario data
       */
      getHistory: () => this.coreInstance.scenarioManager.getHistory(),

      /**
       * Set scenario history
       * @param history - History data to set
       */
      setHistory: (history: any) => this.coreInstance.scenarioManager.setHistory(history),

      /**
       * Set the entire scenario array
       * @param scenario - Array of scenario objects
       */
      setScenario: (scenario: any[]) => this.coreInstance.scenarioManager.setScenario(scenario),

      /**
       * Get the current scenario array
       * @returns Array of scenario objects
       */
      getScenario: () => this.coreInstance.scenarioManager.getScenario(),

      /**
       * Get current scene name
       * @returns Scene name string
       */
      getSceneName: () => this.coreInstance.scenarioManager.progress.currentScene,

      /**
       * Set screen name
       * @param name - Screen name to set
       */
      setScreenName: (name: string) => {
        this.coreInstance.sceneConfig.name = name
      }
    }
  }

  /**
   * Image management API
   */
  get images() {
    return {
      /**
       * Get an image object by configuration
       * @param imageConfig - Image configuration object
       * @returns Promise resolving to image object
       */
      get: (imageConfig: any) => this.coreInstance.getImageObject(imageConfig),

      /**
       * Get all currently displayed images
       * @returns Object containing all displayed images
       */
      getAll: () => this.coreInstance.displayedImages,

      /**
       * Set an image in the display collection
       * @param name - Image identifier
       * @param image - Image object to set
       */
      set: (name: string, image: any) => {
        this.coreInstance.displayedImages[name] = image
      },

      /**
       * Remove an image from the display collection
       * @param name - Image identifier to remove
       */
      delete: (name: string) => {
        delete this.coreInstance.displayedImages[name]
      }
    }
  }

  /**
   * Sound resource management API
   */
  get sounds() {
    return {
      /**
       * Get a sound object by name
       * @param name - Sound identifier
       * @returns Sound object
       */
      get: (name: string) => this.coreInstance.usedSounds[name],

      /**
       * Get all loaded sounds
       * @returns Object containing all sound objects
       */
      getAll: () => this.coreInstance.usedSounds,

      /**
       * Set a sound object
       * @param name - Sound identifier
       * @param sound - Sound object to set
       */
      set: (name: string, sound: any) => {
        this.coreInstance.usedSounds[name] = sound
      },

      /**
       * Remove a sound object
       * @param name - Sound identifier to remove
       */
      delete: (name: string) => {
        delete this.coreInstance.usedSounds[name]
      },

      /**
       * Load a sound object from configuration
       * @param soundConfig - Sound configuration object
       * @returns Promise resolving to sound object
       */
      load: (soundConfig: any) => this.coreInstance.getSoundObject(soundConfig)
    }
  }

  /**
   * Background image management API
   */
  get background() {
    return {
      /**
       * Set the background image
       * @param image - Image object to set as background
       */
      set: (image: any) => this.coreInstance.setBackground(image),

      /**
       * Get the current background image
       * @returns Current background image object
       */
      get: () => this.coreInstance.getBackground()
    }
  }

  /**
   * Wait for user input or time delay
   * @param waitConfig - Wait configuration object
   * @returns Promise that resolves when wait condition is met
   */
  wait(waitConfig: any) {
    return this.coreInstance.waitHandler(waitConfig)
  }

  /**
   * Wait for user click/tap input
   * @returns Promise that resolves when user clicks
   */
  clickWait() {
    return this.coreInstance.clickWait()
  }

  /**
   * Core game commands API - Direct access to all game commands
   */
  get core() {
    return {
      /**
       * Display text with character name and styling
       * @param textData - Text configuration object
       */
      text: (textData: any) => this.coreInstance.textHandler(textData),

      /**
       * Present choices to the user
       * @param choiceData - Choice configuration object
       */
      choice: (choiceData: any) => this.coreInstance.choiceHandler(choiceData),

      /**
       * Show an image on screen
       * @param showData - Show configuration object
       */
      show: (showData: any) => this.coreInstance.showHandler(showData),

      /**
       * Clear screen and reset to background only
       */
      newpage: () => this.coreInstance.newpageHandler(),

      /**
       * Hide an image from screen
       * @param hideData - Hide configuration object
       */
      hide: (hideData: any) => this.coreInstance.hideHandler(hideData),

      /**
       * Jump to a specific scenario index
       * @param jumpData - Jump configuration object
       */
      jump: (jumpData: any) => this.coreInstance.jumpHandler(jumpData),

      /**
       * Play, stop, or control sound
       * @param soundData - Sound configuration object
       */
      sound: (soundData: any) => this.coreInstance.soundHandler(soundData),

      /**
       * Character speech with voice and name display
       * @param sayData - Say configuration object
       */
      say: (sayData: any) => this.coreInstance.sayHandler(sayData),

      /**
       * Conditional branching in scenario
       * @param ifData - If condition configuration object
       */
      if: (ifData: any) => this.coreInstance.ifHandler(ifData),

      /**
       * Move an image to a new position
       * @param moveData - Move configuration object
       */
      moveto: (moveData: any) => this.coreInstance.moveToHandler(moveData),

      /**
       * Route to a different scene
       * @param routeData - Route configuration object
       */
      route: (routeData: any) => this.coreInstance.routeHandler(routeData),

      /**
       * Wait for input or time delay
       * @param waitData - Wait configuration object
       */
      wait: (waitData: any) => this.coreInstance.waitHandler(waitData)
    }
  }
}

/**
 * Factory function to create ScriptAPI instance
 * @param core - Core instance to bind to
 * @returns ScriptAPI instance with all methods bound to the core
 */
export function createScriptAPI(core: any): ScriptAPI {
  return new ScriptAPI(core)
}