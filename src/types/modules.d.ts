// engineConfig.jsonのインポートに型を与える
// （resolveJsonModuleはrootDirの再計算でdistの出力構成が変わるため使わない）
// ambientモジュール宣言では相対importができないため、src/core/types.tsのEngineConfigと同じ形をここに定義する
declare module '*engineConfig.json' {
  const engineConfig: {
    title: string
    description?: string
    resolution: { width: number; height: number }
    fullScreen?: string
    url?: string
    [key: string]: unknown
  }
  export default engineConfig
}
