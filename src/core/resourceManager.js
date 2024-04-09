export class ResourceManager {
  constructor() {
    this.resourceMap = {} // リソースを管理するオブジェクト
    
  }

  // リソースを追加または更新
  addResource(name, path) {
    this.resourceMap[name] = path
  }

  // リソースのパスを取得
  getResourcePath(name) {
    return this.resourceMap[name]
  }
}
