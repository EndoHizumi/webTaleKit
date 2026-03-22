# Examples

Practical code samples for building games with webTaleKit.

## Basic Dialogue Scene

A simple scene displaying character dialogue.

```html
<scene>
  <scenario>
    <say name="Alice">"We need to talk."</say>
    <say name="Bob">"What do you mean?"</say>
    <say name="Alice">"I think it's time for us to part ways."</say>
    <say name="Bob">"...Why?"</say>
  </scenario>

  <script>
    export const sceneConfig = {
      name: 'prologue',
      background: './src/resource/background/school_rooftop.jpg',
      bgm: './src/resource/bgm/melancholy.mp3',
      template: './src/screen/default.html'
    }
  </script>
</scene>
```

## Choices and Branching

Presenting choices to the player and branching the story.

```html
<scene>
  <scenario>
    <say name="Alice">"I think it's time for us to part ways."</say>

    <choice prompt="How will you respond?">
      <item label="Ask why">
        <say name="Bob">"Why? What happened?"</say>
        <say name="Alice">"I can't say."</say>
      </item>
      <item label="Accept">
        <say name="Bob">"...Okay."</say>
        <jump index="10" />
      </item>
      <item label="Refuse">
        <say name="Bob">"No. Not until you give me a reason."</say>
      </item>
    </choice>

    <say name="Alice">"..."</say>
  </scenario>

  <script>
    export const sceneConfig = {
      name: 'choice_scene',
      background: './src/resource/background/school_rooftop.jpg',
      template: './src/screen/default.html'
    }
  </script>
</scene>
```

## Character Display and Animation

Displaying characters on screen and animating them.

```html
<scene>
  <scenario>
    <say name="Narrator">After school. Two students face each other.</say>

    <!-- Place characters on left and right -->
    <show src="./src/resource/chara/hero.png" name="hero" pos="left:middle" />
    <show src="./src/resource/chara/heroine.png" name="heroine" pos="right:middle" transition="fade" />

    <say name="Hero">"Hey, want to walk home together again?"</say>
    <say name="Heroine">"Sure! I was waiting for you."</say>

    <!-- Move character to center -->
    <moveTo name="hero" x="400" y="300" duration="1" />
    <say name="Hero">"There's something I need to tell you."</say>

    <!-- Hide a character -->
    <hide name="heroine" transition="fade" />
    <say name="Narrator">Her expression grew clouded.</say>
  </scenario>

  <script>
    export const sceneConfig = {
      name: 'classroom',
      background: './src/resource/background/classroom.jpg',
      template: './src/screen/default.html'
    }
  </script>
</scene>
```

## Conditional Branching (if Global Attribute)

Changing displayed content based on a variable's value.

```html
<scene>
  <scenario>
    <text>You search the room and find an old diary.</text>

    <!-- Only shown when hasReadDiary is true -->
    <text if="hasReadDiary">You've read this diary before.</text>
    <text if="!hasReadDiary">You've never seen this before. Take a look?</text>

    <choice prompt="What do you do with the diary?">
      <item label="Read it" if="!hasReadDiary">
        <text>The diary recounts a sad past.</text>
        <call func="setHasReadDiary(true)" />
      </item>
      <item label="Read it again" if="hasReadDiary">
        <text>The memories from that day come flooding back.</text>
      </item>
      <item label="Leave it">
        <text>You quietly return the diary to its place.</text>
      </item>
    </choice>
  </scenario>

  <script>
    export const sceneConfig = {
      name: 'room',
      background: './src/resource/background/old_room.jpg',
      template: './src/screen/default.html'
    }

    let hasReadDiary = false;

    export function setHasReadDiary(value) {
      hasReadDiary = value;
    }
  </script>
</scene>
```

## Playing Audio

Using BGM and sound effects in a scene.

```html
<scene>
  <scenario>
    <text>On a stormy night, a lone traveler arrives at an old inn.</text>

    <!-- Play a sound effect -->
    <sound src="./src/resource/se/door_knock.mp3" mode="se" />
    <say name="Innkeeper">"Welcome. Looks like it'll be a rough night."</say>

    <!-- Switch BGM -->
    <sound src="./src/resource/bgm/calm_inn.mp3" mode="bgm" />
    <say name="Traveler">"Could I stay here for the night?"</say>
    <say name="Innkeeper">"Of course. Right this way."</say>

    <!-- Play another sound effect (BGM continues) -->
    <sound src="./src/resource/se/footsteps.mp3" mode="se" />
    <text>The two walked down the hallway.</text>
  </scenario>

  <script>
    export const sceneConfig = {
      name: 'inn',
      background: './src/resource/background/inn_entrance.jpg',
      bgm: './src/resource/bgm/storm.mp3',
      template: './src/screen/default.html'
    }
  </script>
</scene>
```

## Voiced Dialogue

Adding voice audio to character dialogue.

```html
<scene>
  <scenario>
    <say name="Heroine" voice="./src/resource/voice/heroine_01.mp3">
      "Good morning! Ready to head to school?"
    </say>

    <say name="Heroine" voice="./src/resource/voice/heroine_02.mp3">
      "I'm so happy we get to walk together every day."
    </say>

    <say name="Protagonist">"Morning. You're cheerful as always."</say>

    <say name="Heroine" voice="./src/resource/voice/heroine_03.mp3">
      "Time with you is... special to me."
    </say>
  </scenario>

  <script>
    export const sceneConfig = {
      name: 'morning',
      background: './src/resource/background/school_gate.jpg',
      bgm: './src/resource/bgm/morning_theme.mp3',
      template: './src/screen/default.html'
    }
  </script>
</scene>
```

## Scene Transitions

Navigating to a different scene.

```html
<scene>
  <scenario>
    <text>Chapter 1: An Encounter</text>
    <say name="Narrator">This story begins on a spring day.</say>

    <choice prompt="Continue the story?">
      <item label="Yes, continue">
        <!-- Transition to the next scene -->
        <route to="chapter1_scene1" />
      </item>
      <item label="Return to title">
        <route to="title" />
      </item>
    </choice>
  </scenario>

  <script>
    export const sceneConfig = {
      name: 'prologue',
      background: './src/resource/background/spring.jpg',
      template: './src/screen/default.html'
    }
  </script>
</scene>
```

## Save and Load

Saving and loading game progress.

```html
<scene>
  <scenario>
    <say name="Narrator">You've reached a critical moment.</say>

    <choice prompt="What will you do?">
      <item label="Save and continue">
        <save slot="1" />
        <say name="Narrator">Game saved.</say>
      </item>
      <item label="Load save">
        <load slot="1" />
      </item>
      <item label="Continue without saving">
        <say name="Narrator">The story continues.</say>
      </item>
    </choice>

    <text>The moment of decision has arrived.</text>
  </scenario>

  <script>
    export const sceneConfig = {
      name: 'checkpoint',
      background: './src/resource/background/crossroads.jpg',
      template: './src/screen/default.html'
    }
  </script>
</scene>
```

## Dynamic Text with Variables

Embedding variables in text using Mustache syntax.

```html
<scene>
  <scenario>
    <text>{{playerName}} has arrived at {{location}}.</text>
    <text>Gold: {{money}} G</text>
    <text if="money >= 1000">You have enough to pay for the inn.</text>
    <text if="money < 1000">You're worried you can't afford the inn.</text>

    <choice prompt="What will you do?">
      <item label="Stay at the inn" if="money >= 500">
        <call func="spendMoney(500)" />
        <text>{{playerName}} decided to stay at the inn.</text>
        <text>Remaining gold: {{money}} G</text>
      </item>
      <item label="Camp outside">
        <text>{{playerName}} decided to camp for the night.</text>
      </item>
    </choice>
  </scenario>

  <script>
    export const sceneConfig = {
      name: 'town',
      background: './src/resource/background/town.jpg',
      template: './src/screen/default.html'
    }

    const playerName = 'Hero';
    const location = 'Traveling Town';
    let money = 800;

    export function spendMoney(amount) {
      money -= amount;
    }
  </script>
</scene>
```

## Related Links

- [Tag Reference](/tags/) - Detailed specifications for each tag
- [Guide](/guide/getting-started) - New to webTaleKit? Start here
- [API Reference](/api/overview) - API details
