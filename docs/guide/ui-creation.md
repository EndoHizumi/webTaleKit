# UIの作成

webTaleKitでは、HTML・CSS・JavaScriptを使って自由にUIを作成できます。

## UIファイルの構成

各シーンのUIは、3つのファイルで構成されます：

```
src/screen/
├── default.html    # UIの構造（HTML）
├── default.css     # UIのスタイル（CSS）
└── default.js      # UIの動作（JavaScript）
```

## デフォルトUIの構造

### HTML (default.html)

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="default.css">
</head>
<body>
  <!-- ゲームコンテナ -->
  <div id="game-container">
    <!-- キャンバスレイヤー（背景・キャラクター） -->
    <canvas id="game-canvas"></canvas>

    <!-- メッセージウィンドウ -->
    <div id="message-window">
      <div id="character-name"></div>
      <div id="message-text"></div>
      <div id="next-indicator">▼</div>
    </div>

    <!-- 選択肢コンテナ -->
    <div id="choice-container"></div>

    <!-- UIコントロール -->
    <div id="ui-controls">
      <button id="menu-button">Menu</button>
      <button id="skip-button">Skip</button>
      <button id="auto-button">Auto</button>
    </div>
  </div>

  <script src="default.js"></script>
</body>
</html>
```

### CSS (default.css)

```css
/* ゲームコンテナ */
#game-container {
  position: relative;
  width: 1280px;
  height: 720px;
  margin: 0 auto;
  overflow: hidden;
  background-color: #000;
}

/* キャンバス */
#game-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

/* メッセージウィンドウ */
#message-window {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 1100px;
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid #333;
  border-radius: 10px;
  padding: 20px;
  z-index: 10;
}

/* キャラクター名 */
#character-name {
  font-size: 20px;
  font-weight: bold;
  color: #ffcc00;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}

/* メッセージテキスト */
#message-text {
  font-size: 18px;
  line-height: 1.8;
  color: #ffffff;
  min-height: 80px;
}

/* 次へ進むインジケーター */
#next-indicator {
  position: absolute;
  bottom: 10px;
  right: 20px;
  font-size: 24px;
  color: #ffcc00;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

/* 選択肢コンテナ */
#choice-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  max-width: 600px;
  z-index: 20;
  display: none;
}

.choice-item {
  background: linear-gradient(to bottom, #4a4a4a, #2a2a2a);
  border: 2px solid #666;
  border-radius: 8px;
  padding: 15px 20px;
  margin: 10px 0;
  font-size: 18px;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
}

.choice-item:hover {
  background: linear-gradient(to bottom, #5a5a5a, #3a3a3a);
  border-color: #ffcc00;
  transform: scale(1.05);
}

.choice-item:active {
  background: linear-gradient(to bottom, #3a3a3a, #1a1a1a);
}

/* UIコントロール */
#ui-controls {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 15;
}

#ui-controls button {
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid #666;
  color: #fff;
  padding: 10px 15px;
  margin-left: 10px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

#ui-controls button:hover {
  background: rgba(50, 50, 50, 0.8);
  border-color: #ffcc00;
}
```

### JavaScript (default.js)

```javascript
// UIの初期化
document.addEventListener('DOMContentLoaded', () => {
  const messageWindow = document.getElementById('message-window');
  const characterName = document.getElementById('character-name');
  const messageText = document.getElementById('message-text');
  const nextIndicator = document.getElementById('next-indicator');
  const choiceContainer = document.getElementById('choice-container');

  // メッセージ表示関数
  window.showMessage = (name, text) => {
    if (name) {
      characterName.textContent = name;
      characterName.style.display = 'block';
    } else {
      characterName.style.display = 'none';
    }
    messageText.textContent = text;
    nextIndicator.style.display = 'block';
  };

  // 選択肢表示関数
  window.showChoices = (choices) => {
    choiceContainer.innerHTML = '';
    choiceContainer.style.display = 'block';
    messageWindow.style.display = 'none';

    choices.forEach((choice, index) => {
      const button = document.createElement('div');
      button.className = 'choice-item';
      button.textContent = choice.label;
      button.addEventListener('click', () => {
        choice.onSelect();
        choiceContainer.style.display = 'none';
        messageWindow.style.display = 'block';
      });
      choiceContainer.appendChild(button);
    });
  };

  // メニューボタン
  document.getElementById('menu-button').addEventListener('click', () => {
    // メニュー表示処理
    console.log('Menu clicked');
  });

  // スキップボタン
  document.getElementById('skip-button').addEventListener('click', () => {
    // スキップ処理
    console.log('Skip clicked');
  });

  // オートボタン
  document.getElementById('auto-button').addEventListener('click', () => {
    // オート再生処理
    console.log('Auto clicked');
  });
});
```

## カスタムUIの作成

### 1. 新しいUIファイルを作成

カスタムUIを作成する場合は、新しいファイルセットを作成します：

```
src/screen/
├── custom.html
├── custom.css
└── custom.js
```

### 2. シーンで使用するUIを指定

```html
<script>
const sceneConfig = {
  template: 'custom',  // customテンプレートを使用
  background: 'room.jpg'
}
</script>
```

## 実用的なUIの例

### ビジュアルノベル風UI

```html
<!-- visual-novel.html -->
<div id="game-container">
  <canvas id="game-canvas"></canvas>

  <div id="vn-message-box">
    <div class="name-plate">
      <span id="vn-character-name"></span>
    </div>
    <div id="vn-message-text"></div>
  </div>

  <div id="vn-choices"></div>
</div>
```

```css
/* visual-novel.css */
#vn-message-box {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.7));
  padding: 30px;
  min-height: 150px;
}

.name-plate {
  position: absolute;
  top: -30px;
  left: 30px;
  background: #2c3e50;
  color: #ecf0f1;
  padding: 8px 20px;
  border-radius: 8px 8px 0 0;
  font-weight: bold;
}
```

### ADV風UI

```html
<!-- adv.html -->
<div id="game-container">
  <canvas id="game-canvas"></canvas>

  <div id="adv-text-box">
    <div id="adv-text"></div>
    <div class="history-button">履歴</div>
  </div>
</div>
```

```css
/* adv.css */
#adv-text-box {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  background: rgba(255, 255, 255, 0.95);
  border: 3px solid #333;
  padding: 40px;
  font-size: 20px;
  line-height: 2;
  color: #333;
}
```

## エンジンAPIとの連携

### メッセージの表示

```javascript
// エンジンからメッセージを受け取る
engine.on('message', (data) => {
  showMessage(data.name, data.text);
});
```

### 選択肢の処理

```javascript
// エンジンから選択肢を受け取る
engine.on('choice', (data) => {
  showChoices(data.items);
});
```

### カスタムイベント

```javascript
// 独自のUIイベントを定義
document.getElementById('save-button').addEventListener('click', () => {
  engine.save(1); // スロット1にセーブ
});

document.getElementById('load-button').addEventListener('click', () => {
  engine.load(1); // スロット1からロード
});
```

## レスポンシブ対応

### 自動スケーリング

```css
#game-container {
  width: 1280px;
  height: 720px;
  transform-origin: top left;
}

@media (max-width: 1280px) {
  #game-container {
    transform: scale(0.8);
  }
}

@media (max-width: 1024px) {
  #game-container {
    transform: scale(0.6);
  }
}
```

### モバイル対応

```css
@media (max-width: 768px) {
  #message-window {
    width: 95%;
    padding: 15px;
  }

  #message-text {
    font-size: 16px;
  }

  #ui-controls {
    bottom: 180px;
    right: 10px;
  }

  #ui-controls button {
    padding: 8px 12px;
    font-size: 12px;
  }
}
```

## ベストプラクティス

### 1. 一貫性のあるデザイン

同じゲーム内では、統一されたデザイン言語を使用しましょう。

### 2. アクセシビリティ

- 十分なコントラスト比を確保
- フォントサイズは読みやすいサイズに
- ボタンは十分な大きさとクリック領域を確保

### 3. パフォーマンス

- 不要なアニメーションは避ける
- 画像は適切なサイズに最適化
- CSSのtransitionを活用

### 4. テスト

複数のブラウザとデバイスでテストしましょう：
- Chrome
- Firefox
- Edge
- モバイルブラウザ

## 次のステップ

- [プロジェクト構造](/guide/project-structure) - UIファイルの配置場所
- [シーンファイル](/guide/scene-files) - UIとシナリオの連携
- [チュートリアル](/guide/tutorial-images) - 実際に作ってみる
