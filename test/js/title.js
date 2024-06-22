export let index = 0
export const sceneConfig = {
  name: 'title',
  background: './resource/background/back.jpg',
  template: './screen/title.html',
  bgm: './resource/bgm/maou_game_village05.mp3',
}
export const scenario = [
  {
    msg: 'タップでスタート',
  },
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
    items: [
      {
        id: 1,
        label: 'ずんだもん',
        onSelect: [
          {
            type: 'show',
            path: './resource/character/01_zundamon/01_zundamon.png',
            pos: {
              x: 500,
              y: 0,
            },
            size: {
              width: 350,
              height: 700,
            },
          },
          {
            type: 'text',
            msg: 'ずんだもんを呼び出しました。',
          },
          {
            type: 'show',
            name: '01_zundamon.png',
            path: './resource/character/01_zundamon/02_zundamon.png',
            pos: {
              x: 500,
              y: 0,
            },
            size: {
              width: 350,
              height: 700,
            },
          },
          {
            type: 'say',
            name: 'ずんだもん',
            text: { msg: 'ずんだもんなのだ！' },
            voice: {
              path: './resource/voice/01_zundamon.wav',
              play: null,
            },
          },
          {
            type: 'choice',
            prompt: 'どっちを言ってほしいのだ？',
            items: [
              {
                id: 1,
                label: 'ずんだもんなのだ！',
                onSelect: [
                  {
                    type: 'text',
                    msg: 'ずんだもんなのだ！',
                  },
                ],
                src: {
                  default:
                    './resource/system/systemPicture/02_button/button.png',
                  hover:
                    './resource/system/systemPicture/02_button/button2.png',
                  select:
                    './resource/system/systemPicture/02_button/button3.png',
                },
              },
              {
                id: 2,
                label: 'ずんだもんだよ！',
                onSelect: [
                  {
                    type: 'text',
                    msg: 'ずんだもんだよ！',
                  },
                ],
                src: {
                  default:
                    './resource/system/systemPicture/02_button/button.png',
                  hover:
                    './resource/system/systemPicture/02_button/button2.png',
                  select:
                    './resource/system/systemPicture/02_button/button3.png',
                },
              },
            ],
          },
        ],
        src: {
          default: './resource/system/systemPicture/02_button/button.png',
          hover: './resource/system/systemPicture/02_button/button2.png',
          select: './resource/system/systemPicture/02_button/button3.png',
        },
      },
      {
        id: 2,
        label: '春日部つむぎ',
        onSelect: [
          {
            type: 'show',
            path: './resource/character/02_kasukabeTsumugi/01_kasukabeTsumugi.png',
            pos: {
              x: 1280 / 2 - 350 / 2,
              y: 0,
            },
            size: {
              width: 350,
              height: 700,
            },
          },
          {
            type: 'text',
            msg: '春日部つむぎを呼び出しました。',
          },
          {
            type: 'show',
            path: './resource/character/02_kasukabeTsumugi/02_kasukabeTsumugi.png',
            pos: {
              x: 1280 / 2 - 350 / 2,
              y: 0,
            },
            size: {
              width: 350,
              height: 700,
            },
          },
          {
            type: 'text',
            msg: 'こんにちは！あーしは春日部つむぎだよ！',
          },
        ],
        src: {
          default: './resource/system/systemPicture/02_button/button.png',
          hover: './resource/system/systemPicture/02_button/button2.png',
          select: './resource/system/systemPicture/02_button/button3.png',
        },
      },
    ],
  },
  {
    type: 'choice',
    prompt: '誰を消しますか？',
    items: [
      {
        id: 1,
        label: 'ずんだもん',
        onSelect: [
          {
            type: 'show',
            name: '01_zundamon.png',
            path: './resource/character/01_zundamon/02_zundamon.png',
            mono: 100,
            pos: {
              x: 500,
              y: 0,
            },
            size: {
              width: 350,
              height: 700,
            },
          },
          {
            type: 'say',
            name: 'ずんだもん',
            text: { msg: '諸行無常なのだ' },
          },
          {
            type: 'hide',
            name: '01_zundamon.png',
          },
          {
            type: 'text',
            msg: 'ずんだもんを消しました。',
          },
        ],
        src: {
          default: './resource/system/systemPicture/02_button/button.png',
          hover: './resource/system/systemPicture/02_button/button2.png',
          select: './resource/system/systemPicture/02_button/button3.png',
        },
      },
      {
        id: 2,
        label: '春日部つむぎ',
        onSelect: [
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
            msg: '春日部つむぎを消しました。',
          },
        ],
        src: {
          default: './resource/system/systemPicture/02_button/button.png',
          hover: './resource/system/systemPicture/02_button/button2.png',
          select: './resource/system/systemPicture/02_button/button3.png',
        },
      },
    ],
  },
  {
    type: 'if',
    condition: 'index==1',
    then: [
      {
        type: 'text',
        msg: 'indexは{{index}}だよ！',
      },
    ],
    else: [
      {
        type: 'text',
        msg: 'indexは{{index}}だよ！',
      },
    ],
  },
  {
    type: 'text',
    msg: 'アニメーションのテスト',
  },
  {
    type: 'show',
    name: '01_zundamon.png',
    path: './resource/character/01_zundamon/02_zundamon.png',
    pos: {
      x: 500,
      y: 0,
    },
    size: {
      width: 350,
      height: 700,
    },
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
    type: 'jump',
    index: 3,
  },
]
export const executeCode = (code) => {
  try {
    console.log(code)
    return eval(code)
  } catch (error) {
    throw error
  }
}
