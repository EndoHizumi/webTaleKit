export let index = 0
export const sceneConfig = {
  name: 'title',
  background: './resource/background/back.jpg',
  template: './screen/title.html',
  bgm: './resource/bgm/maou_game_village05.mp3',
}
export function returnConfig() {
  return sceneConfig
}
export const scenario = [
  'タップでスタート',
  {
    type: 'sound',
    path: './resource/bgm/maou_game_village05.mp3',
    play: null,
    loop: null,
  },
  {
    type: 'newpage',
  },
  {
    type: 'choice',
    prompt: '誰を呼び出しますか？',
    position: 'auto',
    content: [
      {
        id: 1,
        label: 'ずんだもん',
        content: [
          {
            type: 'show',
            path: './resource/character/01_zundamon/01_zundamon.png',
            x: 500,
            y: 0,
            width: 350,
            height: 700,
          },
          {
            type: 'text',
            content: ['ずんだもんを呼び出しました。'],
          },
          {
            type: 'show',
            name: '01_zundamon.png',
            path: './resource/character/01_zundamon/02_zundamon.png',
            x: 500,
            y: 0,
            width: 350,
            height: 700,
          },
          {
            type: 'say',
            name: 'ずんだもん',
            content: ['ずんだもんなのだ！'],
            voice: './resource/voice/01_zundamon.wav',
          },
          {
            type: 'choice',
            prompt: 'どっちを言ってほしいのだ？',
            content: [
              {
                type: 'item',
                id: 1,
                label: 'ずんだもんなのだ！',
                content: [
                  {
                    type: 'text',
                    content: ['ずんだもんなのだ！'],
                  },
                ],
                default: './resource/system/systemPicture/02_button/button.png',
                hover: './resource/system/systemPicture/02_button/button2.png',
                select: './resource/system/systemPicture/02_button/button3.png',
              },
              {
                type: 'item',
                id: 2,
                label: 'ずんだもんだよ！',
                content: [
                  {
                    type: 'text',
                    content: ['ずんだもんだよ！'],
                  },
                ],
                default: './resource/system/systemPicture/02_button/button.png',
                hover: './resource/system/systemPicture/02_button/button2.png',
                select: './resource/system/systemPicture/02_button/button3.png',
              },
            ],
          },
        ],
        default: './resource/system/systemPicture/02_button/button.png',
        hover: './resource/system/systemPicture/02_button/button2.png',
        select: './resource/system/systemPicture/02_button/button3.png',
      },
      {
        id: 2,
        label: '春日部つむぎ',
        content: [
          {
            type: 'show',
            path: './resource/character/02_kasukabeTsumugi/01_kasukabeTsumugi.png',
            x: 1280 / 2 - 350 / 2,
            y: 0,
            width: 350,
            height: 700,
          },
          {
            type: 'text',
            content: ['春日部つむぎを呼び出しました。'],
          },
          {
            type: 'show',
            path: './resource/character/02_kasukabeTsumugi/02_kasukabeTsumugi.png',
            x: 1280 / 2 - 350 / 2,
            y: 0,
            width: 350,
            height: 700,
          },
          {
            type: 'text',
            content: ['こんにちは！あーしは春日部つむぎだよ！'],
          },
        ],
        default: './resource/system/systemPicture/02_button/button.png',
        hover: './resource/system/systemPicture/02_button/button2.png',
        select: './resource/system/systemPicture/02_button/button3.png',
      },
    ],
  },
  {
    type: 'choice',
    prompt: '誰を消しますか？',
    content: [
      {
        type: 'item',
        id: 1,
        label: 'ずんだもん',
        content: [
          {
            type: 'show',
            name: '01_zundamon.png',
            path: './resource/character/01_zundamon/02_zundamon.png',
            mono: 100,
            x: 500,
            y: 0,
            width: 350,
            height: 700,
          },
          {
            type: 'say',
            name: 'ずんだもん',
            content: ['諸行無常なのだ'],
          },
          {
            type: 'hide',
            name: '01_zundamon.png',
          },
          {
            type: 'text',
            content: ['ずんだもんを消しました。'],
          },
        ],
        default: './resource/system/systemPicture/02_button/button.png',
        hover: './resource/system/systemPicture/02_button/button2.png',
        select: './resource/system/systemPicture/02_button/button3.png',
      },
      {
        id: 2,
        label: '春日部つむぎ',
        content: [
          {
            type: 'hide',
            name: '01_kasukabeTsumugi.png',
          },
          {
            type: 'hide',
            name: '02_kasukabeTsumugi.png',
          },
          {
            type: 'text',
            content: ['春日部つむぎを消しました。'],
          },
        ],
        default: './resource/system/systemPicture/02_button/button.png',
        hover: './resource/system/systemPicture/02_button/button2.png',
        select: './resource/system/systemPicture/02_button/button3.png',
      },
    ],
  },
  {
    type: 'text',
    content: ['アニメーションのテスト'],
  },
  {
    type: 'show',
    name: '01_zundamon.png',
    path: './resource/character/01_zundamon/02_zundamon.png',
    x: 500,
    y: 0,
    width: 350,
    height: 700,
  },
  {
    type: 'moveTo',
    x: 0,
    y: -150,
    name: '01_zundamon.png',
    duration: 0.000001,
  },
  {
    type: 'moveTo',
    x: 0,
    y: 150,
    name: '01_zundamon.png',
    duration: 0.000001,
  },
  {
    type: 'moveTo',
    x: 500,
    y: 0,
    name: '01_zundamon.png',
    duration: 0.1,
  },
  {
    type: 'moveTo',
    x: -500,
    y: 2.5,
    name: '01_zundamon.png',
    duration: 0.1,
  },
  {
    type: 'text',
    content: ['アニメーションのテスト終了'],
  },
  {
    type: 'text',
    content: ['変数展開のテスト'],
  },
  {
    type: 'if',
    condition: 'index==1',
    content: [
      {
        type: 'then',
        content: [
          {
            type: 'text',
            content: ['indexは{{index}}だよ！'],
          },
        ],
      },
      {
        type: 'else',
        content: [
          {
            type: 'text',
            content: ['indexは１じゃなくて、{{index}}だったよ！'],
          },
        ],
      },
    ],
  },
  {
    type: 'if',
    condition: 'index==0',
    content: [
      {
        type: 'then',
        content: [
          {
            type: 'text',
            content: ['indexは{{index}}だよ！'],
          },
        ],
      },
      {
        type: 'else',
        content: [
          {
            type: 'text',
            content: ['indexは１じゃなくて、{{index}}だったよ！'],
          },
        ],
      },
    ],
  },
  {
    type: 'text',
    content: ['このシーンの設定は{{returnConfig()}}だよ！'],
  },
  {
    type: 'text',
    content: ['変数展開のテスト終了'],
  },
  { type: 'newpage' },
  {
    type: 'text',
    content: ['scene切り替えのテスト'],
  },
  {
    type: 'route',
    to: 'sample',
  },
]
