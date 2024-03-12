let index = 0
export const sceneConfig = {
  name: 'title',
  background: './resource/background/back.jpg',
  // template: './screen/title.html'
}
export const scenario = [
 { 
  type: 'choice',
  prompt: '誰を呼び出しますか？',
  items: [
    {
      id:1,
      label: 'ずんだもん',
      onSelect:[
        {
          type: 'show',
          path: './resource/character/01_zundamon/01_zundamon.png',
          pos: {
            x: 1280 / 2 - 350 / 2,
            y: 0
          },
          size: {
            width: 350,
            height: 700
          },
        },
        {
          type: 'text',
          msg: 'ずんだもんを呼び出しました。'
        },
        {
          type: 'text',
          msg: 'ずんだもんなのだ！'
        },
        {
          type: 'text',
          msg: '初見は帰れなのだ！'
        },
      ],
      src: {
        default: './resource/system/systemPicture/02_button/button.png',
        hover: './resource/system/systemPicture/02_button/button2.png',
        select: './resource/system/systemPicture/02_button/button3.png'
      }, 
    },
    {
      id:2,
      label: '春日部つむぎ',
      onSelect:[
        {
          type: 'show',
          path: './resource/character/02_kasukabeTsumugi/02_kasukabeTsumugi.png',
          pos: {
            x: 1280 / 2 - 350 / 2,
            y: 0
          },
          size: {
            width: 350,
            height: 700
          },
        },
        {
          type: 'text',
          msg: '春日部つむぎを呼び出しました。'
        },
        {
          type: 'text',
          msg: 'こんにちは！あーしは春日部つむぎだよ！'
        }
      ],
      src: {
        default: './resource/system/systemPicture/02_button/button.png',
        hover: './resource/system/systemPicture/02_button/button2.png',
        select: './resource/system/systemPicture/02_button/button3.png'
      }, 
    }
  ]
  },
  {
    type: 'jump',
    index: 0
  }
]
