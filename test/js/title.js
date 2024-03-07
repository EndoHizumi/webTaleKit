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
      jump: 2,
      src: {
        default: './resource/system/systemPicture/02_button/button.png',
        hover: './resource/system/systemPicture/02_button/button2.png',
        select: './resource/system/systemPicture/02_button/button3.png'
      }, 
    }
  ]
  },
]
