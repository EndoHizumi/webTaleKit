import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'webTaleKit',
  description: 'TypeScriptベースのビジュアルノベルゲームエンジン',
  base: '/webTaleKit/',
  ignoreDeadLinks: true,

  locales: {
    root: {
      label: '日本語',
      lang: 'ja-JP',
      themeConfig: {
        nav: [
          { text: 'ホーム', link: '/' },
          { text: 'ガイド', link: '/guide/getting-started' },
          { text: 'API', link: '/api/overview' },
          { text: 'タグ', link: '/tags/' },
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
            }
          ],
          '/tags/': [
            {
              text: 'タグリファレンス',
              items: [
                { text: '概要', link: '/tags/' }
              ]
            },
            {
              text: 'テキスト・セリフ',
              items: [
                { text: 'text', link: '/tags/text' },
                { text: 'say', link: '/tags/say' }
              ]
            },
            {
              text: '画像操作',
              items: [
                { text: 'show', link: '/tags/show' },
                { text: 'hide', link: '/tags/hide' },
                { text: 'moveTo', link: '/tags/moveto' }
              ]
            },
            {
              text: '音声',
              items: [
                { text: 'sound', link: '/tags/sound' }
              ]
            },
            {
              text: '選択肢・ダイアログ',
              items: [
                { text: 'choice', link: '/tags/choice' },
                { text: 'dialog', link: '/tags/dialog' }
              ]
            },
            {
              text: '制御構文',
              items: [
                { text: 'jump', link: '/tags/jump' },
                { text: 'if', link: '/tags/if' },
                { text: 'route', link: '/tags/route' },
                { text: 'call', link: '/tags/call' }
              ]
            },
            {
              text: 'セーブ・ロード',
              items: [
                { text: 'save', link: '/tags/save' },
                { text: 'load', link: '/tags/load' }
              ]
            }
          ]
        }
      }
    },
    en: {
      label: 'English',
      lang: 'en-US',
      themeConfig: {
        nav: [
          { text: 'Home', link: '/en/' },
          { text: 'Guide', link: '/en/guide/getting-started' },
          { text: 'API', link: '/en/api/overview' },
          { text: 'Tags', link: '/en/tags/' },
          { text: 'GitHub', link: 'https://github.com/EndoHizumi/webTaleKit' }
        ],
        sidebar: {
          '/en/guide/': [
            {
              text: 'Introduction',
              items: [
                { text: 'What is webTaleKit', link: '/en/guide/introduction' },
                { text: 'Quick Start', link: '/en/guide/getting-started' },
                { text: 'Project Setup', link: '/en/guide/project-setup' }
              ]
            },
            {
              text: 'Core Concepts',
              items: [
                { text: 'Project Structure', link: '/en/guide/project-structure' },
                { text: 'Scene Files', link: '/en/guide/scene-files' },
                { text: 'UI Creation', link: '/en/guide/ui-creation' }
              ]
            },
            {
              text: 'Tutorial',
              items: [
                { text: 'Replacing Images', link: '/en/guide/tutorial-images' },
                { text: 'Editing Scenarios', link: '/en/guide/tutorial-scenario' },
                { text: 'Adding Choices', link: '/en/guide/tutorial-choices' }
              ]
            }
          ],
          '/en/api/': [
            {
              text: 'API Reference',
              items: [
                { text: 'Overview', link: '/en/api/overview' },
                { text: 'Text Display', link: '/en/api/text' },
                { text: 'Image Display', link: '/en/api/image' },
                { text: 'Audio', link: '/en/api/sound' },
                { text: 'Choices', link: '/en/api/choice' },
                { text: 'Control Flow', link: '/en/api/control' }
              ]
            }
          ],
          '/en/tags/': [
            {
              text: 'Tag Reference',
              items: [
                { text: 'Overview', link: '/en/tags/' }
              ]
            },
            {
              text: 'Text & Dialogue',
              items: [
                { text: 'text', link: '/en/tags/text' },
                { text: 'say', link: '/en/tags/say' }
              ]
            },
            {
              text: 'Image Operations',
              items: [
                { text: 'show', link: '/en/tags/show' },
                { text: 'hide', link: '/en/tags/hide' },
                { text: 'moveTo', link: '/en/tags/moveto' }
              ]
            },
            {
              text: 'Audio',
              items: [
                { text: 'sound', link: '/en/tags/sound' }
              ]
            },
            {
              text: 'Choices & Dialogs',
              items: [
                { text: 'choice', link: '/en/tags/choice' },
                { text: 'dialog', link: '/en/tags/dialog' }
              ]
            },
            {
              text: 'Control Flow',
              items: [
                { text: 'jump', link: '/en/tags/jump' },
                { text: 'if', link: '/en/tags/if' },
                { text: 'route', link: '/en/tags/route' },
                { text: 'call', link: '/en/tags/call' }
              ]
            },
            {
              text: 'Save & Load',
              items: [
                { text: 'save', link: '/en/tags/save' },
                { text: 'load', link: '/en/tags/load' }
              ]
            }
          ]
        }
      }
    }
  },

  themeConfig: {
    logo: '/logo.jpg',
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
