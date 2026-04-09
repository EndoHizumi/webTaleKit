import storejs from 'storejs';

interface StoreData {
  [key: string]: any;
}

export interface Store extends StoreData {
  set(key: string, value: any): void;
  get(key: string): any;
  remove(key: string): void;
}

export const generateStore = (): Store => {
  const allData: StoreData = storejs();

  const store: Store = {
    ...allData,
    set(key: string, value: any): void {
      storejs.set(key, value);
      this[key] = value;
    },
    get(key: string): any {
      return storejs.get(key);
    },
    remove(key: string): void {
      storejs.remove(key);
      delete (this as StoreData)[key];
    },
  };

  return store;
}