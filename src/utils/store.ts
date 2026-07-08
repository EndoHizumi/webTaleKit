import storejs from 'storejs'

interface StoreData {
  [key: string]: unknown;
}

export interface Store extends StoreData {
  set(key: string, value: unknown): void;
  get(key: string): unknown;
  remove(key: string): void;
}

export const generateStore = (): Store => {
  const allData: StoreData = storejs()

  const store: Store = {
    ...allData,
    set(key: string, value: unknown): void {
      storejs.set(key, value)
      this[key] = value
    },
    get(key: string): unknown {
      return storejs.get(key)
    },
    remove(key: string): void {
      storejs.remove(key)
      delete (this as StoreData)[key]
    },
  }

  return store
}