# text Tag

Display narration text.

## Syntax

```html
<text speed="0.5" wait="true" clear="true">Text to display</text>
```

Or, you can omit the tag and write text directly:

```html
Text to display
```

## Attributes

### Basic Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| speed | number | × | 25 | Text display speed (milliseconds) |
| wait | boolean | × | true | Wait for click after display |
| clear | boolean | × | true | Clear previous message |
| name | string | × | - | Speaker name (displayed in name box) |
| time | number | × | - | Auto-wait time after display (milliseconds) |
| if | string | × | - | Conditional expression |

### HTTP Attributes (Available on any tag)

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| get | string | × | GET request URL |
| post | string | × | POST request URL |
| put | string | × | PUT request URL |
| delete | string | × | DELETE request URL |

**Note**: Specify only one of `get`, `post`, `put`, or `delete`.

## Basic Usage

### Simple Text Display

```html
<text>The warmth of early September lingered...</text>
```

You can also omit the tag:

```html
The warmth of early September lingered...
```

### Multi-line Text

```html
<text>
  The warmth of early September lingered.
  That's when she said it.
</text>
```

## Display Speed

### Fast Display

```html
<text speed="0.1">Text displayed quickly</text>
```

### Slow Display

```html
<text speed="1.0">Text displayed slowly</text>
```

### Instant Display

```html
<text speed="0">Text displayed instantly</text>
```

## Click Wait

### With Click Wait (Default)

```html
<text wait="true">
  Wait for click after this text.
</text>
```

### Without Click Wait

Automatically proceed to the next text or action:

```html
<text wait="false">Proceed without waiting for click</text>
<text>Next text</text>
```

## Message Clearing

### Clear Previous Message (Default)

```html
<text clear="true">Previous message will be cleared</text>
```

### Keep Previous Message

```html
<text>First text</text>
<text clear="false">Added to previous text</text>
```

Result:
```
First text
Added to previous text
```

## Line Breaks

### Break Within Text

```html
<text>
  First line<br/>
  Second line<br/>
  Third line
</text>
```

### Start New Page

Use the `<newpage>` tag to clear the message and start a new page:

```html
<text>Text on the first page</text>
<newpage />
<text>Text on the new page</text>
```

## Using Variables

Embed variables using Mustache syntax (`{{variableName}}`):

```html
<scenario>
  <text>{{playerName}} woke up.</text>
  <text>Money: {{money}} yen</text>
</scenario>

<script>
const playerName = "Taro";
let money = 1000;
</script>
```

## Conditional Display

Use the `if` attribute to display conditionally:

```html
<text if="hasKey">You have the key.</text>
<text if="!hasKey">You don't have the key.</text>
```

## HTTP Requests

Add `get`/`post`/`put`/`delete` attributes to the `text` tag to call REST APIs and display responses.

### Basic Usage

```html
<text get="https://api.example.com/data">
  <progress>Loading data...</progress>
  <header>
    <Content-Type>application/json</Content-Type>
    <Authorization>Bearer token</Authorization>
  </header>
  <data>
    <query>example</query>
  </data>
  <then>Data loaded successfully.</then>
  <error>Failed to load data.</error>
</text>
```

### Child Elements

| Element | Description |
|---------|-------------|
| header | HTTP headers (specify header name and value as child elements) |
| data | Request body (specify key and value as child elements) |
| progress | Text displayed during the request |
| then | Content added on request success |
| error | Content added on request failure |

### Using Response Data

On successful HTTP requests, the JSON response is stored in the `res` variable:

```html
<text get="https://api.example.com/user">
  <progress>Fetching user info...</progress>
  <then>
    Welcome, {{res.name}}!
    Your score is {{res.score}} points.
  </then>
  <error>Failed to fetch user information.</error>
</text>
```

### POST Request Example

```html
<text post="https://api.example.com/login">
  <header>
    <Content-Type>application/json</Content-Type>
  </header>
  <data>
    <username>{{username}}</username>
    <password>{{password}}</password>
  </data>
  <progress>Logging in...</progress>
  <then>Login successful!</then>
  <error>Login failed.</error>
</text>
```

::: warning Note
HTTP functionality is a global feature available on all tags. Internally, `httpHandler` processes it before each tag execution.
:::

## Related Tags

- [say](/en/tags/say) - Character dialogue
- [choice](/en/tags/choice) - Display choices

## Notes

- `speed` is specified in seconds (0.5 = 0.5 second interval)
- When `wait` is `false`, it immediately proceeds to the next action
- Click wait occurs at each line break (when `wait="true"`)
- Some HTML tags can be used, but `<br/>` is primarily recommended
