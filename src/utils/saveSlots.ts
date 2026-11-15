/**
 * セーブ枠の一覧（タイトルやメニューで「スロット 1：3 日目 …」のように出すため）。
 * セーブデータ全体（シナリオ・画像など）は大きいので、一覧には要るものだけを返す。
 */
export interface SaveSlotSummary {
  slot: string
  name: string
  timestamp: string
  sceneName: string
  /** <save summary="…"> か、シーンの saveSummary() が返したもの（無ければ null） */
  summary: any
}

/** セーブデータ 1 件から、一覧用の要約を作る */
export function summarizeSave(data: any): SaveSlotSummary | null {
  if (!data || typeof data !== 'object') return null
  return {
    slot: String(data.slot ?? ''),
    name: data.name || '',
    timestamp: data.timestamp || '',
    sceneName: data.scenarioManager?.sceneName || data.sceneConfig?.name || '',
    summary: data.summary ?? null,
  }
}

/** store（save_<枠> にセーブデータが入っている）から、枠の要約を新しい順に返す */
export function listSaveSlots(store: Record<string, any>): SaveSlotSummary[] {
  return Object.keys(store)
    .filter((key) => key.startsWith('save_'))
    .map((key) => summarizeSave(store[key]))
    .filter((s): s is SaveSlotSummary => !!s)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

/**
 * セーブするときの要約を決める。
 * - <save summary="…"> があればそれ（{{…}} は expand で展開）
 * - なければ、シーンが export した saveSummary() の戻り値（JSON にできるものだけ）
 */
export function resolveSaveSummary(line: any, sceneFile: any, expand?: (t: string) => any): any {
  if (line && line.summary !== undefined && line.summary !== null) {
    return expand ? expand(String(line.summary)) : line.summary
  }
  if (sceneFile && typeof sceneFile.saveSummary === 'function') {
    try {
      const v = sceneFile.saveSummary()
      return v === undefined ? null : JSON.parse(JSON.stringify(v))
    } catch (e) {
      console.warn('saveSummary() で例外が起きたため、要約なしでセーブします', e)
      return null
    }
  }
  return null
}
