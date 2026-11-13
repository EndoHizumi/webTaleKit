/**
 * <dialog> の中身（<prompt> と <action>）を、表示する文字列に変える関数。
 * DefaultUIHandler の dialog:show から使う。DOM に触らないのでテストしやすいように分けている。
 */

type Expand = (text: any) => any

/**
 * <prompt> の中身を HTML 文字列にする。
 * - 文字列はそのまま変数展開する（`<prompt>{{msg}}</prompt>`）。
 * - <text> などのタグ（`{ type, content }`）は、中の文字列を展開してつなぎ、1 行ずつ <div> で包む
 *   （docs/tags/dialog.md の `<prompt><text>…</text><text>…</text></prompt>` の書き方）。
 */
export function buildDialogPrompt(content: any[], expand: Expand): string {
  return (content || [])
    .map((item: any) => {
      if (item && typeof item === 'object') {
        return `<div class="dialog-prompt-line">${collectText(item.content, expand)}</div>`
      }
      return expand(item)
    })
    .join('\n')
}

// タグの中身を、入れ子もたどって文字列にする（文字列以外・中身の無いタグは空にする）
function collectText(content: any, expand: Expand): string {
  return []
    .concat(content ?? [])
    .map((child: any) => {
      if (typeof child === 'string') return expand(child)
      if (child && typeof child === 'object') return collectText(child.content, expand)
      return ''
    })
    .join('')
}

/**
 * <action> のボタンの文字を展開する。元の action（シナリオのオブジェクト）は書き換えない。
 * 書き換えると、同じ <dialog> を開き直したとき `{{...}}` が消えていて、最初の文字のままになるため。
 */
export function dialogActionLabel(action: any, expand: Expand): string {
  return String(expand(action.label) ?? '')
}
