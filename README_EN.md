# webTaleKit

![webTaleKit Logo](s-plan1-5Light-s-1.jpg)

**English | [日本語](README.md)**

## Table of Contents

- [Overview](#overview)
- [Demo](#demo)
- [Documentation](#documentation)
- [Setup Instructions](#setup-instructions)
- [Testing Instructions](#testing-instructions)
- [Quick Start](#quick-start)
- [Development Commands](#development-commands)
- [Current Status](#current-status)
- [Roadmap](#roadmap)
- [Features](#features-available-in-alpha-01x-02x)
- [Limitations](#limitations-in-alpha-01x-02x)

## Overview

webTaleKit is a TypeScript (JavaScript) based visual novel game engine.
You can flexibly create UIs using HTML, CSS, and JavaScript, and control scenarios with markup language and JavaScript.
The automatic scaling feature allows your game to adapt to various window sizes.
Future updates will include a GUI editor using VS Code extensions and AI integration through REST API calls.

### Key Features

- 🎮 **Flexible UI Creation**: Design UIs freely with HTML, CSS, and JavaScript
- 📝 **Intuitive Scenario Writing**: Control scenarios with markup language and JavaScript
- 🔄 **Automatic Scaling**: Automatically adapts to various window sizes
- 🎨 **Rich Image Processing**: Built-in filters and animation features
- 🔊 **Audio Support**: Supports BGM, SE, and voice playback
- 🛠️ **TypeScript Support**: Supports TypeScript development
- 🤖 **AI Integration**: AI integration through REST API calls (planned)

## Demo

Use any browser you like - Firefox, Chrome, or Edge!
<https://test-game-chi.vercel.app/>
![Demo Game Screen](image.png)

## Documentation

📖 **Online Documentation**: <https://endohizumi.github.io/webTaleKit/>

## Setup Instructions

1. Git is required.
   - **Installation check:** Run `git --version` - if a version is displayed, you're good
   - For Windows, install from the official Git website (<https://git-scm.com/>)
   - For Mac, run `brew install git`
   - For Linux, run the following commands:

    ```bash
    sudo apt-get update
    sudo apt-get install git
    ```

2. Node.js (version 20 or later) is required. (You can use nvm or any preferred method)
   - **Installation check:** Run `node --version` - if v20 or higher is displayed, you're good
   - For Windows, install from the official Node.js website (<https://nodejs.org/>)
   - For Mac, run `brew install node`
   - For Linux, run the following commands:

    ```bash
    curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
    sudo apt-get install -y nodejs
    ```

3. Run the following commands:

    ```bash
    npm create tale-game your-game-title
    cd your-game-title
    npm run play
    ```

If the demo game launches, setup is complete!

## Testing Instructions

Run the following commands:

```bash
git clone https://github.com/EndoHizumi/testGame.git
cd testGame
npm install
npm run play
```

## Quick Start

This section explains how to easily customize the game without programming knowledge.

### Replace Images (Simple Customization)

**Steps:** Replace existing image files with new ones (keep the same filename)

#### Change Characters or Backgrounds

- **To change a character**
  - Replace `./src/resource/chara/guide.png` with a new character image (keep the filename as `guide.png`)
- **To change background**
  - Replace `./src/resource/background/title_bg.png` with a new background image (keep the filename as `title_bg.png`)
- **To change BGM**
  - Replace `./src/resource/bgm/title_theme.mp3` with a new music file (keep the filename as `title_theme.mp3`)

#### Change Button Appearance

- **To change choice button images**
  - `./src/resource/system/systemPicture/02_button/button.png` (normal state) - overwrite keeping filename as `button.png`
  - `./src/resource/system/systemPicture/02_button/button2.png` (hover state) - overwrite keeping filename as `button2.png`
  - `./src/resource/system/systemPicture/02_button/button3.png` (clicked state) - overwrite keeping filename as `button3.png`

**About Path Notation:**

- `./` means "from the current project folder"
- Path separators use `/` (forward slash)
- **For Windows users:** `\` (backslash) will also work, but the `/` format above is recommended

### Edit Scenario Files (Change Text)

Open scenario files (`.scene` files) in a text editor and modify the content as follows:

#### Add Basic Elements

- **Add a character**
  1. Save a new character image in the `./src/resource/character` folder
  2. Add `<show src="character-image-filename"></show>` in the scenario file
- **Add dialogue**
  - Add `<say name="Character Name">Enter dialogue here</say>`
- **Add narration**
  - Add `<text>Enter narration text here</text>`

**For beginners:** We recommend starting by modifying existing text.

#### Add or Modify Choices

Choices are important elements that let players control game progression. You can modify them by editing the `<choice>` tags in scenario files.

**Basic choice syntax:**

```html
<item label='Choice text'>
    <text>Text displayed after selection</text>
</item>
```

**Practical example:**

```html
<choice prompt="Start the game?">
  <item label="Yes">
      <jump index="5" />
  </item>
  <item label="No">
      <jump index="16" />
  </item>
  <item label='Wait a minute'>
    <text>Understood.</text>
     <jump index="1" />
  </item>
</choice>
```

## Development Commands

### Build and Development

- `npm run build` - Compile TypeScript to JavaScript and prepare distribution files
- `npm run dev` - Build the project and start development server in example folder
- `npm run lint` - Run ESLint for code quality checking
- `npm run test` - Run Jest tests

### CLI Tool

- `wtc` - WebTaleScript parser CLI (available via `parser/cli.js`)
- Usage: `wtc <scene-file> [output-directory]` to convert `.scene` files to `.js/.ts` files

### Documentation

- `npm run docs:dev` - Start VitePress documentation server
- `npm run docs:build` - Build documentation
- `npm run docs:preview` - Preview built documentation

## Current Status

webTaleKit is currently in alpha.

Development progress is shared on [@endo_hizumi](https://x.com/endo_hizumi).
Planned features can also be checked on this [Trello board](https://trello.com/b/qYNGh7MY).

We welcome feedback about the demo and your experience with webTaleKit!
[https://forms.gle/uejQwvwAb99wcJht7](https://forms.gle/uejQwvwAb99wcJht7)

Search Hashtag: #webTalekit

## Roadmap

| Version | Code Name (JP) | Code Name | Description
| :--- | :--- | :--- | :---
| 0.1.0 | 初音 | HATUNE | Initial release
| 0.2.0 | 礎 | ISHIZUE | Basic feature updates: Dialog display tag, engineConfig bug fixes, undefined tag handling fixes, string wrapping fixes, broken link fixes, message window overflow fixes, if attribute implementation, for attribute implementation, read status management
| 0.3.0 | 舞踊 | BUYO | Transition and animation updates: Text speed adjustment tags, text font size changes, web font support, video playback support, child element filters and animations
| 0.4.0 | 狭間 | HAZAMA | UI framework integration: Support for Vue.js, React, Svelte, etc.
| 0.5.0 | 操手 | AYATURI | Gamepad support, key configuration, VOICEBOX API support, npm run rec
| 0.6.0 | 絡繰 | KARAKURI | wtsLinter, VS Code integration, wst2html, plugin system, cross-platform builds
| 0.7.0 | 綴り | TUDURI | GUI editor
| 0.8.0 | 迅雷 | JINRAI | Performance updates
| 0.9.0 | 出島 | DEJIMA | KAG tag converter
| 1.0.0 | 暁月 | AKATUKI | Major release

## Features Available in Alpha (0.1.x-0.2.x)

### Text Display

- Display narration text
- Display character dialogue with voice playback
- Display defined variables

### Character & Image Operations

- Display, position, and animate character images
- Display, position, and animate other images
- Display and animate multiple characters
- Display and change CGs
- Display and change background images

### Image Processing

- Image filters
  - Grayscale
  - Sepia
  - Opacity changes
  - Size changes

### User Interaction

- Display choices
- Customize choice button images
  - Normal state
  - Mouse hover
  - Selected state
- Force skip with Ctrl key
- Show full text with Enter key

### Scenario Control

- Conditional branching for text and images
- Jump to different dialogue
- Switch scenarios (scenes)

### Audio

- Play and stop BGM
- Play and stop SE

### Save & Load

- Save functionality
- Load functionality

### System Settings & UI

- Display HTML-based screens
- Change resolution settings

### Programming Integration

- JavaScript integration
  - Method calls
  - Expression execution
  - Variable definition and modification
- Change background images from JavaScript
- TypeScript integration
- REST API calls (display responses)

## Limitations in Alpha (0.1.x-0.2.x)

### Build & Platform

- Desktop application builds
- Android/iOS builds

### User Interface

- Various screen buttons
- Save file list retrieval

### Character Operations

- Say tag features:
  - Auto-display character if not shown

### Visual Effects

- Show/hide tag features:
  - Child element filter specification
  - Child element animation specification
  - Resource type specification with slash delimiter
- Quake tag (screen shake)
- Mask tag (screen fade to black)

### Audio

- Sound tag features:
  - pause
  - setVolume
  - getVolume
  - bgm alias
  - voice alias
  - se alias

### Resource Management

- Dynamic resource definition in JavaScript

### Settings & Optimization

- Game configuration file reflection
- HTML CSS/JS inlining and minification

## License

MIT License

## Credits

### Icon Resources

- <https://www.silhouette-illust.com/>

### Color Codes

- Blue: #3178C6 (TypeScript Blue)
- Green: #02a889 (WebTaleKit Green)
- White: #f8f8f8 (White Smoke)
