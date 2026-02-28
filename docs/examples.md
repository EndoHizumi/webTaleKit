# サンプル集

webTaleKitを使った実践的なサンプルコードを紹介します。

## 基本的な会話シーン

キャラクターの会話を表示する基本的なシーンです。

```html
<scene>
  <scenario>
    <say name="燈火">「先輩、別れてください」</say>
    <say name="智樹">「え、ごめん。今···なんて」</say>
    <say name="燈火">「聞こえていたはずです。別れてほしいんです」</say>
    <say name="智樹">「···なんで、急に」</say>
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

## 選択肢と分岐

プレイヤーに選択肢を提示し、ストーリーを分岐させるシーンです。

```html
<scene>
  <scenario>
    <say name="燈火">「先輩、別れてください」</say>

    <choice prompt="どう答えますか？">
      <item label="理由を聞く">
        <say name="智樹">「···なんで、急に」</say>
        <say name="燈火">「理由は、言えません」</say>
      </item>
      <item label="承諾する">
        <say name="智樹">「···わかった」</say>
        <jump index="10" />
      </item>
      <item label="拒否する">
        <say name="智樹">「嫌だ。理由を教えてくれるまで別れない」</say>
      </item>
    </choice>

    <say name="燈火">「···先輩」</say>
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

## キャラクター表示とアニメーション

キャラクターを表示し、移動させるシーンです。

```html
<scene>
  <scenario>
    <say name="ナレーター">放課後の教室。二人は向かい合っていた。</say>

    <!-- キャラクターを左右に配置 -->
    <show src="./src/resource/chara/hero.png" name="hero" pos="left:middle" />
    <show src="./src/resource/chara/heroine.png" name="heroine" pos="right:middle" transition="fade" />

    <say name="ヒーロー">「やあ、今日も一緒に帰ろうか」</say>
    <say name="ヒロイン">「うん、待ってたよ！」</say>

    <!-- キャラクターを中央に移動 -->
    <moveTo name="hero" x="400" y="300" duration="1" />
    <say name="ヒーロー">「大切な話があるんだ」</say>

    <!-- キャラクターを非表示 -->
    <hide name="heroine" transition="fade" />
    <say name="ナレーター">ヒロインの表情が、少し曇った。</say>
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

## 条件分岐（ifグローバル属性）

変数の値によって表示内容を変えるシーンです。

```html
<scene>
  <scenario>
    <text>部屋を調べると、古い日記が見つかった。</text>

    <!-- hasReadDiary が true の場合のみ表示 -->
    <text if="hasReadDiary">すでに読んだことのある日記だ。</text>
    <text if="!hasReadDiary">初めて見る日記だ。読んでみよう。</text>

    <choice prompt="日記をどうしますか？">
      <item label="読む" if="!hasReadDiary">
        <text>日記には、悲しい過去が綴られていた。</text>
        <call func="setHasReadDiary(true)" />
      </item>
      <item label="もう一度読む" if="hasReadDiary">
        <text>あの日の記憶が、また蘇ってきた。</text>
      </item>
      <item label="置いておく">
        <text>日記をそっと元の場所に戻した。</text>
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

## 音声の再生

BGMと効果音を使うシーンです。

```html
<scene>
  <scenario>
    <text>嵐の夜、一人の旅人が古い宿に辿り着いた。</text>

    <!-- 効果音を再生 -->
    <sound src="./src/resource/se/door_knock.mp3" mode="se" />
    <say name="宿の主人">「いらっしゃいませ。今夜は荒れそうですね」</say>

    <!-- BGMを変更 -->
    <sound src="./src/resource/bgm/calm_inn.mp3" mode="bgm" />
    <say name="旅人">「一晩泊めていただけますか」</say>
    <say name="宿の主人">「もちろん。お部屋にご案内しますよ」</say>

    <!-- 効果音を再生（BGMは継続） -->
    <sound src="./src/resource/se/footsteps.mp3" mode="se" />
    <text>二人は廊下を歩き始めた。</text>
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

## ボイス付きセリフ

キャラクターのセリフにボイスを付けるシーンです。

```html
<scene>
  <scenario>
    <say name="ヒロイン" voice="./src/resource/voice/heroine_01.mp3">
      「おはようございます、先輩！」
    </say>

    <say name="ヒロイン" voice="./src/resource/voice/heroine_02.mp3">
      「今日も一緒に登校できて嬉しいです」
    </say>

    <say name="主人公">「おはよう。今日も元気だね」</say>

    <say name="ヒロイン" voice="./src/resource/voice/heroine_03.mp3">
      「先輩といる時間は、特別なんです」
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

## シーン遷移

別のシーンへ移動するシーンです。

```html
<scene>
  <scenario>
    <text>第一章：出会い</text>
    <say name="ナレーター">この物語は、ある春の日から始まる。</say>

    <choice prompt="物語を進めますか？">
      <item label="はい、続ける">
        <!-- 次のシーンへ遷移 -->
        <route to="chapter1_scene1" />
      </item>
      <item label="タイトルに戻る">
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

## セーブ・ロード

ゲームの進行状況を保存・読み込みするシーンです。

```html
<scene>
  <scenario>
    <say name="ナレーター">重要な場面に差し掛かった。</say>

    <choice prompt="どうしますか？">
      <item label="セーブして続ける">
        <save slot="1" />
        <say name="ナレーター">ゲームをセーブしました。</say>
      </item>
      <item label="ロードする">
        <load slot="1" />
      </item>
      <item label="そのまま続ける">
        <say name="ナレーター">物語を続けます。</say>
      </item>
    </choice>

    <text>いよいよ、決断の時が来た。</text>
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

## 変数を使った動的テキスト

Mustache記法で変数をテキストに埋め込むシーンです。

```html
<scene>
  <scenario>
    <text>{{playerName}}は{{location}}に到着した。</text>
    <text>所持金：{{money}}円</text>
    <text if="money >= 1000">これだけあれば、宿代は払えそうだ。</text>
    <text if="money < 1000">宿代が払えるか不安だ。</text>

    <choice prompt="どうしますか？">
      <item label="宿に泊まる" if="money >= 500">
        <call func="spendMoney(500)" />
        <text>{{playerName}}は宿に泊まることにした。</text>
        <text>残金：{{money}}円</text>
      </item>
      <item label="野宿する">
        <text>{{playerName}}は野宿を選んだ。</text>
      </item>
    </choice>
  </scenario>

  <script>
    export const sceneConfig = {
      name: 'town',
      background: './src/resource/background/town.jpg',
      template: './src/screen/default.html'
    }

    const playerName = '勇者';
    const location = '旅の町';
    let money = 800;

    export function spendMoney(amount) {
      money -= amount;
    }
  </script>
</scene>
```

## 関連リンク

- [タグリファレンス](/tags/) - 各タグの詳細な仕様
- [ガイド](/guide/getting-started) - はじめての方はこちら
- [APIリファレンス](/api/overview) - API詳細
