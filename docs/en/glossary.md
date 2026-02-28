# Glossary

A reference of terms and concepts used in webTaleKit.

## System Architecture

### Core
**Core Class**

The central class of the webTaleKit engine. It orchestrates game-wide control, scenario execution, and handler management. All tag processing is ultimately executed through Core class methods.

### Drawer
**Drawer Class**

The class responsible for all Canvas rendering. It manages visual presentation including character and background image display, text rendering, fade effects, and image movement.

### ScenarioManager
**ScenarioManager Class**

The class responsible for scenario progress, history management, and index control. It handles branching via the `jump` tag and records player choices.

### ResourceManager
**ResourceManager Class**

The class responsible for loading, caching, and managing image, audio, and other asset files used in the game. It reads resource definitions from `config.js` and makes assets accessible by name.

### Canvas Layer
**Canvas Layer**

The webTaleKit display is composed of three layers: a UI layer (HTML/CSS), a character layer (Canvas), and a background layer (Canvas). Because the character and background layers are composited together, the effective structure is two layers.

## Scripting & Language

### WebTaleScript (WTS)
**WebTaleScript**

webTaleKit's own markup language. It uses HTML-like syntax to describe game progression. Each tag maps to an engine method and is ultimately compiled to JavaScript for execution.

```html
<scenario>
  <say name="Character">Hello!</say>
  <choice prompt="What will you do?">
    <item label="Continue"><jump index="5" /></item>
    <item label="Stay"><text>You decide to stay.</text></item>
  </choice>
</scenario>
```

### Scene File
**Scene File (.scene)**

A file that describes game progression using WebTaleScript (WTS) and JavaScript. The `scenario` section contains WTS for flow control; the `script` section contains JavaScript for variable definitions and functions.

```html
<scene>
  <scenario>
    <!-- Game flow written in WTS -->
    <text>The story begins here.</text>
  </scenario>

  <script>
    export const sceneConfig = {
      name: 'scene1',
      background: './src/resource/background/room.jpg'
    }
  </script>
</scene>
```

### Scenario Object
**Scenario Object**

A JSON object produced by compiling WebTaleScript. The webTaleKit engine reads and executes these objects to advance the game. Each element has a `type` and a `content` property.

```javascript
{
  type: 'say',
  name: 'Character',
  msg: 'Dialogue content'
}
```

### if Global Attribute
**if Global Attribute**

A global attribute available on every WebTaleScript tag. It accepts a JavaScript expression; the tag is executed only when the expression evaluates to `true`. Used for dynamic game-flow control.

```html
<text if="hasKey">You have the key.</text>
<text if="!hasKey">You don't have the key.</text>
```

### sceneConfig
**Scene Configuration**

A JavaScript object that defines the settings for each scene—scene name, background image, BGM, template file, and more. Export it from the `script` section of a scene file.

```javascript
export const sceneConfig = {
  name: 'prologue',
  background: './src/resource/background/school.jpg',
  bgm: './src/resource/bgm/theme.mp3',
  template: './src/screen/default.html'
}
```

## Resource Management

### Resource Configuration Object
**Resource Configuration Object**

An object that maps names to file paths for images and audio used in the game. Define it in `config.js` so that resources can be referenced by name.

```javascript
// src/resource/config.js
export const chara = [
  { name: 'hero', path: '/chara/protagonist.png' }
]
export const bgm = [
  { name: 'title', path: '/bgm/title_theme.mp3' }
]
```

### ImageObject
**Image Object**

A class that manages image resources. It provides image loading, filter effects (sepia, grayscale, blur), opacity control, and horizontal flipping.

### SoundObject
**Sound Object**

A class that manages audio resources. It provides playback, stop, pause, and volume control for BGM, sound effects, and voice. Implemented using the Web Audio API.

### displayedImages
**Displayed Images Object**

An object that tracks images currently visible on screen. It stores each image's coordinates, size, visibility state, and filter settings, and is used to identify the target of `hide` and `moveto` operations.

## UI & Display

### Template
**Template**

An HTML file that defines the layout of the game screen. It contains UI elements such as the message window, character name display, and choice buttons. Different templates can be used per scene.

### UI Layer
**UI Layer**

The user-interface layer composed of HTML, CSS, and JavaScript. It displays message boxes, choice buttons, system menus, and other overlay elements on top of the Canvas.

### Message Window
**Message Window**

The UI element that displays in-game text and character dialogue. It is typically positioned at the bottom of the screen with a semi-transparent background, and advances to the next text on click or key press.

### Backlog
**Backlog**

A feature that records the text and choices the player has read or made. Managed as a sequential array, it is used for reviewing game history and as part of save data.

## Audio

### BGM
**Background Music**

Music that plays continuously during the game. It normally loops and changes automatically during scene transitions. Controlled with `sound` tag's `mode="bgm"` attribute or specified in `sceneConfig`.

### Voice
**Voice**

An audio file synchronized to a character's dialogue. Specified with the `voice` attribute of the `say` tag, it plays at the same time the text appears, enriching character expression.

### Sound Effect (SE)
**Sound Effect**

Short audio files used for in-game events such as door sounds, footsteps, or ambient effects. They enhance immersion and are typically played once.

## Development & Build

### Build System
**Build System**

The system that compiles and optimizes a webTaleKit project for production. It converts scene files to JavaScript, inlines HTML/CSS/JS under `screen/`, and bundles the result.

### Directory Structure
**Directory Structure**

The standard folder layout for a webTaleKit project. It is organized into `src/scene` (scenarios), `src/screen` (templates), and `src/resource` (assets).

```
your-game/
├── src/
│   ├── scene/       # Scenario files (.scene)
│   ├── screen/      # UI templates (HTML/CSS/JS)
│   └── resource/    # Game assets
│       ├── background/
│       ├── chara/
│       ├── bgm/
│       ├── se/
│       ├── voice/
│       └── config.js
└── webpack.config.js
```

### Save System
**Save System**

A feature that saves and loads game progress as JSON files. Saved data includes the current scene, progress index, displayed images, and developer-defined variables.
