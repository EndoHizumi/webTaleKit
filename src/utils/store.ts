import storejs from 'storejs';

interface StoreData {
  [key: string]: any;
}

export interface Store extends StoreData {
  set(key: string, value: any): void;
}

export const generateStore = (): Store => {
  const allData: StoreData = storejs();

  const store: Store = {
    ...allData,
    set(key: string, value: any): void {
      storejs.set(key, value);
      this[key] = value;
    }
  };

  return store;
}