export class ResourceManager {
  private resourceMap: { [key: string]: string };

  constructor() {
    this.resourceMap = {}; // リソースを管理するオブジェクト
  }

  // リソースを追加または更新
  public addResource(name: string, path: string): void {
    this.resourceMap[name] = path;
  }

  // リソースのパスを取得
  public getResourcePath(name: string): string | undefined {
    return this.resourceMap[name];
  }
}