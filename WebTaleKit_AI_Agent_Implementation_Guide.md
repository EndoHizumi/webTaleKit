# WebTaleKit Sample Game Implementation Specification
# "初音の調べ (HATUNE no Shirabe)" - AI Agent Implementation Guide

**Document Version:** 1.0  
**Target Engine:** WebTaleKit v0.1.0 HATUNE or later  
**Estimated Development Time:** 40-60 hours  
**Play Time:** 10-15 minutes

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technical Architecture](#2-technical-architecture)
3. [Scene Structure Definition](#3-scene-structure-definition)
4. [WebTaleScript Implementation](#4-webtaleScript-implementation)
5. [TypeScript Extension Specifications](#5-typescript-extension-specifications)
6. [Resource Specifications](#6-resource-specifications)
7. [UI/DOM Requirements](#7-uidom-requirements)
8. [Testing Checklist](#8-testing-checklist)
9. [Implementation Workflow](#9-implementation-workflow)

---

## 1. Project Overview

### 1.1 Purpose

This sample game serves three primary objectives:

1. **Feature Demonstration**: Showcase all major WebTaleKit v0.1.0 features
2. **Developer Education**: Provide practical examples of WebTaleScript and TypeScript extensions
3. **Promotional Content**: Create engaging demo content for WebTaleKit marketing

### 1.2 Core Concept

**Meta-narrative structure**: The protagonist is a developer creating the WebTaleKit engine itself. Through their coding journey, players naturally encounter and experience each engine feature.

**Theme**: "Creating a novel game engine through code and creativity"

### 1.3 Technical Requirements

```json
{
  "engine": {
    "name": "WebTaleKit",
    "version": ">=0.1.0",
    "codenamed": "HATUNE"
  },
  "runtime": {
    "browser": ["Chrome 90+", "Firefox 88+", "Safari 14+", "Edge 90+"],
    "resolution": "1920x1080 (responsive)",
    "performance": "60fps target"
  },
  "dependencies": {
    "typescript": "^5.0.0",
    "webtalekit-core": "^0.1.0"
  }
}
```

---

## 2. Technical Architecture

### 2.1 File Structure

```
hatune-no-shirabe/
├── index.html                 # Entry point with DOM structure
├── styles/
│   ├── main.css              # Base styles
│   ├── theme-vscode.css      # VSCode-inspired dark theme
│   └── animations.css        # Animation definitions
├── scripts/
│   ├── main.ts               # Application entry point
│   ├── extensions/
│   │   ├── ParticleEffect.ts # Custom particle system
│   │   ├── CodeHighlight.ts  # Syntax highlighting effect
│   │   └── TypingEffect.ts   # Keyboard typing simulation
│   └── config.ts             # Game configuration
├── scenarios/
│   ├── prologue.wts          # WebTaleScript files
│   ├── chapter1.wts
│   ├── chapter2.wts
│   ├── chapter3.wts
│   ├── chapter4.wts
│   ├── chapter5.wts
│   └── epilogue.wts
├── assets/
│   ├── images/
│   │   ├── backgrounds/
│   │   │   ├── night_desk.jpg
│   │   │   ├── morning_desk.jpg
│   │   │   └── code_editor.jpg
│   │   └── characters/
│   │       ├── muse_normal.png
│   │       ├── muse_smile.png
│   │       ├── muse_thinking.png
│   │       └── muse_excited.png
│   ├── audio/
│   │   ├── bgm/
│   │   │   ├── coding_ambience.mp3
│   │   │   ├── creative_flow.mp3
│   │   │   └── achievement.mp3
│   │   └── se/
│   │       ├── keyboard_typing.mp3
│   │       ├── success.mp3
│   │       ├── error.mp3
│   │       └── notification.mp3
│   └── fonts/
│       └── FiraCode-Regular.woff2
└── package.json
```

### 2.2 Data Flow

```
WebTaleScript (.wts) 
    ↓ [Parser]
Scenario JSON
    ↓ [Engine Core]
Command Execution
    ↓ [Event System]
DOM Updates / Audio / State Changes
    ↓ [UI Layer]
User Interaction
```

### 2.3 State Management

```typescript
interface GameState {
  currentScene: string;
  currentLine: number;
  variables: Record<string, any>;
  flags: Record<string, boolean>;
  history: HistoryEntry[];
  saves: SaveData[];
}

interface HistoryEntry {
  scene: string;
  line: number;
  text: string;
  timestamp: number;
}
```

---

## 3. Scene Structure Definition

### 3.1 Scene Flow Diagram

```
[Title Screen]
      ↓
[Prologue: 深夜のコーディング]
      ↓
[Chapter 1: テキスト演出の実装]
      ↓
[Chapter 2: キャラクター表示]
      ↓
[Chapter 3: 選択肢とフラグ管理] ← Branch Point
      ├─→ [Route A: 選択肢優先]
      └─→ [Route B: 変数管理優先]
      ↓ (paths merge)
[Chapter 4: サウンド制御]
      ↓
[Chapter 5: 拡張機能の実装]
      ↓
[Epilogue: 完成への道] ← Multiple endings based on choices
      ├─→ [Ending A: Perfect Implementation]
      ├─→ [Ending B: Good Implementation]
      └─→ [Ending C: Learning Journey]
```

### 3.2 Scene Details

#### Prologue: 深夜のコーディング

**Demonstrated Features:**
- Basic text display with speed control
- Background image loading and transitions
- BGM playback with fade-in
- Wait/delay commands
- Ruby (furigana) text

**Story Elements:**
- Introduce protagonist (developer)
- Establish setting (late night coding session)
- Present the goal (creating WebTaleKit)

**Technical Complexity:** Low (foundation)

---

#### Chapter 1: テキスト演出の実装

**Demonstrated Features:**
- Text speed variation (`speed="slow"`, `speed="fast"`)
- Text color and emphasis (`<em>`, `<strong>`)
- Ruby annotations `<ruby>`
- Wait times between lines
- Clear text command
- Auto-advance mode

**Story Elements:**
- Protagonist implements text rendering system
- Experiments with different text speeds
- Realizes importance of readability

**Technical Complexity:** Low-Medium

**Sample Dialogue Count:** 15-20 lines

---

#### Chapter 2: キャラクター表示

**Demonstrated Features:**
- Character sprite display (`<character>`)
- Position control (left, center, right)
- Expression changes (sprite swapping)
- Fade in/out effects
- Character removal
- Multi-character scenes

**Story Elements:**
- Introduce "Muse" character (personification of inspiration)
- Dialogue between protagonist and Muse
- Discussion about character rendering techniques

**Technical Complexity:** Medium

**Sample Dialogue Count:** 20-25 lines

---

#### Chapter 3: 選択肢とフラグ管理

**Demonstrated Features:**
- Choice menu display (`<choice>`)
- Branch navigation (`goto` attribute)
- Variable assignment (`<set>`)
- Conditional display (`<if>`)
- Flag-based story branching

**Story Elements:**
- Critical decision point in development
- Choice between implementing features in different order
- Consequences affect later scenes

**Technical Complexity:** Medium-High

**Sample Dialogue Count:** 25-30 lines (per branch)

**Branch Structure:**
```
[Choice Point]
├─ Option A: "選択肢機能を先に実装"
│  └─ Sets flag: choice_first = true
│  └─ Goto: chapter3_choice_route
└─ Option B: "変数管理を先に実装"
   └─ Sets flag: variable_first = true
   └─ Goto: chapter3_variable_route

[Both routes converge at chapter 4]
```

---

#### Chapter 4: サウンド制御

**Demonstrated Features:**
- BGM switching with crossfade
- Sound effect playback (SE)
- Volume control
- Fade in/out audio
- Loop control
- Multiple audio layers

**Story Elements:**
- Implementing audio system
- Testing different background music
- Creating atmosphere through sound

**Technical Complexity:** Medium

**Sample Dialogue Count:** 15-20 lines

---

#### Chapter 5: 拡張機能の実装

**Demonstrated Features:**
- Custom TypeScript commands
- Particle effects (custom extension)
- Code highlighting effect (custom extension)
- Animation system integration
- External API simulation

**Story Elements:**
- Protagonist creates custom extensions
- Demonstrates TypeScript integration
- Showcases engine flexibility

**Technical Complexity:** High

**Sample Dialogue Count:** 20-25 lines

**Custom Commands Used:**
- `<particle type="snow" count="50" />`
- `<codeHighlight language="typescript" />`
- `<typeEffect text="console.log('Hello');" speed="100" />`

---

#### Epilogue: 完成への道

**Demonstrated Features:**
- Save/Load system demonstration
- Screen transitions
- Multiple endings based on accumulated flags
- Achievement system (optional)
- Credits roll

**Story Elements:**
- Project completion
- Reflection on the journey
- Different outcomes based on player choices

**Technical Complexity:** Medium

**Ending Conditions:**
```typescript
// Ending A: Perfect Implementation (all features implemented optimally)
if (flags.choice_first && flags.variable_first && flags.optimization_done) {
  goto("ending_a_perfect");
}
// Ending B: Good Implementation (most features done)
else if (flags.choice_first || flags.variable_first) {
  goto("ending_b_good");
}
// Ending C: Learning Journey (completed but suboptimal)
else {
  goto("ending_c_learning");
}
```

---

## 4. WebTaleScript Implementation

### 4.1 Syntax Specification

WebTaleScript uses XML-like tag syntax. All commands are case-sensitive.

#### 4.1.1 Scene Declaration

```xml
<scene id="unique_scene_id">
  <!-- Scene content -->
</scene>
```

**Attributes:**
- `id` (required): Unique identifier for the scene

---

#### 4.1.2 Background Control

```xml
<background src="path/to/image.jpg" transition="fade" duration="1000" />
```

**Attributes:**
- `src` (required): Image file path relative to assets/images/backgrounds/
- `transition` (optional): Transition effect ("fade", "slide", "none")
- `duration` (optional): Transition duration in milliseconds (default: 500)

---

#### 4.1.3 Character Display

```xml
<character 
  name="character_id" 
  src="path/to/sprite.png" 
  position="center"
  effect="fadein"
  duration="300"
/>
```

**Attributes:**
- `name` (required): Unique character identifier
- `src` (required): Sprite image path relative to assets/images/characters/
- `position` (optional): "left", "center", "right" (default: "center")
- `effect` (optional): Entry effect ("fadein", "slidein", "none")
- `duration` (optional): Effect duration in milliseconds (default: 300)

**Updating Character:**
```xml
<character name="character_id" src="new_expression.png" />
```

**Removing Character:**
```xml
<character name="character_id" remove="true" effect="fadeout" />
```

---

#### 4.1.4 Text Display

```xml
<text speaker="Speaker Name" speed="normal">
  Display text here. Supports <ruby text="ふりがな">漢字</ruby>.
  <em>Emphasized text</em> and <strong>strong emphasis</strong>.
</text>
```

**Attributes:**
- `speaker` (optional): Name displayed in name box
- `speed` (optional): "slow", "normal", "fast" (default: "normal")

**Nested Tags:**
- `<ruby text="reading">base</ruby>`: Furigana/reading annotation
- `<em>text</em>`: Italic emphasis
- `<strong>text</strong>`: Bold emphasis
- `<color value="#RGB">text</color>`: Custom text color

---

#### 4.1.5 Audio Control

**BGM:**
```xml
<bgm 
  src="filename.mp3" 
  volume="0.6" 
  fadein="2000"
  loop="true"
/>
```

**Attributes:**
- `src` (required): Audio file path relative to assets/audio/bgm/
- `volume` (optional): Volume level 0.0-1.0 (default: 1.0)
- `fadein` (optional): Fade-in duration in milliseconds (default: 0)
- `loop` (optional): "true" or "false" (default: "true")

**Sound Effects:**
```xml
<se src="filename.mp3" volume="0.8" />
```

**Stop BGM:**
```xml
<bgm stop="true" fadeout="1000" />
```

---

#### 4.1.6 Control Flow

**Wait:**
```xml
<wait time="1000" />
```

**Attributes:**
- `time` (required): Wait duration in milliseconds

**Choice Menu:**
```xml
<choice>
  <option goto="scene_id_1">Choice text 1</option>
  <option goto="scene_id_2">Choice text 2</option>
  <option goto="scene_id_3">Choice text 3</option>
</choice>
```

**Attributes:**
- `goto` (required): Target scene ID

**Jump:**
```xml
<jump target="scene_id" />
```

---

#### 4.1.7 Variable Management

**Set Variable:**
```xml
<set var="variable_name" value="variable_value" />
```

**Set Flag:**
```xml
<set flag="flag_name" value="true" />
```

**Conditional Display:**
```xml
<if condition="flag_name == true">
  <text>This text appears only if flag is true</text>
</if>

<if condition="variable_name > 5">
  <text>Variable-based conditional</text>
</if>
```

**Supported Operators:**
- `==`, `!=`, `>`, `<`, `>=`, `<=`
- `&&` (AND), `||` (OR)

---

#### 4.1.8 Custom Commands (Extensions)

```xml
<particle type="snow" count="50" duration="5000" />
<codeHighlight language="typescript" code="const x = 10;" />
<typeEffect text="console.log('Hello');" speed="100" />
```

Custom commands are implemented as TypeScript classes extending `CustomCommand`.

---

### 4.2 Complete Scene Example

```xml
<!-- prologue.wts -->
<scene id="prologue">
  <!-- Background Setup -->
  <background src="night_desk.jpg" transition="fade" duration="1000" />
  <bgm src="coding_ambience.mp3" volume="0.6" fadein="2000" />
  
  <!-- Opening Text -->
  <text speed="slow">
    深夜2時。モニターの光だけが部屋を照らしている。
  </text>
  
  <wait time="1000" />
  
  <text speed="slow">
    僕は今、ビジュアルノベルエンジンを作っている。
  </text>
  
  <wait time="800" />
  
  <text>
    名前は<ruby text="ウェブテールキット">WebTaleKit</ruby>。
  </text>
  
  <text>
    Web技術だけで、自由にノベルゲームを作れるエンジン。
  </text>
  
  <wait time="500" />
  
  <text>
    <strong>コードネーム「初音（HATUNE）」</strong>——最初の音色という意味だ。
  </text>
  
  <se src="keyboard_typing.mp3" volume="0.4" />
  
  <text>
    キーボードを叩く音だけが、静かな夜に響く。
  </text>
  
  <wait time="1000" />
  
  <!-- Character Introduction -->
  <character name="muse" src="muse_normal.png" position="center" effect="fadein" />
  
  <text speaker="？？？">
    また徹夜?　体に悪いわよ。
  </text>
  
  <text speaker="主人公">
    ……誰だ?
  </text>
  
  <character name="muse" src="muse_smile.png" />
  
  <text speaker="ミューズ">
    私は<em>ミューズ</em>。あなたの創造性の化身みたいなものよ。
  </text>
  
  <text speaker="主人公">
    創造性の……化身?
  </text>
  
  <text speaker="ミューズ">
    そう。エンジンを作るって大変でしょう?
    一緒に頑張りましょうよ。
  </text>
  
  <text speaker="主人公">
    ……まあ、独り言を言うよりはマシか。
  </text>
  
  <character name="muse" src="muse_excited.png" />
  
  <text speaker="ミューズ">
    それじゃあ、早速始めましょう！
    まずは何から実装する?
  </text>
  
  <jump target="chapter1" />
</scene>
```

---

### 4.3 Chapter 3 Branch Example

```xml
<!-- chapter3.wts -->
<scene id="chapter3">
  <background src="code_editor.jpg" transition="fade" />
  <bgm src="creative_flow.mp3" fadein="1500" />
  
  <character name="muse" src="muse_thinking.png" position="center" />
  
  <text speaker="ミューズ">
    さて、次は重要な機能を実装する番ね。
  </text>
  
  <text speaker="ミューズ">
    <strong>選択肢システム</strong>と<strong>変数管理</strong>、
    どっちを先に作る?
  </text>
  
  <text speaker="主人公">
    うーん……どっちも重要だな。
  </text>
  
  <!-- Branch Point -->
  <choice>
    <option goto="chapter3_choice_route">選択肢機能を先に実装</option>
    <option goto="chapter3_variable_route">変数管理を先に実装</option>
  </choice>
</scene>

<!-- Route A: Choice First -->
<scene id="chapter3_choice_route">
  <set flag="choice_first" value="true" />
  
  <character name="muse" src="muse_smile.png" />
  
  <text speaker="ミューズ">
    選択肢から実装するのね。いい選択だと思うわ。
  </text>
  
  <text speaker="主人公">
    プレイヤーに選択肢を与えるのは、ノベルゲームの核心だからな。
  </text>
  
  <se src="success.mp3" />
  
  <text>
    選択肢システムの実装を開始した……
  </text>
  
  <!-- Implementation details -->
  <text speaker="主人公">
    XMLライクな構文で……<code>&lt;choice&gt;</code>タグを使おう。
  </text>
  
  <codeHighlight language="xml" code="<choice>
  <option goto='scene_a'>選択肢A</option>
  <option goto='scene_b'>選択肢B</option>
</choice>" />
  
  <wait time="1500" />
  
  <text speaker="ミューズ">
    完璧！次は変数管理も実装しないとね。
  </text>
  
  <jump target="chapter3_merge" />
</scene>

<!-- Route B: Variable First -->
<scene id="chapter3_variable_route">
  <set flag="variable_first" value="true" />
  
  <character name="muse" src="muse_normal.png" />
  
  <text speaker="ミューズ">
    変数管理からなのね。堅実なアプローチだわ。
  </text>
  
  <text speaker="主人公">
    選択肢を実装する前に、状態を管理する仕組みが必要だ。
  </text>
  
  <se src="success.mp3" />
  
  <text>
    変数管理システムの実装を開始した……
  </text>
  
  <text speaker="主人公">
    <code>&lt;set&gt;</code>タグで変数をセットして……
  </text>
  
  <codeHighlight language="xml" code="<set var='score' value='100' />
<set flag='visited' value='true' />" />
  
  <wait time="1500" />
  
  <text speaker="ミューズ">
    これで状態管理はバッチリね。選択肢も実装しましょう。
  </text>
  
  <jump target="chapter3_merge" />
</scene>

<!-- Merge Point -->
<scene id="chapter3_merge">
  <text speaker="主人公">
    よし、両方の機能が揃った。
  </text>
  
  <!-- Conditional text based on route -->
  <if condition="choice_first == true">
    <text speaker="主人公">
      選択肢を先に作ったことで、変数の使い方がよく分かったな。
    </text>
  </if>
  
  <if condition="variable_first == true">
    <text speaker="主人公">
      変数管理を先に固めたから、選択肢の実装がスムーズだった。
    </text>
  </if>
  
  <character name="muse" src="muse_excited.png" />
  
  <text speaker="ミューズ">
    次はサウンドシステムよ！
  </text>
  
  <jump target="chapter4" />
</scene>
```

---

## 5. TypeScript Extension Specifications

### 5.1 Custom Command Base Class

```typescript
// @talekit/core types
export abstract class CustomCommand {
  abstract name: string;
  abstract execute(params: Record<string, any>): void | Promise<void>;
  
  protected getElement(selector: string): HTMLElement | null {
    return document.querySelector(selector);
  }
}
```

---

### 5.2 Particle Effect Implementation

```typescript
// extensions/ParticleEffect.ts

import { CustomCommand } from '@talekit/core';

interface ParticleParams {
  type: 'snow' | 'sakura' | 'sparkle';
  count: number;
  duration?: number;
}

export class ParticleEffect extends CustomCommand {
  name = 'particle';
  private particles: HTMLElement[] = [];
  
  async execute(params: ParticleParams): Promise<void> {
    const container = this.getOrCreateContainer();
    const { type, count, duration = 5000 } = params;
    
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        this.createParticle(container, type);
      }, i * (duration / count));
    }
    
    // Auto cleanup after duration
    setTimeout(() => this.cleanup(), duration);
  }
  
  private getOrCreateContainer(): HTMLElement {
    let container = this.getElement('.particle-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'particle-container';
      document.body.appendChild(container);
    }
    return container;
  }
  
  private createParticle(container: HTMLElement, type: string): void {
    const particle = document.createElement('div');
    particle.className = `particle particle-${type}`;
    
    // Random position
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.animationDuration = `${3 + Math.random() * 2}s`;
    particle.style.animationDelay = `${Math.random() * 2}s`;
    
    container.appendChild(particle);
    this.particles.push(particle);
    
    // Remove after animation
    particle.addEventListener('animationend', () => {
      particle.remove();
    });
  }
  
  private cleanup(): void {
    this.particles.forEach(p => p.remove());
    this.particles = [];
  }
}
```

**CSS (animations.css):**
```css
.particle-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1000;
  overflow: hidden;
}

.particle {
  position: absolute;
  top: -10px;
  animation: fall linear forwards;
}

@keyframes fall {
  to {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
}

.particle-snow::before {
  content: '❄';
  font-size: 20px;
  color: white;
}

.particle-sakura::before {
  content: '🌸';
  font-size: 24px;
}

.particle-sparkle::before {
  content: '✨';
  font-size: 16px;
}
```

**Usage in WebTaleScript:**
```xml
<particle type="snow" count="50" duration="5000" />
```

---

### 5.3 Code Highlight Effect

```typescript
// extensions/CodeHighlight.ts

import { CustomCommand } from '@talekit/core';

interface CodeHighlightParams {
  language: 'typescript' | 'javascript' | 'xml' | 'html';
  code: string;
  lineNumbers?: boolean;
}

export class CodeHighlight extends CustomCommand {
  name = 'codeHighlight';
  
  async execute(params: CodeHighlightParams): Promise<void> {
    const { language, code, lineNumbers = true } = params;
    
    const container = this.getElement('#message-window');
    if (!container) return;
    
    const codeBlock = document.createElement('div');
    codeBlock.className = `code-highlight language-${language}`;
    
    if (lineNumbers) {
      const lines = code.split('\n');
      const numberedCode = lines.map((line, idx) => {
        return `<div class="code-line">
          <span class="line-number">${idx + 1}</span>
          <span class="line-content">${this.highlight(line, language)}</span>
        </div>`;
      }).join('');
      codeBlock.innerHTML = numberedCode;
    } else {
      codeBlock.innerHTML = this.highlight(code, language);
    }
    
    container.appendChild(codeBlock);
    
    // Fade in animation
    codeBlock.style.opacity = '0';
    requestAnimationFrame(() => {
      codeBlock.style.transition = 'opacity 0.5s';
      codeBlock.style.opacity = '1';
    });
  }
  
  private highlight(code: string, language: string): string {
    // Simple syntax highlighting
    const rules = this.getSyntaxRules(language);
    let highlighted = this.escapeHtml(code);
    
    rules.forEach(({ pattern, className }) => {
      highlighted = highlighted.replace(
        pattern,
        `<span class="${className}">$&</span>`
      );
    });
    
    return highlighted;
  }
  
  private getSyntaxRules(language: string) {
    const rules: Record<string, Array<{ pattern: RegExp; className: string }>> = {
      typescript: [
        { pattern: /\b(const|let|var|function|class|interface|type|import|export|return|if|else|for|while)\b/g, className: 'keyword' },
        { pattern: /'[^']*'|"[^"]*"/g, className: 'string' },
        { pattern: /\b\d+\b/g, className: 'number' },
        { pattern: /\/\/.*/g, className: 'comment' },
      ],
      xml: [
        { pattern: /&lt;[^&]*&gt;/g, className: 'tag' },
        { pattern: /\w+=/g, className: 'attribute' },
        { pattern: /"[^"]*"/g, className: 'string' },
      ],
    };
    return rules[language] || [];
  }
  
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
}
```

**CSS (theme-vscode.css):**
```css
.code-highlight {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 16px;
  border-radius: 4px;
  font-family: 'Fira Code', monospace;
  font-size: 14px;
  line-height: 1.6;
  margin: 12px 0;
  overflow-x: auto;
}

.code-line {
  display: flex;
}

.line-number {
  color: #858585;
  margin-right: 16px;
  user-select: none;
  min-width: 30px;
  text-align: right;
}

.line-content {
  flex: 1;
}

/* Syntax highlighting colors */
.keyword { color: #569cd6; }
.string { color: #ce9178; }
.number { color: #b5cea8; }
.comment { color: #6a9955; font-style: italic; }
.tag { color: #4ec9b0; }
.attribute { color: #9cdcfe; }
```

---

### 5.4 Typing Effect

```typescript
// extensions/TypingEffect.ts

import { CustomCommand } from '@talekit/core';

interface TypingParams {
  text: string;
  speed?: number; // milliseconds per character
  sound?: string; // typing sound effect
}

export class TypingEffect extends CustomCommand {
  name = 'typeEffect';
  private audio?: HTMLAudioElement;
  
  async execute(params: TypingParams): Promise<void> {
    const { text, speed = 100, sound } = params;
    const container = this.getElement('#message-text');
    if (!container) return;
    
    if (sound) {
      this.audio = new Audio(`assets/audio/se/${sound}`);
      this.audio.loop = true;
      this.audio.volume = 0.3;
    }
    
    container.textContent = '';
    
    if (this.audio) this.audio.play();
    
    for (let i = 0; i < text.length; i++) {
      await this.wait(speed);
      container.textContent += text[i];
    }
    
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
  }
  
  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

**Usage:**
```xml
<typeEffect 
  text="console.log('Hello, WebTaleKit!');" 
  speed="80" 
  sound="keyboard_typing.mp3" 
/>
```

---

### 5.5 Extension Registration

```typescript
// main.ts

import { WebTaleKit } from '@talekit/core';
import { ParticleEffect } from './extensions/ParticleEffect';
import { CodeHighlight } from './extensions/CodeHighlight';
import { TypingEffect } from './extensions/TypingEffect';

const engine = new WebTaleKit({
  container: '#webtalekit-container',
  scenarioPath: 'scenarios/',
});

// Register custom commands
engine.registerCommand(new ParticleEffect());
engine.registerCommand(new CodeHighlight());
engine.registerCommand(new TypingEffect());

// Load initial scene
engine.loadScene('prologue');
```

---

## 6. Resource Specifications

### 6.1 Image Assets

#### 6.1.1 Backgrounds

All backgrounds: **1920x1080 pixels, JPEG format, optimized quality 85%**

| Filename | Description | Mood/Lighting |
|----------|-------------|---------------|
| `night_desk.jpg` | Desk with monitor, keyboard, late night | Dark, blue glow |
| `morning_desk.jpg` | Same desk, morning light | Warm, sunlight |
| `code_editor.jpg` | Close-up of code on screen | Dark theme, syntax colors |
| `workspace_wide.jpg` | Wide shot of workspace | Ambient, creative |

**Color Palette:**
- Night: Deep blues (#1a1a2e), monitor glow (#00d9ff)
- Morning: Warm yellows (#fff4e6), natural light
- Code: VSCode dark theme (#1e1e1e, #569cd6, #ce9178)

---

#### 6.1.2 Character Sprites

Character: **Muse (ミューズ)** - Personification of inspiration

**Specifications:**
- Size: 600x1200 pixels
- Format: PNG with transparency
- Position: Centered at 960px horizontal
- Style: Anime/manga inspired, soft colors

**Expressions:**

| Filename | Expression | Use Case |
|----------|------------|----------|
| `muse_normal.png` | Neutral, friendly | Default state |
| `muse_smile.png` | Happy, encouraging | Positive feedback |
| `muse_thinking.png` | Pondering, curious | Problem-solving |
| `muse_excited.png` | Enthusiastic | Achievements |
| `muse_worried.png` | Concerned | Warnings, challenges |

**Character Design Notes:**
- Hair: Light blue/purple gradient
- Eyes: Bright, expressive
- Outfit: Modern casual with tech accessories
- Color scheme: Cool tones, complementing UI

---

### 6.2 Audio Assets

#### 6.2.1 Background Music (BGM)

All BGM: **MP3 format, 128kbps, stereo, loopable**

| Filename | Duration | Mood | Scenes |
|----------|----------|------|--------|
| `coding_ambience.mp3` | 3:00 | Focused, calm, ambient | Prologue, working scenes |
| `creative_flow.mp3` | 2:45 | Uplifting, rhythmic | Implementation scenes |
| `achievement.mp3` | 2:30 | Triumphant, energetic | Success moments |
| `contemplation.mp3` | 3:15 | Thoughtful, piano-based | Decision points |

**Loop Points:** All tracks seamlessly loop (fade in last 2 seconds into first 2 seconds)

---

#### 6.2.2 Sound Effects (SE)

All SE: **MP3 format, 96kbps, mono or stereo, < 3 seconds**

| Filename | Description | Trigger |
|----------|-------------|---------|
| `keyboard_typing.mp3` | Mechanical keyboard typing | Coding scenes |
| `success.mp3` | Positive chime | Feature completion |
| `error.mp3` | Soft error beep | Mistakes, bugs |
| `notification.mp3` | UI notification sound | Messages, alerts |
| `page_turn.mp3` | Paper flip sound | Scene transitions |
| `click.mp3` | Button click | UI interactions |

---

### 6.3 Font Assets

**Primary Font:** Fira Code (for code display)
- File: `FiraCode-Regular.woff2`
- License: OFL (Open Font License)
- Features: Ligatures, monospace

**Fallback Fonts:**
- Japanese: "Noto Sans JP", sans-serif (Google Fonts CDN)
- UI: system-ui, -apple-system, sans-serif

**Font Loading (CSS):**
```css
@font-face {
  font-family: 'Fira Code';
  src: url('assets/fonts/FiraCode-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```

---

### 6.4 Resource Loading Strategy

```typescript
// Preload critical assets
const criticalAssets = [
  'backgrounds/night_desk.jpg',
  'characters/muse_normal.png',
  'bgm/coding_ambience.mp3',
];

// Lazy load non-critical assets
const deferredAssets = [
  'backgrounds/morning_desk.jpg',
  'characters/muse_smile.png',
  // ... other assets
];

async function preloadAssets(assets: string[]): Promise<void> {
  const promises = assets.map(asset => {
    if (asset.endsWith('.jpg') || asset.endsWith('.png')) {
      return preloadImage(asset);
    } else if (asset.endsWith('.mp3')) {
      return preloadAudio(asset);
    }
  });
  await Promise.all(promises);
}
```

---

## 7. UI/DOM Requirements

### 7.1 Required DOM Structure

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>初音の調べ - WebTaleKit Sample Game</title>
  <link rel="stylesheet" href="styles/main.css">
  <link rel="stylesheet" href="styles/theme-vscode.css">
  <link rel="stylesheet" href="styles/animations.css">
</head>
<body>
  <!-- Main Game Container -->
  <div id="webtalekit-container" class="game-container">
    
    <!-- Background Layer (z-index: 0) -->
    <div id="background-layer" class="layer layer-background"></div>
    
    <!-- Character Layer (z-index: 10) -->
    <div id="character-layer" class="layer layer-character"></div>
    
    <!-- Text Layer (z-index: 20) -->
    <div id="text-layer" class="layer layer-text">
      <div id="name-box" class="name-box"></div>
      <div id="message-window" class="message-window">
        <p id="message-text" class="message-text"></p>
      </div>
      <div id="next-indicator" class="next-indicator">▼</div>
    </div>
    
    <!-- UI Layer (z-index: 30) -->
    <div id="ui-layer" class="layer layer-ui">
      <!-- Choice Menu -->
      <div id="choice-menu" class="choice-menu" style="display: none;">
        <!-- Dynamically populated -->
      </div>
      
      <!-- Menu Buttons -->
      <div id="menu-buttons" class="menu-buttons">
        <button id="btn-auto" class="menu-btn" title="Auto">AUTO</button>
        <button id="btn-skip" class="menu-btn" title="Skip">SKIP</button>
        <button id="btn-log" class="menu-btn" title="Backlog">LOG</button>
        <button id="btn-save" class="menu-btn" title="Save">SAVE</button>
        <button id="btn-load" class="menu-btn" title="Load">LOAD</button>
        <button id="btn-config" class="menu-btn" title="Config">CONFIG</button>
      </div>
    </div>
    
    <!-- Overlay Layer (z-index: 40) -->
    <div id="overlay-layer" class="layer layer-overlay"></div>
    
  </div>
  
  <!-- Loading Screen -->
  <div id="loading-screen" class="loading-screen">
    <div class="loading-spinner"></div>
    <p class="loading-text">Loading...</p>
  </div>
  
  <script type="module" src="scripts/main.js"></script>
</body>
</html>
```

---

### 7.2 CSS Layer System

```css
/* main.css */

:root {
  --color-bg: #1e1e1e;
  --color-text: #d4d4d4;
  --color-accent: #569cd6;
  --color-highlight: #ce9178;
  --layer-bg: 0;
  --layer-char: 10;
  --layer-text: 20;
  --layer-ui: 30;
  --layer-overlay: 40;
}

body {
  margin: 0;
  padding: 0;
  overflow: hidden;
  font-family: 'Noto Sans JP', sans-serif;
  background: var(--color-bg);
  color: var(--color-text);
}

.game-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.layer-background {
  z-index: var(--layer-bg);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.layer-character {
  z-index: var(--layer-char);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  pointer-events: none;
}

.layer-text {
  z-index: var(--layer-text);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 0 40px 40px;
  pointer-events: none;
}

.layer-ui {
  z-index: var(--layer-ui);
  pointer-events: none;
}

.layer-ui > * {
  pointer-events: auto;
}

/* Message Window */
.message-window {
  background: rgba(30, 30, 30, 0.9);
  border: 2px solid var(--color-accent);
  border-radius: 8px;
  padding: 24px 32px;
  min-height: 120px;
  max-width: 1200px;
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.name-box {
  background: var(--color-accent);
  color: white;
  padding: 8px 20px;
  border-radius: 4px 4px 0 0;
  font-weight: bold;
  display: inline-block;
  margin-bottom: -2px;
}

.message-text {
  margin: 0;
  font-size: 18px;
  line-height: 1.8;
  color: var(--color-text);
}

.next-indicator {
  position: absolute;
  bottom: 60px;
  right: 60px;
  font-size: 24px;
  color: var(--color-accent);
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
```

---

### 7.3 Character Positioning

```css
/* Character sprite positioning */
.character-sprite {
  position: absolute;
  bottom: 0;
  max-width: 600px;
  height: auto;
  transition: all 0.3s ease;
}

.character-sprite[data-position="left"] {
  left: 10%;
  transform: translateX(0);
}

.character-sprite[data-position="center"] {
  left: 50%;
  transform: translateX(-50%);
}

.character-sprite[data-position="right"] {
  right: 10%;
  transform: translateX(0);
}

/* Character effects */
.character-sprite.fade-in {
  animation: fadeIn 0.3s ease;
}

.character-sprite.fade-out {
  animation: fadeOut 0.3s ease forwards;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}
```

---

### 7.4 Choice Menu Styling

```css
/* Choice menu */
.choice-menu {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(30, 30, 30, 0.95);
  border: 2px solid var(--color-accent);
  border-radius: 8px;
  padding: 32px;
  min-width: 500px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
}

.choice-option {
  background: rgba(86, 156, 214, 0.1);
  border: 2px solid var(--color-accent);
  color: var(--color-text);
  padding: 16px 24px;
  margin: 12px 0;
  font-size: 16px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
  width: 100%;
  text-align: left;
}

.choice-option:hover {
  background: var(--color-accent);
  color: white;
  transform: translateX(8px);
}

.choice-option:active {
  transform: scale(0.98);
}
```

---

### 7.5 Menu Buttons

```css
/* UI Buttons */
.menu-buttons {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 8px;
}

.menu-btn {
  background: rgba(30, 30, 30, 0.8);
  border: 1px solid var(--color-accent);
  color: var(--color-text);
  padding: 8px 16px;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.menu-btn:hover {
  background: var(--color-accent);
  color: white;
}

.menu-btn.active {
  background: var(--color-highlight);
  border-color: var(--color-highlight);
  color: white;
}
```

---

## 8. Testing Checklist

### 8.1 Feature Testing

#### Text Display
- [ ] Text appears at correct speed (slow/normal/fast)
- [ ] Ruby text displays correctly above base text
- [ ] Emphasis tags (<em>, <strong>) render properly
- [ ] Color tags change text color
- [ ] Text wraps correctly in message window
- [ ] Speaker name displays in name box

#### Background & Images
- [ ] Background images load correctly
- [ ] Fade transition works smoothly
- [ ] Slide transition works correctly
- [ ] Multiple backgrounds can be switched
- [ ] Images scale properly on different resolutions

#### Character Sprites
- [ ] Characters appear at correct positions (left/center/right)
- [ ] Fade in/out effects work
- [ ] Expression changes smoothly
- [ ] Multiple characters can be displayed simultaneously
- [ ] Character removal works correctly

#### Audio
- [ ] BGM loads and plays
- [ ] BGM loops seamlessly
- [ ] Fade in/out works
- [ ] Volume control works (0.0-1.0)
- [ ] SE plays without interrupting BGM
- [ ] Crossfade between tracks works

#### Choice System
- [ ] Choices display correctly
- [ ] Clicking choice navigates to correct scene
- [ ] Choice hover effects work
- [ ] Keyboard navigation works (optional)

#### Variables & Flags
- [ ] Variables can be set and retrieved
- [ ] Flags can be toggled
- [ ] Conditional display based on flags works
- [ ] Mathematical operations on variables work
- [ ] Variables persist across scenes

#### Save/Load
- [ ] Save creates valid save data
- [ ] Load restores game state correctly
- [ ] Multiple save slots work
- [ ] Save data includes all necessary state
- [ ] Save data is properly serialized

---

### 8.2 Extension Testing

#### Particle Effect
- [ ] Snow particles fall correctly
- [ ] Sakura particles animate properly
- [ ] Sparkle particles appear
- [ ] Particle count is correct
- [ ] Duration parameter works
- [ ] Particles clean up after duration
- [ ] No memory leaks from particles

#### Code Highlight
- [ ] Code displays with correct syntax highlighting
- [ ] Line numbers appear (if enabled)
- [ ] Multiple languages render differently
- [ ] Long code doesn't break layout
- [ ] Code is scrollable if needed

#### Typing Effect
- [ ] Characters appear one by one
- [ ] Speed parameter works
- [ ] Sound effect plays during typing
- [ ] Sound stops when typing completes
- [ ] Effect can be skipped

---

### 8.3 UI/UX Testing

#### Responsiveness
- [ ] Game scales on 1920x1080
- [ ] Game scales on 1366x768
- [ ] Game scales on 1280x720
- [ ] Touch controls work (mobile/tablet)
- [ ] Game is playable on 16:9 aspect ratio

#### Interactions
- [ ] Click advances text
- [ ] Auto mode works correctly
- [ ] Skip mode works
- [ ] Backlog displays previous text
- [ ] Config menu opens and saves settings

#### Performance
- [ ] Game runs at 60fps
- [ ] No lag when switching scenes
- [ ] Audio doesn't stutter
- [ ] Animations are smooth
- [ ] Memory usage stays below 200MB

---

### 8.4 Browser Compatibility

- [ ] Chrome 90+ (Windows)
- [ ] Chrome 90+ (macOS)
- [ ] Firefox 88+ (Windows)
- [ ] Firefox 88+ (macOS)
- [ ] Safari 14+ (macOS)
- [ ] Edge 90+ (Windows)

---

### 8.5 Story Flow Testing

- [ ] Prologue → Chapter 1 transition works
- [ ] Chapter 1 → Chapter 2 transition works
- [ ] Chapter 3 choice branches correctly
- [ ] Both routes in Chapter 3 merge properly
- [ ] Conditional text based on route appears correctly
- [ ] Chapter 5 → Epilogue transition works
- [ ] Ending A triggers with correct flags
- [ ] Ending B triggers with correct flags
- [ ] Ending C triggers with correct flags

---

## 9. Implementation Workflow

### 9.1 Phase 1: Project Setup (4-6 hours)

**Objective:** Create project structure and configure build system

**Tasks:**
1. Initialize npm project
   ```bash
   npm init -y
   npm install @talekit/core typescript --save
   npm install vite --save-dev
   ```

2. Create directory structure (as per section 2.1)

3. Configure TypeScript
   ```json
   {
     "compilerOptions": {
       "target": "ES2020",
       "module": "ESNext",
       "lib": ["ES2020", "DOM"],
       "outDir": "./dist",
       "strict": true,
       "esModuleInterop": true,
       "skipLibCheck": true,
       "forceConsistentCasingInFileNames": true
     },
     "include": ["scripts/**/*"]
   }
   ```

4. Create base HTML structure (section 7.1)

5. Setup basic CSS layers (section 7.2)

**Deliverables:**
- Complete project structure
- Configured build system
- Base HTML/CSS files

---

### 9.2 Phase 2: Core Scene Implementation (12-16 hours)

**Objective:** Implement all WebTaleScript scenes

**Tasks:**
1. Write prologue.wts (section 4.2 example)
2. Write chapter1.wts (text effects)
3. Write chapter2.wts (character display)
4. Write chapter3.wts (choice branches) - section 4.3 example
5. Write chapter4.wts (audio control)
6. Write chapter5.wts (extensions)
7. Write epilogue.wts (endings)

**Deliverables:**
- 7 complete .wts files
- Tested scene transitions
- Validated branching logic

---

### 9.3 Phase 3: Extension Development (8-12 hours)

**Objective:** Implement TypeScript custom commands

**Tasks:**
1. Implement ParticleEffect.ts (section 5.2)
2. Implement CodeHighlight.ts (section 5.3)
3. Implement TypingEffect.ts (section 5.4)
4. Create associated CSS (sections 5.2, 5.3)
5. Register extensions in main.ts (section 5.5)
6. Test each extension individually

**Deliverables:**
- 3 working custom commands
- CSS for effects
- Integration tests passed

---

### 9.4 Phase 4: Asset Creation (16-20 hours)

**Objective:** Create or source all required assets

**Tasks:**
1. Create/source background images (section 6.1.1)
   - night_desk.jpg
   - morning_desk.jpg
   - code_editor.jpg
   - workspace_wide.jpg

2. Create/commission character sprites (section 6.1.2)
   - muse_normal.png
   - muse_smile.png
   - muse_thinking.png
   - muse_excited.png
   - muse_worried.png

3. Create/source BGM tracks (section 6.2.1)
   - coding_ambience.mp3
   - creative_flow.mp3
   - achievement.mp3
   - contemplation.mp3

4. Create/source sound effects (section 6.2.2)
   - keyboard_typing.mp3
   - success.mp3
   - error.mp3
   - notification.mp3
   - page_turn.mp3
   - click.mp3

5. Download Fira Code font (section 6.3)

**Deliverables:**
- All image assets (optimized)
- All audio assets (loopable BGM)
- Font files

---

### 9.5 Phase 5: UI Polish (6-8 hours)

**Objective:** Complete UI implementation and styling

**Tasks:**
1. Implement VSCode-inspired theme (section 7.2)
2. Style choice menu (section 7.4)
3. Style menu buttons (section 7.5)
4. Implement character positioning system (section 7.3)
5. Create loading screen
6. Add animations (section animations.css)
7. Responsive design adjustments

**Deliverables:**
- Complete CSS styling
- Responsive layout
- Polished UI elements

---

### 9.6 Phase 6: Testing & Optimization (8-10 hours)

**Objective:** Comprehensive testing and performance optimization

**Tasks:**
1. Run feature testing checklist (section 8.1)
2. Run extension testing (section 8.2)
3. Run UI/UX testing (section 8.3)
4. Test on all target browsers (section 8.4)
5. Test complete story flow (section 8.5)
6. Optimize asset loading
7. Minify CSS/JS
8. Fix bugs and issues

**Deliverables:**
- All tests passing
- Bug-free gameplay
- Optimized performance

---

### 9.7 Phase 7: Documentation (4-6 hours)

**Objective:** Create user and developer documentation

**Tasks:**
1. Write README.md
   - Project description
   - Installation instructions
   - How to play
   - Credits

2. Write DEVELOPER.md
   - Code structure explanation
   - How to add new scenes
   - How to create custom commands
   - Build instructions

3. Add code comments
   - Document complex functions
   - Explain extension APIs
   - Add JSDoc comments

4. Create tutorial/guide
   - How to use WebTaleKit (based on this sample)
   - Extension development tutorial

**Deliverables:**
- README.md
- DEVELOPER.md
- Well-commented code
- User guide

---

## 10. Success Criteria

### 10.1 Functional Requirements

✅ All WebTaleScript features demonstrated
✅ All custom extensions working
✅ Complete story playthrough (10-15 minutes)
✅ Multiple endings implemented
✅ Save/load system functional
✅ All browser compatibility targets met

### 10.2 Technical Requirements

✅ Runs at 60fps
✅ No console errors
✅ Memory usage < 200MB
✅ Asset loading < 5 seconds
✅ Code passes TypeScript strict mode
✅ All tests in section 8 pass

### 10.3 User Experience Requirements

✅ Intuitive UI
✅ Clear instructions
✅ Smooth animations
✅ Professional visual quality
✅ Engaging story
✅ Educational value for developers

---

## 11. Appendix

### 11.1 JSON Schema for Scenario Data

```json
{
  "scene": {
    "id": "string",
    "commands": [
      {
        "type": "background",
        "params": {
          "src": "string",
          "transition": "fade|slide|none",
          "duration": "number"
        }
      },
      {
        "type": "text",
        "params": {
          "content": "string",
          "speaker": "string",
          "speed": "slow|normal|fast"
        }
      },
      {
        "type": "choice",
        "params": {
          "options": [
            {
              "text": "string",
              "goto": "string"
            }
          ]
        }
      }
    ]
  }
}
```

### 11.2 Event System API

```typescript
// Engine emits events that can be listened to
engine.on('sceneLoad', (sceneId: string) => {
  console.log(`Loaded scene: ${sceneId}`);
});

engine.on('commandExecute', (command: Command) => {
  console.log(`Executing: ${command.type}`);
});

engine.on('choiceMade', (choice: Choice) => {
  console.log(`Player chose: ${choice.text}`);
});

engine.on('error', (error: Error) => {
  console.error('Engine error:', error);
});
```

### 11.3 Useful Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Type checking
npm run type-check

# Lint code
npm run lint

# Format code
npm run format
```

---

**END OF SPECIFICATION**

This document provides complete implementation guidance for AI agents to develop the "初音の調べ" sample game for WebTaleKit. All technical details, code examples, and specifications are production-ready and can be directly implemented.
