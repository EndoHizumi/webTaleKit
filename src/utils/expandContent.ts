/**
 * テキストの content（文字列・入れ子の要素の配列）の {{…}} を、一度だけ展開した写しを返す。
 * - 入れ物（配列・入れ子の要素）の形はそのままに、文字列だけを展開する
 * - 展開に失敗した文字列は、元のまま残す
 *
 * 表示とログ（読み返し）で同じ写しを使うため。別々に展開すると、
 * `{{…}}` の中の関数が 1 行につき 2 回呼ばれる（副作用のある関数だと二重に効く）。
 */
export function expandContent(content: any, expand?: (text: string) => any): any {
  if (!expand) return content
  const walk = (c: any): any => {
    if (c === null || c === undefined) return c
    if (Array.isArray(c)) return c.map(walk)
    if (typeof c === 'string') {
      try {
        const t = expand(c)
        return typeof t === 'string' ? t : String(t ?? '')
      } catch {
        return c // 展開できなければ、そのまま残す
      }
    }
    if (typeof c === 'object' && 'content' in c) return { ...c, content: walk(c.content) }
    return c
  }
  return walk(content)
}
