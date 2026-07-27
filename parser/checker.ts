/**
 * パース・フラット化済みのシナリオノード。
 * タグ属性はflattenAttributesでトップレベルに展開されるため自由形式。
 */
export interface ParsedNode {
  type?: string
  content?: Array<ParsedNode | string>
  [key: string]: unknown
}

/**
 * チェッカーが返す結果オブジェクト。
 * - invalid_parent: 構造エラー (不正な親子関係)
 * - unknown_attribute: 警告 (エンジンが読み取らない属性)
 */
export interface CheckResult {
  type: 'invalid_parent' | 'unknown_attribute'
  node: string
  parent?: string | null
  attribute?: string
  message: string
}

/**
 * トップレベルコマンドの一覧 (core/index.ts の Core.commandList から抽出)。
 * HTTP サブタグはこれらのコマンドいずれかの子要素として使用できる。
 */
const TOP_LEVEL_COMMANDS = [
  'text', 'choice', 'show', 'newpage', 'hide', 'jump', 'sound', 'say',
  'if', 'call', 'moveto', 'route', 'wait', 'dialog', 'save', 'load', 'add', 'remove',
  'trigger', 'untrigger',
]

/**
 * 各ノードタイプが配置できる親タイプを定義する。
 * キー: 子ノードタイプ、値: 許可された親タイプの配列
 */
export const ALLOWED_PARENTS: Record<string, string[]> = {
  // choice 構造
  item: ['choice'],
  // dialog 構造
  prompt: ['dialog'],
  actions: ['dialog'],
  action: ['actions'],
  // if 構造
  else: ['if'],
  // then は <if> の子要素としても、トップレベルコマンドの HTTP レスポンスの子要素としても使用できる
  then: ['if', ...TOP_LEVEL_COMMANDS],
  // インラインテキスト装飾タグ (drawer.ts の createDecoratedElement と textHandler から)
  color: ['text', 'say'],
  ruby: ['text', 'say'],
  b: ['text', 'say'],
  i: ['text', 'say'],
  br: ['text', 'say'],
  // HTTP サブタグ (httpHandler から) — トップレベルコマンドの子要素として有効
  header: TOP_LEVEL_COMMANDS,
  data: TOP_LEVEL_COMMANDS,
  error: TOP_LEVEL_COMMANDS,
  progress: TOP_LEVEL_COMMANDS,
  // addタグ配下でのみ使用可能なイベント定義
  onclick: ['add'],
}

/**
 * すべてのノードタイプに共通して有効な属性。
 * - type: タグタイプ自体
 * - content: 子ノードの配列
 * - if: 条件付き実行 (core/index.ts の runScenario)
 * - get/post/put/delete: HTTP メソッド属性 (core/index.ts の httpHandler)
 */
export const GLOBAL_ATTRIBUTES: Set<string> = new Set(['type', 'content', 'if', 'get', 'post', 'put', 'delete'])

/**
 * ノードタイプごとの既知の属性セット (GLOBAL_ATTRIBUTES を除く)。
 * このセットに含まれない属性は unknown_attribute 警告を生成する。
 * このマップにないノードタイプは属性チェックをスキップする
 * (<header> や <data> の子要素のような自由形式の子要素に対応)。
 */
export const KNOWN_ATTRIBUTES: Record<string, Set<string>> = {
  // トップレベルコマンド (core/index.ts のハンドラ実装から取得)
  text:     new Set(['name', 'speed', 'time']),
  say:      new Set(['name', 'speed', 'voice']),
  choice:   new Set(['prompt', 'position']),
  show:     new Set(['src', 'name', 'mode', 'x', 'y', 'width', 'height', 'pos', 'look', 'entry', 'sepia', 'mono', 'blur', 'opacity', 'transition', 'duration', 'z-index']),
  hide:     new Set(['name', 'mode', 'transition', 'duration']),
  moveto:   new Set(['name', 'x', 'y', 'duration']),
  sound:    new Set(['src', 'name', 'mode', 'play', 'loop', 'stop', 'pause']),
  jump:     new Set(['index', 'sub']),
  if:       new Set(['condition']),
  call:     new Set(['method']),
  route:    new Set(['to']),
  wait:     new Set(['wait', 'time']),
  newpage:  new Set([]),
  dialog:   new Set(['name', 'template']),
  save:     new Set(['slot', 'name', 'message']),
  load:     new Set(['slot', 'message']),
  trigger:  new Set(['id', 'event', 'target', 'rect', 'circle', 'style', 'cursor', 'once', 'cooldown']),
  untrigger: new Set(['id', 'all']),
  add:      new Set(['target', 'name', 'class']),
  remove:   new Set(['name']),
  // サブノード
  item:     new Set(['label', 'id', 'default', 'hover', 'select', 'color', 'position']),
  action:   new Set(['id', 'label', 'value']),
  then:     new Set([]),
  else:     new Set([]),
  prompt:   new Set([]),
  actions:  new Set([]),
  // インラインテキスト装飾 (drawer.ts の createDecoratedElement から)
  color:    new Set(['value']),
  ruby:     new Set(['text']),
  b:        new Set([]),
  i:        new Set([]),
  br:       new Set([]),
  // HTTP サブタグ (header/data の子要素は自由形式のキーを使用するため、チェックしない)
  header:   new Set([]),
  data:     new Set([]),
  error:    new Set([]),
  progress: new Set([]),
  // onclick自体は属性を持たない。中身は子要素のWTSコマンド
  onclick:  new Set([]),
}

/**
 * 親子関係が不正な場合のエラーメッセージを生成する。
 * @param nodeType - 誤った位置に配置されたノードのタイプ
 * @param parentType - 実際の親タイプ。ルートの場合は null
 * @param allowedParents - 許可された親タイプの配列
 */
const buildInvalidParentMessage = (nodeType: string, parentType: string | null, allowedParents: string[]): string => {
  const allowed = allowedParents.map((p) => `<${p}>`).join(' or ')
  const actual = parentType ? `<${parentType}>` : 'scenario root'
  return `<${nodeType}> must be inside ${allowed}, but found inside ${actual}`
}

/**
 * 未知の属性 (エンジンに無視される属性) の警告メッセージを生成する。
 */
const buildUnknownAttributeMessage = (nodeType: string, attrName: string): string => {
  return `<${nodeType}> has unknown attribute "${attrName}" which will be ignored`
}

/**
 * エンジンで認識されない属性をノード単位でチェックする。
 * 該当する属性ごとに unknown_attribute 警告を結果配列に追加する。
 * @param node
 * @param results - 結果オブジェクトを蓄積する配列
 */
const checkAttributes = (node: ParsedNode, results: CheckResult[]): void => {
  const nodeType = node.type
  if (!nodeType) return
  const knownForType = KNOWN_ATTRIBUTES[nodeType]
  if (knownForType === undefined) return // 未知のノードタイプはスキップ
  for (const key of Object.keys(node)) {
    if (GLOBAL_ATTRIBUTES.has(key)) continue
    if (knownForType.has(key)) continue
    results.push({
      type: 'unknown_attribute',
      node: nodeType,
      attribute: key,
      message: buildUnknownAttributeMessage(nodeType, key),
    })
  }
}

/**
 * ノードの親子関係の違反と未知の属性を再帰的にチェックする。
 * @param nodes - パース済みシナリオノードの配列
 * @param parentType - 親ノードのタイプ。ルートの場合は null
 * @param results - 結果オブジェクトを蓄積する配列
 */
const checkNodes = (nodes: Array<ParsedNode | string>, parentType: string | null, results: CheckResult[]): void => {
  if (!Array.isArray(nodes)) return
  for (const node of nodes) {
    if (typeof node !== 'object' || node === null) continue
    const nodeType = node.type
    if (!nodeType) continue

    const allowedParents = ALLOWED_PARENTS[nodeType]
    if (allowedParents && !allowedParents.includes(parentType ?? '')) {
      results.push({
        type: 'invalid_parent',
        node: nodeType,
        parent: parentType,
        message: buildInvalidParentMessage(nodeType, parentType, allowedParents),
      })
    }

    checkAttributes(node, results)

    if (Array.isArray(node.content)) {
      checkNodes(node.content, nodeType, results)
    }
  }
}

/**
 * パース済みシナリオ配列の構文エラーと属性警告をチェックする。
 * 結果オブジェクトの配列を返す:
 *   - type 'invalid_parent': 構造エラー (不正な親子関係)
 *   - type 'unknown_attribute': 警告 (エンジンが読み取らない属性)
 * @param scenario - パース・フラット化されたシナリオ配列
 */
export const check = (scenario: Array<ParsedNode | string>): CheckResult[] => {
  const results: CheckResult[] = []
  checkNodes(scenario, null, results)
  return results
}
