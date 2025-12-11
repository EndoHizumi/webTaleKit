# Tag Reference

Complete reference for all tags available in webTaleKit.

## How to Use Tags

WebTaleScript (WTS) uses HTML-like tags to write scenarios. Each tag has specific functionality and attributes.

## Tag List

### Text & Dialogue

- [text](/en/tags/text) - Display narration text
- [say](/en/tags/say) - Display character dialogue

### Image Operations

- [show](/en/tags/show) - Show images
- [hide](/en/tags/hide) - Hide images
- [moveTo](/en/tags/moveto) - Move images

### Audio

- [sound](/en/tags/sound) - Play or stop audio

### Choices & Dialogs

- [choice](/en/tags/choice) - Display choices
- [dialog](/en/tags/dialog) - Display modal dialogs

### Control Flow

- [jump](/en/tags/jump) - Jump to a specific line in the scenario
- [if](/en/tags/if) - Conditional branching
- [route](/en/tags/route) - Navigate to another scene
- [call](/en/tags/call) - Execute JavaScript code

### Save & Load

- [save](/en/tags/save) - Save game progress
- [load](/en/tags/load) - Load saved game

## Common Attributes

All tags support these common attributes:

### if Attribute

Execute a tag only when a condition is met:

```html
<text if="hasKey">You have the key.</text>
<show path="chara/friend.png" if="hasMet" />
```

See the [if tag](/en/tags/if) for more details.

### HTTP Attributes (get/post/put/delete)

Add `get`, `post`, `put`, or `delete` attributes to any tag to call REST APIs:

```html
<text get="https://api.example.com/data">
  <progress>Loading data...</progress>
  <then>Data loaded successfully.</then>
  <error>Failed to load data.</error>
</text>
```

See the [text tag](/en/tags/text) HTTP request section for more details.

## Next Steps

- [API Reference](/en/api/overview) - Feature overview
- [Scene Files](/en/guide/scene-files) - How to write scenarios
