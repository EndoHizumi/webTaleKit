# call Tag

Execute JavaScript code.

## Basic Usage

```html
<call method="variableName = value" />
```

## Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| method | string | ○ | JavaScript code to execute |
| if | string | × | Conditional expression |

## Usage Examples

### Setting Variables

```html
<call method="playerName = 'Taro'" />
<call method="score = 100" />
<call method="hasKey = true" />
```

### Calling Functions

```html
<call method="startBattle()" />
<call method="addItem('potion')" />
<call method="playSound('sfx/door.mp3')" />
```

### Conditional Execution

```html
<call method="score += 10" if="isCorrectAnswer" />
<call method="unlockDoor()" if="hasKey" />
```

## Practical Examples

### Setting Variables in Choices

```html
<choice prompt="Choose your favorite color">
  <item label="Red">
    <call method="setFavoriteColor('red')" />
    <text>You chose red.</text>
  </item>
  <item label="Blue">
    <call method="setFavoriteColor('blue')" />
    <text>You chose blue.</text>
  </item>
  <item label="Green">
    <call method="setFavoriteColor('green')" />
    <text>You chose green.</text>
  </item>
</choice>
```

### Flag Management

```html
<scenario>
  <text>You examined the door.</text>
  <call method="hasExaminedDoor = true" />

  <text if="hasKey">You can unlock it with the key.</text>
  <text if="!hasKey">It's locked.</text>
</scenario>
```

### Score Calculation

```html
<scenario>
  <text>Correct!</text>
  <call method="score += 10" />
  <call method="correctAnswers += 1" />

  <text>Current score: {{score}} points</text>
  <text>Correct answers: {{correctAnswers}}</text>
</scenario>
```

### Complex Processing

```html
<scenario>
  <call method="calculateResult()" />
  <text>Result: {{result}}</text>
</scenario>

<script>
function calculateResult() {
  result = score * difficulty + bonusPoints;
}

let score = 0;
let difficulty = 1.5;
let bonusPoints = 100;
let result = 0;
</script>
```

## JavaScript Execution Environment

Code executed by the `call` tag runs in the same scope as the `<script>` section of the scene file.

### Available Features

- Access to variables and functions defined in the scene file
- Access to global objects
- Standard JavaScript features

### Notes

- Complex processing should be defined as functions in the `<script>` section and called via the `call` tag
- Asynchronous processing (async/await) is not directly supported

## Common Use Cases

### Toggle Flags

```html
<call method="isNight = !isNight" />
```

### Add to Arrays

```html
<call method="inventory.push('sword')" />
```

### Update Objects

```html
<call method="player.hp -= 10" />
<call method="player.level += 1" />
```

## Related Tags

- [if](/en/tags/if) - Conditional branching
- [choice](/en/tags/choice) - Display choices

## Next Steps

- [Control Flow](/en/api/control) - Control flow overview
- [Scene Files](/en/guide/scene-files) - Using the script section
