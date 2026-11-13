import { buildDialogPrompt, dialogActionLabel } from './dialogContent'

// Core.expandVariable と同じく {{式}} を置き換える（式は vars のキーだけ）
const makeExpand = (vars: Record<string, any>) => (text: any) =>
  typeof text !== 'string' ? text : text.replace(/{{([^{}]+)}}/g, (_m, key) => String(vars[key.trim()]))

describe('buildDialogPrompt', () => {
  test('文字列のプロンプトは変数を展開する', () => {
    const html = buildDialogPrompt(['所持金 {{gold}}'], makeExpand({ gold: 100 }))
    expect(html).toBe('所持金 100')
  })

  test('<text> で包んだプロンプトが [object Object] にならず、1 行ずつ表示される', () => {
    const content = [
      { type: 'text', content: ['このアイテムを購入しますか？'] },
      { type: 'text', content: ['価格: {{itemPrice}}円'] },
    ]
    const html = buildDialogPrompt(content, makeExpand({ itemPrice: 300 }))
    expect(html).not.toContain('[object Object]')
    expect(html).toBe(
      '<div class="dialog-prompt-line">このアイテムを購入しますか？</div>\n' +
        '<div class="dialog-prompt-line">価格: 300円</div>',
    )
  })

  test('入れ子のタグや中身の無いタグがあっても文字だけをつなぐ', () => {
    const content = [{ type: 'text', content: ['A', { type: 'span', content: ['B'] }, { type: 'br' }, 'C'] }]
    expect(buildDialogPrompt(content, makeExpand({}))).toBe('<div class="dialog-prompt-line">ABC</div>')
  })
})

describe('dialogActionLabel', () => {
  test('ボタンの文字を展開しても、元の action は書き換えない', () => {
    const action = { id: 'buy', label: '残り {{stock}} 個', content: [] }
    expect(dialogActionLabel(action, makeExpand({ stock: 3 }))).toBe('残り 3 個')
    expect(action.label).toBe('残り {{stock}} 個')
  })

  test('同じダイアログを開き直すと、そのときの値で文字が作り直される', () => {
    const action = { id: 'buy', label: '残り {{stock}} 個', content: [] }
    const vars = { stock: 3 }
    const expand = makeExpand(vars)
    expect(dialogActionLabel(action, expand)).toBe('残り 3 個')
    vars.stock = 2
    expect(dialogActionLabel(action, expand)).toBe('残り 2 個')
  })
})
