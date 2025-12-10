# 音声

音声再生に関連する機能の概要とタグリファレンスです。

## 概要

webTaleKitでは、以下の音声を再生できます：

- **BGM** - 背景音楽
- **SE** - 効果音
- **Voice** - キャラクターボイス

## 主なタグ

### sound タグ

音声ファイルを再生・停止します。

```html
<sound path="bgm/main_theme.mp3" />
```

### エイリアスタグ

各音声タイプに応じた専用タグを使用できます：

```html
<!-- BGM -->
<bgm path="main_theme.mp3" />

<!-- SE -->
<se path="door.mp3" />

<!-- Voice -->
<voice path="greeting.mp3" />
```

## 基本的な音声操作

### BGMの再生

```html
<sound path="bgm/main_theme.mp3" name="bgm_main" />
```

または：

```html
<bgm path="main_theme.mp3" name="bgm_main" />
```

### BGMの停止

```html
<sound name="bgm_main" stop />
```

### 効果音の再生

```html
<se path="door.mp3" />
<se path="footsteps.mp3" />
```

### ボイスの再生

sayタグと組み合わせて使用：

```html
<say name="ヒロイン" voice="heroine_greeting.mp3">
  「おはようございます！」
</say>
```

または独立して再生：

```html
<voice path="heroine_greeting.mp3" />
```

## sceneConfigでBGMを設定

シーン全体のBGMは、sceneConfigで設定できます：

```javascript
const sceneConfig = {
  name: 'プロローグ',
  background: 'room.jpg',
  bgm: 'prologue_theme.mp3'  // 自動的に再生される
}
```

## 音量の制御（予定機能）

::: warning アルファ版の制限
音量制御機能は、現在のバージョンでは未実装です。v0.3.0以降で実装予定です。
:::

将来的には、以下のように音量を制御できるようになります：

```html
<!-- 音量を設定 -->
<sound name="bgm_main" volume="0.5" />

<!-- 音量を変更 -->
<sound name="bgm_main" setVolume="0.3" />

<!-- 音量を取得 -->
<sound name="bgm_main" getVolume />
```

## リソース定義を使用

`config.js` でリソースを定義している場合、名前で参照できます：

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
<bgm name="main_theme" />
<se name="door" />
<voice name="heroine_greeting" />
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
<sound name="prologue_theme" stop />

<!-- 新しいBGMを再生 -->
<bgm path="tense_theme.mp3" name="tense" />
```

### 効果音の使用

```html
<text>ドアをノックした。</text>
<se path="knock.mp3" />

<text>ドアが開いた。</text>
<se path="door_open.mp3" />

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
<bgm path="battle.mp3" name="battle_bgm" />

<text>戦闘が始まった！</text>

<!-- 戦闘処理... -->

<text>敵を倒した！</text>

<!-- 戦闘BGMを停止 -->
<sound name="battle_bgm" stop />

<!-- 通常BGMに戻す -->
<bgm path="main_theme.mp3" name="main_bgm" />
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

## トラブルシューティング

### 音声が再生されない

1. ファイルパスが正しいか確認
2. ファイル形式が対応しているか確認
3. ブラウザのコンソールでエラーを確認
4. ブラウザの自動再生ポリシーを確認

### ループ再生されない

BGMは自動的にループ再生されますが、設定が正しいか確認してください。

### 音量が大きすぎる/小さすぎる

音声ファイル自体の音量を調整するか、将来実装される音量制御機能を使用してください。

## 関連タグ

- [say](/api/tags/say) - キャラクターのセリフ（ボイス付き）

## 次のステップ

- [テキスト表示](/api/text) - テキスト関連の機能
- [画像表示](/api/image) - 画像操作の機能
- [制御構文](/api/control) - 条件分岐とジャンプ
