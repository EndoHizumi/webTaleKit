# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

webTaleKit is a TypeScript-based visual novel game engine that allows creating interactive stories using HTML, CSS, and JavaScript. The engine supports flexible UI creation, scenario control with markup language and JavaScript, and automatic scaling for various window sizes.

## Development Commands

### Build and Development
- `npm run build` - Compile TypeScript to JavaScript and prepare distribution files
- `npm run dev` - Build the project and run development server in example folder
- `npm run lint` - Run ESLint for code quality checking
- `npm run test` - Run Jest tests
- `npx jest path/to/file.test.ts` - Run a single test file
- `npm run docs:dev` - Start VitePress documentation dev server
- `npm run docs:build` - Build documentation site

### CLI Tool
- `wtc` - WebTaleScript parser CLI (available via `parser/cli.js`)
- Usage: `wtc <scene-file> [output-directory]` to convert .scene files to .js/.ts files

## Architecture

### Core Components

- **Core** (`src/core/index.js`): Main 976-line command dispatcher and state orchestrator. Holds `displayedImages` (currently shown images), `sceneFile` (loaded scene exports), and `sceneConfig`. Note: this file is plain JavaScript, not TypeScript.
- **ScenarioManager** (`src/core/scenarioManager.ts`): Tracks execution index, injects dynamic choice branches (marked `sub=true`), manages text history/backlog.
- **Drawer** (`src/core/drawer.ts`): Canvas-based rendering — text animation, choice buttons, image compositing, fade transitions, responsive scaling.
- **ResourceManager** (`src/core/resourceManager.ts`): Lightweight asset registry (currently underdeveloped; actual loading happens inline in command handlers).

### Execution Flow

```
core.start(initScene)
  → loadScene()    // dynamic import of compiled .scene JS file
  → loadScreen()   // inject HTML template + create canvas
  → register input events (Enter / Ctrl / Click)
  → loop: while scenarioManager.hasNext()
      → runScenario()
          → scenarioManager.next()  // get command object
          → evaluate if-attribute (conditional skip)
          → await commandList[type](commandObject)
```

### Command System

Command handlers are methods on Core, dispatched by `commandList[type]`:

| Command | Notes |
|---------|-------|
| `text` | Character-by-character animation; mustache variable expansion |
| `say` | Dialogue = voice playback + textHandler |
| `choice` | Injects selected branch into scenario with `sub=true` |
| `show/hide` | Canvas image compositing; modes: bg, chara, cg, cutin, effect |
| `jump` | Index-based jump within same scene; cleans up sub-branches on backward jump |
| `route` | Scene transition — stops BGM, clears display, loads new scene file |
| `if` | Evaluates JS expression; injects matching branch into scenario |
| `call` | Executes arbitrary JS with sceneFile exports in scope |
| `sound` | BGM/SE/voice; modes: play, stop, pause |
| `wait` | Timed pause; respects auto-advance mode |
| `moveto` | Animated image position change |
| `newpage` | Clears text + resets displayedImages to background only |

### Sub-Scenario System (Critical for Choice/Jump)

When a choice is selected, `choiceHandler` inserts the chosen branch into the scenario array at the current index, with every inserted item marked `sub: true`. This is a temporary injection — not part of the original scenario.

`jumpHandler` must clean up these sub-items on backward jumps:
1. Keep `before` slice (pre-jump-destination)
2. Filter `slice(jumpDest, currentIndex)` to remove `sub=true` items
3. Filter `slice(currentIndex)` (future) to remove `sub=true` items
4. Reconstruct and re-set the scenario via `scenarioManager.setScenario()`

Without this cleanup, re-entering a choice repeatedly stacks orphaned sub-branches. `jump` only works within the same scene; use `route` for scene transitions.

### Scene File Format

`.scene` files are HTML-like markup parsed by the CLI into JavaScript. The parser extracts `<scenario>` content into a command array and the `<script>` block into JS exports.

```html
<scene>
  <scenario>
    <show mode="bg" src="./bg.png"/>
    <say name="Alice">Hello!</say>
    <choice>
      <item label="Option A"><jump index="10"/></item>
      <item label="Option B"><jump index="20"/></item>
    </choice>
  </scenario>

  <script type="text/typescript">
    export const sceneConfig = {
      name: 'scene-name',
      background: './path/to/bg.png',
      bgm: './path/to/music.mp3',
      template: './path/to/ui.html'
    }
    export let counter = 0;  // accessible via {{counter}} in scenario
  </script>
</scene>
```

Variables exported from `<script>` are available via mustache syntax (`{{variable}}`) and are in scope for `<call>` and `<if>` expressions. Evaluation uses `new Function(...keys, code)` with sceneFile exports as context.

All commands support conditional execution with an `if` attribute — the command is skipped if the expression evaluates to false.

### Configuration

- `engineConfig.json` - Main engine configuration (title, resolution, etc.)
- `example/src/resource/config.js` - Resource definitions for games
- Template HTML files define UI layouts (referenced via `sceneConfig.template`)

## Testing

- Uses Jest with `ts-jest`; test files use `.test.ts` extension
- E2E tests in `tests/e2e/` using Playwright
- Coverage reports in `coverage/`

## Build Process

1. Compiles TypeScript files to JavaScript
2. Copies `package.json`, `README.md`, `engineConfig.json`, `parser/`
3. Outputs to `dist/`; `src/core/index.js` is the main entry point
