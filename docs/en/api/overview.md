# API Overview

webTaleKit provides a comprehensive set of features for creating visual novel games.

## Core Features

### Text Display

Display narration and character dialogue with customizable speed and effects.

- [text tag](/en/tags/text) - Narration text
- [say tag](/en/tags/say) - Character dialogue
- Variable interpolation with `{{variableName}}` syntax
- Text animation speed control
- Click-to-continue or auto-advance

See [Text Display API](/en/api/text) for details.

### Image Display

Show and manipulate character sprites, backgrounds, and other images.

- [show tag](/en/tags/show) - Display images with transitions
- [hide tag](/en/tags/hide) - Remove images with transitions
- [moveTo tag](/en/tags/moveto) - Animate image movement
- Position, scale, and rotation control
- Layer management (z-index)

See [Image Display API](/en/api/image) for details.

### Audio

Play background music and sound effects.

- [sound tag](/en/tags/sound) - Audio playback control
- BGM looping
- Volume control
- Crossfade between tracks

See [Audio API](/en/api/sound) for details.

### Choices

Create interactive branching narratives.

- [choice tag](/en/tags/choice) - Display choice menus
- Conditional choices (show/hide based on variables)
- Nested scenarios within choices
- Variable tracking for player decisions

See [Choices API](/en/api/choice) for details.

### Control Flow

Control the flow of your narrative.

- [jump tag](/en/tags/jump) - Jump to specific points in a scene
- [if tag](/en/tags/if) - Conditional execution
- [route tag](/en/tags/route) - Navigate between scenes
- [call tag](/en/tags/call) - Execute JavaScript functions

See [Control Flow API](/en/api/control) for details.

## Advanced Features

### Variable System

Use variables to create dynamic content:

```html
<scenario>
  <text>Hello, {{playerName}}!</text>
  <text>You have {{score}} points.</text>
</scenario>

<script>
let playerName = "Player";
let score = 100;
</script>
```

### HTTP Integration

Call REST APIs to integrate external data:

```html
<text get="https://api.example.com/data">
  <progress>Loading...</progress>
  <then>{{res.message}}</then>
  <error>Failed to load data.</error>
</text>
```

### Save & Load System

Persist game progress:

- [save tag](/en/tags/save) - Save current progress
- [load tag](/en/tags/load) - Load saved progress
- Multiple save slots
- Auto-save functionality

### Dialog System

Display modal dialogs for confirmations and messages:

- [dialog tag](/en/tags/dialog) - Modal dialog display
- Custom actions and buttons
- Integration with save/load system

## Next Steps

- [Tag Reference](/en/tags/) - Complete tag documentation
- [Scene Files](/en/guide/scene-files) - Learn scenario syntax
- [Examples](https://github.com/EndoHizumi/webTaleKit/tree/main/example) - View example projects
