import { ImageObject } from '../resource/ImageObject'
import { SoundObject } from '../resource/soundObject'
import type { ScriptAPI } from './index'

// エンジン全体の設定（engineConfig.json / ゲーム側のengineConfig.json）
export interface Resolution {
  width: number
  height: number
}

export interface EngineConfig {
  title: string
  description?: string
  resolution: Resolution
  fullScreen?: string
  url?: string
  [key: string]: unknown
}

// 画像の表示位置・サイズ
export interface Position {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

// 表示開始の遅延指定（<show entry=...>）
export interface EntryOption {
  time: number
  wait: boolean
}

// 表示中画像の管理エントリ（Core.displayedImages の値）
export interface DisplayedImage {
  image: ImageObject
  pos?: Position
  size?: Size
  look?: boolean
  entry?: EntryOption
}

export type DisplayedImageMap = Record<string, DisplayedImage>

// 使用済みサウンドの管理エントリ（Core.usedSounds の値）
export interface UsedSound {
  audio: SoundObject
}

export type UsedSoundMap = Record<string, UsedSound>

// シナリオのcontent要素（プレーン文字列 or 入れ子のコマンドオブジェクト）
export type ScenarioContent = string | ScenarioLine

// 選択肢（<choice>の<item>）
export interface ChoiceItem {
  id?: number
  label?: string
  content?: ScenarioLine[]
  position?: { x?: number | string; y?: number | string }
  color?: { default?: string; hover?: string; select?: string }
  default?: string
  hover?: string
  select?: string
}

// シナリオの1行（コマンドオブジェクト）。
// WTSパーサーの出力でタグ属性はすべて任意。数値系の属性は文字列で渡ることがある。
export interface ScenarioLine {
  // 共通
  type?: string
  // ifグローバル属性（条件付き実行のJS式）
  if?: string
  // choice/ifで一時注入された行の印
  sub?: boolean
  name?: string
  content?: ScenarioContent[]

  // text / say
  speed?: number | string
  time?: number | string
  voice?: string
  then?: ScenarioContent[]
  error?: ScenarioContent[]

  // wait
  wait?: number | string

  // choice
  prompt?: string

  // jump
  index?: number | string

  // show / hide / moveto
  mode?: string
  src?: string
  x?: number | string
  y?: number | string
  width?: number | string
  height?: number | string
  pos?: string
  look?: boolean
  entry?: EntryOption
  sepia?: number
  mono?: number
  blur?: number
  opacity?: number
  transition?: string
  duration?: number | string

  // sound
  play?: boolean | string
  loop?: boolean | string
  stop?: boolean | string
  pause?: boolean | string
  path?: string

  // if
  condition?: string

  // route
  to?: string

  // call
  method?: string

  // http
  get?: string
  post?: string
  put?: string
  delete?: string

  // dialog（loadScreenへsceneConfig相当として渡される）
  template?: string
  background?: string

  // save / load
  slot?: string | number
  message?: boolean
}

// シーン設定（.sceneファイルのsceneConfigエクスポート）
export interface SceneConfig {
  name?: string
  background?: string
  bgm?: string
  template?: string
  [key: string]: unknown
}

// .sceneファイルのエクスポート群（コンパイル済みJSモジュール）
export interface SceneFile {
  scenario?: ScenarioLine[]
  sceneConfig?: SceneConfig
  init?: (api: ScriptAPI) => void
  cleanUp?: () => void
  // httpタグのレスポンス格納先
  res?: unknown
  [key: string]: unknown
}

// シナリオ進行状況
export interface SelectedChoice {
  prompt: string
  id: number
}

export interface Progress {
  currentBackground: string
  currentScene: string
  currentIndex: number
  selected: Record<string, SelectedChoice>
}

// セーブデータ
export interface SavedImageData {
  src: string | null
  pos?: Position
  size?: Size
  look?: boolean
  entry?: EntryOption
}

export interface SaveData {
  slot: string | number
  name: string
  timestamp: string
  scenarioManager: {
    progress: Progress
    sceneName: string
    currentIndex: number
    history: unknown[]
  }
  sceneConfig: SceneConfig
  displayedImages: Record<string, SavedImageData>
  backgroundImage: string | null
  usedSounds: Record<string, { src: string | null }>
  bgmSrc: string | null
}
