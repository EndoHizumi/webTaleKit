import { check, CheckResult, ParsedNode } from './checker'

/**
 * HTMLパーサー（html-to-json-parser / domParserAdapter）の出力ノード
 */
export interface ParsedElement {
  type: string
  content: Array<ParsedElement | string>
  attributes?: Record<string, string>
}

/**
 * HTMLをParsedElement形式に変換する関数（環境ごとに注入する）
 */
export type HtmlParser = (data: string) => Promise<ParsedElement>

/**
 * パース結果のエラー・警告（checker結果 + パーサー自身が検出する構造エラー）
 */
export type ParseError = CheckResult | { type: 'duplicate_scenario'; message: string }

export interface ParseResult {
  scenario: ParsedNode[]
  script: Array<ParsedElement | string>
  lang: string
  errors: ParseError[]
}

/**
 * WebTaleScript パーサー（環境非依存）
 * @param data - WTSファイルの文字列
 * @param htmlParser - HTMLをParsedElement形式に変換する関数
 */
const parse = async (data: string, htmlParser: HtmlParser): Promise<ParseResult> => {
  let scenario: ParsedNode[] = []
  let script: Array<ParsedElement | string> = []
  let lang = 'js'
  const errors: ParseError[] = []

  /**
   * 渡されたオブジェクトのattributesをトップレベルに展開する
   */
  const flattenAttributes = (jsObject: unknown): unknown => {
    if (Array.isArray(jsObject)) {
      return jsObject.map(flattenAttributes)
    }
    if (typeof jsObject !== 'object' || jsObject === null) {
      return jsObject
    }
    const { attributes, ...rest } = jsObject as Record<string, unknown>
    if (attributes) {
      Object.assign(rest, attributes)
    }
    if (rest.content) {
      rest.content = (rest.content as unknown[]).map(flattenAttributes)
    }
    return rest
  }

  // 外から注入されたパーサーを使用
  const parseJson = await htmlParser(data)
  let scenarioCount = 0
  parseJson.content.forEach((element) => {
    // <scene>直下のテキストノード（minify残りの空白など）は無視する
    if (typeof element === 'string') {
      return
    }
    if (element.type === 'scenario') {
      scenarioCount++
      if (scenarioCount > 1) {
        errors.push({
          type: 'duplicate_scenario',
          message: 'Multiple <scenario> sections found. Only one <scenario> is allowed per scene file.',
        })
      }
      scenario = flattenAttributes(element.content) as ParsedNode[]
    } else {
      script = element.content
      lang = element.attributes?.type ?? 'js'
    }
  })

  // パース済みシナリオに対して構文チェッカーを実行する
  const checkerErrors = check(scenario)
  errors.push(...checkerErrors)

  return { scenario, script, lang, errors }
}

export default parse
