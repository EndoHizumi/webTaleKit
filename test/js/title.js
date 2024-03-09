let index = 0
export const sceneConfig = {
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
      jump: 1,
      src: {
        default: './resource/system/systemPicture/02_button/button.png',
        hover: './resource/system/systemPicture/02_button/button2.png',
        select: './resource/system/systemPicture/02_button/button3.png'
      }, 
    }
  ]
  },
  {
    type: 'show',
    path: './resource/character/01_zundamon/01_zundamon.png',
    pos: {
      x: 0,
      y: 0
    },
    size: {
      width: 696,
      height: 720
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
  }
]
