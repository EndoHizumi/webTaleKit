import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'webTaleKit',
  description: 'TypeScriptベースのビジュアルノベルゲームエンジン',
  lang: 'ja-JP',
  themeConfig: {
    logo: '/logo.jpg',
    nav: [
      { text: 'ホーム', link: '/' },
      { text: 'ガイド', link: '/guide/getting-started' },
      { text: 'API', link: '/api/overview' },
      { text: 'GitHub', link: 'https://github.com/EndoHizumi/webTaleKit' }
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'はじめに',
          items: [
            { text: 'webTaleKitとは', link: '/guide/introduction' },
            { text: 'クイックスタート', link: '/guide/getting-started' },
            { text: 'プロジェクト作成', link: '/guide/project-setup' }
          ]
        },
        {
          text: '基本概念',
          items: [
            { text: 'プロジェクト構造', link: '/guide/project-structure' },
            { text: 'シーンファイル', link: '/guide/scene-files' },
            { text: 'UIの作成', link: '/guide/ui-creation' }
          ]
        },
        {
          text: 'チュートリアル',
          items: [
            { text: '画像の差し替え', link: '/guide/tutorial-images' },
            { text: 'シナリオの編集', link: '/guide/tutorial-scenario' },
            { text: '選択肢の追加', link: '/guide/tutorial-choices' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API リファレンス',
          items: [
            { text: '概要', link: '/api/overview' },
            { text: 'テキスト表示', link: '/api/text' },
            { text: '画像表示', link: '/api/image' },
            { text: '音声', link: '/api/sound' },
            { text: '選択肢', link: '/api/choice' },
            { text: '制御構文', link: '/api/control' }
          ]
        },
        {
          text: 'タグリファレンス',
          items: [
            { text: 'text', link: '/api/tags/text' },
            { text: 'say', link: '/api/tags/say' },
            { text: 'show', link: '/api/tags/show' },
            { text: 'hide', link: '/api/tags/hide' },
            { text: 'choice', link: '/api/tags/choice' },
            { text: 'sound', link: '/api/tags/sound' },
            { text: 'jump', link: '/api/tags/jump' },
            { text: 'if', link: '/api/tags/if' },
            { text: 'moveTo', link: '/api/tags/moveto' },
            { text: 'route', link: '/api/tags/route' }
          ]
        }
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/EndoHizumi/webTaleKit' },
      { icon: 'twitter', link: 'https://twitter.com/endo_hizumi' }
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 EndoHizumi'
    },
    search: {
      provider: 'local'
    }
  }
})
