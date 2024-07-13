import storejs from 'storejs'

export const generateStore = () => {
  const allData = storejs()

  class Store {
    constructor(data) {
      Object.assign(this, data)
    }

    set(key, value) {
      storejs.set(key, value)
      this[key] = value
    }
  }
  return new Store(allData)
}
