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

### CLI Tool
- `wtc` - WebTaleScript parser CLI (available via `parser/cli.js`)
- Usage: `wtc <scene-file> [output-directory]` to convert .scene files to .js/.ts files

## Architecture

### Core Components

#### Core Engine (`src/core/`)
- **Core** (`src/core/index.js`): Main game engine class that orchestrates all game systems
- **ScenarioManager** (`src/core/scenarioManager.ts`): Manages game scenarios, progress, and history
- **Drawer** (`src/core/drawer.ts`): Handles canvas rendering and visual effects
- **ResourceManager** (`src/core/resourceManager.ts`): Manages game resources and assets

#### Resource Management (`src/resource/`)
- **ImageObject** (`src/resource/ImageObject.ts`): Handles image loading, filtering, and manipulation
- **SoundObject** (`src/resource/soundObject.ts`): Manages audio playback and sound effects

#### Utilities (`src/utils/`)
- **Logger** (`src/utils/logger.ts`): Logging system for debugging
- **Store** (`src/utils/store.ts`): Data persistence utilities
- **WaitUtil** (`src/utils/waitUtil.ts`): Async waiting utilities

### Command System

The engine uses a command-based architecture where scenarios are executed through command handlers:

- `text` - Display text content
- `choice` - Present interactive choices
- `show/hide` - Display/remove images and characters
- `sound` - Play audio (BGM/SE)
- `say` - Character dialogue with optional voice
- `jump` - Navigate to different scenario points
- `if` - Conditional logic
- `call` - Execute JavaScript code
- `moveto` - Animate character movement
- `route` - Scene transitions

### Configuration

- `engineConfig.json` - Main engine configuration (title, resolution, etc.)
- `example/src/resource/config.js` - Resource definitions for games
- Template HTML files define UI layouts

### Scene File Format

Scene files use a custom markup language (`.scene` extension) that gets parsed into JavaScript by the CLI tool. The parser converts markup into scenario objects that the engine can execute.

### Resource Structure

Game resources are organized in the `example/src/resource/` folder:
- `background/` - Background images
- `chara/` - Character sprites
- `bgm/` - Background music
- `se/` - Sound effects
- `system/` - UI elements and system graphics

## Testing

- Uses Jest with TypeScript support
- Test files use `.test.ts` extension
- E2E tests available in `tests/e2e/` using Playwright
- Coverage reports generated in `coverage/` directory

## Build Process

The build process:
1. Compiles TypeScript files to JavaScript
2. Copies necessary files (package.json, README.md, engineConfig.json, parser/)
3. Outputs to `dist/` directory
4. Preserves `src/core/index.js` as the main entry point

## Development Notes

- The engine supports both JavaScript and TypeScript scene files
- Resources are loaded dynamically with existence checking
- The engine includes error handling for missing resources
- Supports REST API calls for AI integration
- Includes variable expansion using mustache syntax (`{{variable}}`)
- All commands support conditional execution with `if` attributes