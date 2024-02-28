let index = 0
export const sceneConfig = {
  background: 'back.jpg'
}
export const scenario = [{ type: 'text', msg: '夏の陽気が残る９月の初旬' }, { type: 'text', msg: '俺は彼女に呼ばれて、屋上にいた' }]
// 他のロジック
export const skipScenario = () => {
  index = 1
}
