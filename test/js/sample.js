export const sceneConfig = { background: './resource/background/sample.jpg' }
export const scenario = [
  {
    type: 'choice',
    content: [
      {
        type: 'item',
        content: [
          {
            type: 'jump',
            index: '1',
          },
        ],
        label: 'はい',
      },
      {
        type: 'item',
        label: 'いいえ',
      },
    ],
    prompt: 'プロローグをスキップしますか？',
  },
  '夏の陽気が残る９月の初旬',
  {
    type: 'say',
    content: ['「先輩、別れてください」'],
    name: '燈火',
  },
  {
    type: 'say',
    content: ['「え、ごめん。今･･･なんて」'],
    name: '智樹',
  },
  '聞き取れなかったわけじゃない。 言われた意味が分からなかった。 理解したくなかった。',
  {
    type: 'say',
    content: ['「最初から好きじゃなかったんです･･･」'],
    name: '燈火',
  },
  {
    type: 'say',
    content: ['「「そんな･･･そんなこと･･･」'],
    name: '智樹',
  },
  {
    type: 'text',
    content: [
      '視界が揺らぎ、自分が立っているのか分からなくなる。',
      '額からはイヤな汗が首筋を伝わり落ちる。',
      'これは夢だとそうも思いたかった。',
      '目が覚めて、授業中に寝てしまって、みんなで昼飯をとって、そんないつも通りに生活があるんだと。',
      'だが、そんな都合のいい現実は有るはずがないのだ。',
      'そして、すれ違い瞬間、最後の言葉が俺の耳に届いた。',
    ],
  },
  {
    type: 'say',
    content: ['「さよなら･･･」'],
    name: '燈火',
  },
]
