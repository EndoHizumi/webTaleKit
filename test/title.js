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
  { type: 'text', msg: '理解したくなかった。', clear: false },
  { type: 'text', msg: '「最初から好きじゃなかったんです･･･」' },
  { type: 'text', msg: '「そんな･･･そんなこと･･･」' },
  { type: 'text', msg: '視界が揺らぎ、自分が立っているのか分からなくなる。\n額からはイヤな汗が首筋を伝わり落ちる。\nこれは夢だとそうも思いたかった。目が覚めて、授業中に寝てしまって、みんなで昼飯をとって、そんないつも通りに生活があるんだと。\nだが、そんな都合のいい現実は有るはずがないのだ。\nそして、すれ違い瞬間、最後の言葉が俺の耳に届いた。' },
  { type: 'text', msg: '「さよなら･･･」' }
]
// 他のロジック
export const skipScenario = () => {
  index = 1
}
