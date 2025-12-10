---
layout: home

hero:
  name: webTaleKit
  text: TypeScriptベースの
  tagline: ビジュアルノベルゲームエンジン
  image:
    src: /hero-logo.png
    alt: webTaleKit
  actions:
    - theme: brand
      text: はじめる
      link: /guide/getting-started
    - theme: alt
      text: デモを見る
      link: https://test-game-chi.vercel.app/

features:
  - icon: 🎨
    title: 柔軟なUI作成
    details: HTML・CSS・JavaScriptで自由にUIをデザインできます。既存のWebスキルがそのまま活用できます。
  - icon: 📝
    title: 直感的なスクリプト
    details: HTMLに似たマークアップ言語とJavaScriptでシナリオを制御。わかりやすく、パワフルです。
  - icon: 📱
    title: レスポンシブ対応
    details: 自動スケーリング機能により、様々なウインドウサイズに対応。どんなデバイスでも快適にプレイできます。
  - icon: 🤖
    title: AI連携
    details: REST API呼び出しによる生成AI連携を提供予定。新しいゲーム体験を創造できます。
  - icon: 🎮
    title: 豊富な機能
    details: キャラクター表示、選択肢、音声、画像フィルター、アニメーションなど、ノベルゲームに必要な機能を網羅。
  - icon: 🚀
    title: 簡単デプロイ
    details: Webアプリケーションとしてビルドし、簡単にオンライン公開できます。
---

## クイックスタート

```bash
# プロジェクトの作成
npm create tale-game your-game-title
cd your-game-title

# 開発サーバーの起動
npm run play
```

## サンプルコード

```html
<scenario>
  <say name="燈火">「先輩、別れてください」</say>
  <say name="智樹">「え、ごめん。今･･･なんて」</say>

  <choice prompt="プロローグをスキップしますか？">
    <item label="はい">
      <jump index="5" />
    </item>
    <item label="いいえ">
      <text>それでは物語を始めます。</text>
    </item>
  </choice>
</scenario>

<logic>
const sceneConfig = {
  background: '屋上.jpg',
  bgm: 'title_theme.mp3'
}
</logic>
```

## コミュニティ

- **Twitter**: [@endo_hizumi](https://twitter.com/endo_hizumi)
- **Trello**: [開発進捗](https://trello.com/b/qYNGh7MY)
- **フィードバック**: [Google Forms](https://forms.gle/uejQwvwAb99wcJht7)

検索ハッシュタグ: `#webTalekit`
