let index = 0
export const sceneConfig = {
  background: 'back.jpg',
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
  {
    type: 'text',
    msg: '言われた意味が分からなかった。',
    wait: false,
    clear: false,
  },
  { type: 'text', msg: '理解したくなかった。', clear: false },
  { type: 'text', msg: '「最初から好きじゃなかったんです･･･」' },
  { type: 'text', msg: '「そんな･･･そんなこと･･･」' },
  {
    type: 'text',
    msg: '視界が揺らぎ、自分が立っているのか分からなくなる。\n額からはイヤな汗が首筋を伝わり落ちる。\nこれは夢だとそうも思いたかった。目が覚めて、授業中に寝てしまって、みんなで昼飯をとって、そんないつも通りに生活があるんだと。\nだが、そんな都合のいい現実は有るはずがないのだ。\nそして、すれ違い瞬間、最後の言葉が俺の耳に届いた。',
    wait: 1000,
  },
  { type: 'text', msg: '「さよなら･･･」' },
  {
    type: 'choice',
    id: 1,
    prompt: 'どうする？',
    items: [
      {
        id: 1,
        onSelect: () => {
          alert('泣くを選択しました')
        },
        label: '泣く',
      },
      {
        id: 2,
        onSelect: () => {
          alert('泣かないを選択しました')
        },
        label: '泣かない',
      },
    ],
  },
  {
    type: 'choice',
    id: 2,
    prompt: 'ほんとに？',
    items: [
      {
        id: 1,
        onSelect: () => {
          alert('はいを選択しました')
        },
        label: 'はい',
        color: {
          default: 'white',
          hover: 'black',
          select: 'white'
        }
      },
      {
        id: 2,
        onSelect: () => {
          alert('やっぱやめとくを選択しました')
        },
        label: 'やっぱやめとく',
        color: {
          default: 'white',
          hover: 'black',
          select: 'white'
        }
      },
    ],
    src: {
      default: './MessageFrame_037_03_v100/03_button/btn_select_normal.png',
      hover: './MessageFrame_037_03_v100/03_button/btn_select_hover.png',
      select: './MessageFrame_037_03_v100/03_button/btn_select_click.png',
    }
  },
  {
    type: 'choice',
    id: 3,
    prompt: 'テスト',
    items: [
      {
        id: 1,
        onSelect: () => {
          alert('テスト1を選択しました')
        },
        label: 'テスト1'
      },
      {
        id: 2,
        onSelect: () => {
          alert('テスト2を選択しました')
        },
        label: 'テスト2'
      },
      {
        id: 3,
        onSelect: () => {
          alert('テスト3を選択しました')
        },
        label: 'テスト3'
      },
      {
        id: 4,
        onSelect: () => {
          alert('テスト4を選択しました')
        },
        label: 'テスト4'
      },
      {
        id: 5,
        onSelect: () => {
          alert('テスト5を選択しました')
        },
        label: 'テスト5'
      },
      {
        id: 6,
        onSelect: () => {
          alert('テスト6を選択しました')
        },
        label: 'テスト6'
      }
    ]
  }
]
// 他のロジック
export const skipScenario = () => {
  index = 1
}
