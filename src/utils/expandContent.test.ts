import { expandContent } from './expandContent'

describe('expandContent', () => {
  it('文字列の {{…}} を展開し、入れ物の形は変えない', () => {
    const expand = (t: string) => t.replace('{{name}}', 'シオン')
    const content = ['{{name}}「いらっしゃい」', { type: 'br' }, { type: 'em', content: ['{{name}}です'] }]
    expect(expandContent(content, expand)).toEqual([
      'シオン「いらっしゃい」',
      { type: 'br' },
      { type: 'em', content: ['シオンです'] },
    ])
  })

  it('展開の関数は、文字列 1 つにつき 1 回だけ呼ぶ', () => {
    const expand = jest.fn((t: string) => t)
    expandContent(['一つ目', { type: 'em', content: ['二つ目'] }], expand)
    expect(expand).toHaveBeenCalledTimes(2)
  })

  it('展開に失敗した文字列は、そのまま残す', () => {
    const expand = (t: string) => {
      if (t.includes('{{')) throw new Error('boom')
      return t
    }
    expect(expandContent(['{{broken}}', '素の文'], expand)).toEqual(['{{broken}}', '素の文'])
  })

  it('展開の関数が無ければ、何もしない', () => {
    const content = ['{{name}}']
    expect(expandContent(content)).toBe(content)
  })
})
