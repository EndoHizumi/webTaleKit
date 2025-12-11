# Quick Start

This guide will help you get started with webTaleKit quickly.

## Installation

Install webTaleKit via npm:

```bash
npm install webtalekit-alpha
```

## Project Structure

A basic webTaleKit project has the following structure:

```
your-project/
├── src/
│   ├── scene/           # Scene files (.scene)
│   ├── resource/        # Game resources
│   │   ├── background/  # Background images
│   │   ├── chara/       # Character sprites
│   │   ├── bgm/         # Background music
│   │   └── se/          # Sound effects
│   └── screen/          # UI templates (HTML)
├── engineConfig.json    # Engine configuration
└── index.html          # Entry point
```

## Creating Your First Scene

Create a file `src/scene/first.scene`:

```html
<scenario>
  <text>Welcome to webTaleKit!</text>
  <text>This is your first visual novel scene.</text>

  <choice prompt="What would you like to do?">
    <item label="Continue the story">
      <text>Great! Let's continue...</text>
    </item>
    <item label="Learn more">
      <text>webTaleKit makes it easy to create visual novels!</text>
    </item>
  </choice>
</scenario>

<script>
// You can define variables and functions here
let playerName = "Player";
</script>
```

## Compiling Scene Files

Use the WebTaleScript CLI to compile your scene files:

```bash
npx wtc src/scene/first.scene src/scene/
```

This generates a JavaScript file that can be loaded by the engine.

## Configuring the Engine

Edit `engineConfig.json`:

```json
{
  "title": "My First Visual Novel",
  "width": 1280,
  "height": 720,
  "initialScene": "first"
}
```

## Running Your Game

Start a development server:

```bash
npm run dev
```

Open your browser to the specified URL to see your game in action!

## Next Steps

- [Learn about scene files](/en/guide/scene-files) - Deep dive into scenario writing
- [Customize your UI](/en/guide/ui-creation) - Create custom interfaces
- [Explore the tag reference](/en/tags/) - See all available tags

## Example Project

Check out the `example` folder in the webTaleKit repository for a complete working example.
