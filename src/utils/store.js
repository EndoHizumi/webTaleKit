import storejs from 'storejs'

export const generateStore = () => {
  const allData = storejs.getAll()

  class Store {
    constructor(data) {
      Object.assign(this, data)
    }

    set(key, value) {
      store.set(key, value)
      this[key] = value
    }
  }

  const storeInstance = new Store(allData)

  // Proxyを使用してsetメソッド以外での値の追加を禁止
  return new Proxy(storeInstance, {
    set(target, prop, value) {
      if (prop === 'set') {
        return true // setメソッド自体の変更は許可
      }
      throw new Error('値の追加はsetメソッドを使用してください。')
    },
    defineProperty() {
      throw new Error('新しいプロパティの定義は許可されていません。')
    },
  })
}
