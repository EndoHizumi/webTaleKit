let index = 0
export const sceneConfig = {
  name: 'title',
  background: './resource/background/back.jpg',
  template: './screen/title.html',
  bgm: './resource/bgm/maou_game_village05.mp3'
}
export const scenario = [
  {
    msg: 'タップでスタート',
  },
  {
    type: 'newpage',
  },
  {
    type:'sound',
    path: './resource/bgm/maou_game_village05.mp3',
    play: null,
    loop: null
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
            msg: 'ずんだもんを呼び出しました。',
          },
          {
            type: 'show',
            name: '01_zundamon.png',
            path: './resource/character/01_zundamon/02_zundamon.png',
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
            type: 'say',
            name: 'ずんだもん',
            text:{ msg: 'ずんだもんなのだ！' },
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
    position: 'manual',
    items: [
      {
        id: 1,
        label: 'ずんだもん',
        onSelect: [
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
        position: {
          x:0,
          y:0
        }
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
        position: {
          x:500,
          y:0
        }
      },
    ],
  },
  {
    type: 'jump',
    index: 1,
  },
]
