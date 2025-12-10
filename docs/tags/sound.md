# sound タグ

音声ファイルを再生・停止します。

## 基本的な使い方

```html
<sound src="bgm/main_theme.mp3" mode="bgm" play loop />
```

## 属性

| 属性 | 型 | 必須 | デフォルト | 説明 |
|------|------|------|----------|------|
| src | string | × | - | 音声ファイルのパス |
| name | string | × | - | 音声の識別子（指定しない場合はファイル名から自動生成） |
| mode | 'bgm' \| 'se' | × | 'se' | 音声タイプ：BGMは自動ループ、SEは1回再生 |
| play | boolean | × | - | 音声をすぐに再生 |
| stop | boolean | × | - | 音声を停止 |
| pause | boolean | × | - | 音声を一時停止 |
| loop | boolean | × | - | 音声をループ再生（BGMは自動的にtrue） |
| if | string | × | - | 条件式 |

## エイリアスタグ

音声タイプに応じた専用タグを使用できます：

```html
<!-- BGM -->
<bgm src="main_theme.mp3" play />

<!-- SE（効果音） -->
<se src="door.mp3" play />

<!-- Voice -->
<voice src="greeting.mp3" play />
```

これらは`sound`タグに自動的に変換されます。

## 使用例

### BGMの再生

```html
<sound src="bgm/main_theme.mp3" mode="bgm" play loop />
```

または：

```html
<bgm src="main_theme.mp3" play />
```

### BGMの停止

```html
<sound name="main_theme.mp3" stop />
```

### 効果音の再生

```html
<se src="door.mp3" play />
<se src="footsteps.mp3" play />
```

### ボイスの再生

`say`タグと組み合わせて使用：

```html
<say name="ヒロイン" voice="heroine_greeting.mp3">
  「おはようございます！」
</say>
```

または独立して再生：

```html
<voice src="heroine_greeting.mp3" play />
```

## sceneConfigでBGMを設定

シーン全体のBGMは、`sceneConfig`で設定できます：

```javascript
const sceneConfig = {
  name: 'プロローグ',
  background: 'room.jpg',
  bgm: 'prologue_theme.mp3'  // 自動的に再生される
}
```

## 実用例

### シーン開始時のBGM

```html
<scenario>
  <text>物語が始まる。</text>
</scenario>

<script>
const sceneConfig = {
  bgm: 'prologue_theme.mp3'
}
</script>
```

### BGMの切り替え

```html
<text>雰囲気が変わった。</text>

<!-- 現在のBGMを停止 -->
<sound name="prologue_theme.mp3" stop />

<!-- 新しいBGMを再生 -->
<bgm src="tense_theme.mp3" play />
```

### 効果音の使用

```html
<text>ドアをノックした。</text>
<se src="knock.mp3" play />

<text>ドアが開いた。</text>
<se src="door_open.mp3" play />

<show path="chara/friend.png" name="friend" />
<say name="友人">「どうぞ」</say>
```

### ボイス付きセリフ

```html
<say name="ヒロイン" pattern="smile" voice="heroine_greeting.mp3">
  「おはようございます、先輩！」
</say>

<say name="ヒロイン" pattern="embarrassed" voice="heroine_shy.mp3">
  「あの...今日は一緒に帰りませんか？」
</say>
```

### 戦闘シーンのBGM切り替え

```html
<text>突然、敵が現れた！</text>

<!-- 通常BGMを停止 -->
<sound name="main_bgm" stop />

<!-- 戦闘BGMを再生 -->
<bgm src="battle.mp3" name="battle_bgm" play />

<text>戦闘が始まった！</text>

<!-- 戦闘処理... -->

<text>敵を倒した！</text>

<!-- 戦闘BGMを停止 -->
<sound name="battle_bgm" stop />

<!-- 通常BGMに戻す -->
<bgm src="main_theme.mp3" name="main_bgm" play />
```

### 条件付き音声再生

```html
<se src="victory.mp3" play if="playerWon" />
<se src="defeat.mp3" play if="!playerWon" />
```

## リソース定義を使用

`config.js`でリソースを定義している場合、名前で参照できます：

```javascript
// src/resource/config.js
export const audio = [
  { main_theme: '/bgm/main_theme.mp3' },
  { battle: '/bgm/battle.mp3' }
]

export const se = [
  { door: '/se/door.mp3' },
  { footsteps: '/se/footsteps.mp3' }
]

export const voice = [
  { heroine_greeting: '/voice/heroine_greeting.mp3' }
]
```

```html
<!-- nameで参照 -->
<bgm name="main_theme" play />
<se name="door" play />
<voice name="heroine_greeting" play />
```

## 対応フォーマット

### 推奨フォーマット

| 種類 | 推奨フォーマット | 備考 |
|------|----------------|------|
| BGM | MP3, OGG | ループ再生に対応 |
| SE | MP3, OGG | 短い音は軽量なOGGも推奨 |
| Voice | MP3, OGG | MP3が一般的 |

### ブラウザ対応

主要ブラウザ（Chrome, Firefox, Edge, Safari）でMP3とOGGをサポートしています。

## ファイルサイズの最適化

### BGM

- ビットレート: 128kbps～192kbps
- サンプリングレート: 44.1kHz
- モノラル/ステレオ: ステレオ

### SE

- ビットレート: 64kbps～128kbps
- サンプリングレート: 22.05kHz～44.1kHz
- モノラル/ステレオ: モノラル（容量削減）

### Voice

- ビットレート: 96kbps～128kbps
- サンプリングレート: 44.1kHz
- モノラル/ステレオ: モノラル

## 特殊な動作

### BGMの自動停止

新しいBGMを再生すると、現在再生中のBGMは自動的に停止されます：

```html
<bgm src="theme1.mp3" play />
<!-- theme1が再生中 -->

<bgm src="theme2.mp3" play />
<!-- theme1は自動的に停止され、theme2が再生される -->
```

### 音声のキャッシュ

一度再生した音声は`usedSounds`にキャッシュされ、`name`で再度参照できます：

```html
<sound src="bgm/main.mp3" name="main_bgm" play />

<!-- 後で停止 -->
<sound name="main_bgm" stop />
```

## 関連タグ

- [say](/tags/say) - キャラクターのセリフ（voice属性でボイス再生）
- [route](/tags/route) - シーン移動（BGMは自動的に切り替わる）

## 次のステップ

- [音声](/api/sound) - 音声機能の概要
- [sayタグ](/tags/say) - ボイス付きセリフ
