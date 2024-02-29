let index = 0
export const sceneConfig = {
  background: 'back.jpg'
}
export const scenario = [
  { type: 'text', msg: '夏の陽気が残る９月の初旬' },
  { type: 'text', msg: '俺は彼女に呼ばれて、屋上にいた' },
  { type: 'text', msg: '「燈火、久し・・・」', wait: false },
  { type: 'text', msg: '「先輩」' },
  { type: 'text', msg: '「はい」' },
  { type: 'text', msg: '「オレと別れてください」' },
  { type: 'text', msg: ' 「え、ごめん。今･･･なんて」' },
  { type: 'text', msg: ' 聞き取れなかったわけじゃない。', wait: false },
  { type: 'text', msg: '言われた意味が分からなかった。', wait: false, clear: false },
  { type: 'text', msg: '理解したくなかった。', clear: false }
]
// 他のロジック
export const skipScenario = () => {
  index = 1
}
