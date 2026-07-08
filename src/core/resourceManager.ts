export class ResourceManager {
  private resourceMap: Record<string, string>
  // webpackIgnore付きdynamic importで渡されるリソース設定（現状は保持のみ）
  private configSource: Promise<unknown> | null

  constructor(config?: Promise<unknown>) {
    this.resourceMap = {} // リソースを管理するオブジェクト
    this.configSource = config ?? null
  }

  // リソースを追加または更新
  addResource(name: string, path: string): void {
    this.resourceMap[name] = path
  }

  // リソースのパスを取得
  getResourcePath(name: string): string | undefined {
    return this.resourceMap[name]
  }
}
