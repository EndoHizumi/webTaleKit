export class ResourceManager {
  private resourceMap: Record<string, string>;

  constructor() {
    this.resourceMap = {}; // リソースを管理するオブジェクト
  }

  // リソースを追加または更新
  addResource(name: string, path: string): void {
    this.resourceMap[name] = path;
  }

  // リソースのパスを取得
  getResourcePath(name: string): string | undefined {
    return this.resourceMap[name];
  }
}
