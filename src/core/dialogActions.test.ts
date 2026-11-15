import { isDisabledValue, renderAction } from './dialogActions'

const expand = (t: any) => (typeof t === 'string' ? t.replace(/{{(\w+)}}/g, (_m, k) => ({ gold: '70', locked: 'true', open: 'false' } as any)[k]) : t)

describe('<action> のボタンの中身', () => {
  test('image・note・badge が無ければ、今までどおり文字だけ', () => {
    expect(renderAction({ id: 'a', label: 'はい' }, expand)).toEqual({ label: 'はい', html: null, disabled: false })
  })

  test('image・note・badge があれば組み立てる。{{…}} を展開し、文字はエスケープする', () => {
    const v = renderAction({ id: 'w', label: '灰牙狼<討伐>', image: './w.jpg', note: '報酬 金貨 {{gold}}', badge: 'B' }, expand)
    expect(v.html).toBe(
      '<img class="dialog-button-image" src="./w.jpg" alt="">' +
        '<span class="dialog-button-label">灰牙狼&lt;討伐&gt;</span>' +
        '<span class="dialog-button-note">報酬 金貨 70</span>' +
        '<span class="dialog-button-badge">B</span>',
    )
  })

  test('note だけでも組み立てる（画像は無し）', () => {
    expect(renderAction({ label: 'A', note: 'n' }, expand).html).toBe('<span class="dialog-button-label">A</span><span class="dialog-button-note">n</span>')
  })

  test('disabled：展開した値で決める。属性が無ければ選べる', () => {
    expect(renderAction({ label: 'A', disabled: '{{locked}}' }, expand).disabled).toBe(true)
    expect(renderAction({ label: 'A', disabled: '{{open}}' }, expand).disabled).toBe(false)
    expect(renderAction({ label: 'A' }, expand).disabled).toBe(false)
  })
})

describe('isDisabledValue', () => {
  test('false・0・null・undefined（文字列を含む）だけが「選べる」。空文字（属性だけ）は選べない', () => {
    for (const v of ['false', '0', 'null', 'undefined', ' false ', false, null, undefined]) expect(isDisabledValue(v)).toBe(false)
    for (const v of ['true', '1', '', 'yes', true]) expect(isDisabledValue(v)).toBe(true)
  })
})
