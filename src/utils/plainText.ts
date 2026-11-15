/**
 * テキストの content（文字列・入れ子の要素の配列）を、ログ用の素の文字列にする。
 * - 文字列の {{…}} は expand（core.expandVariable）で展開する
 * - <br> は改行に、それ以外のタグは取り除く
 * - 入れ子の要素（{ content: [...] }）は中身をたどる
 */
export function toPlainText(content: any, expand?: (text: string) => any): string {
  const walk = (c: any): string => {
    if (c === null || c === undefined) return ''
    if (Array.isArray(c)) return c.map(walk).join('')
    if (typeof c === 'string') {
      let t: any = c
      if (expand) {
        try {
          t = expand(c)
        } catch {
          t = c // 展開できなければ、そのまま残す
        }
      }
      return String(t ?? '')
    }
    if (typeof c === 'object' && 'content' in c) return walk(c.content)
    return ''
  }
  return walk(content)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .trim()
}
