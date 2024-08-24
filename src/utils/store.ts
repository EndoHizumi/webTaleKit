import storejs from 'storejs';

interface StoreData {
  [key: string]: any;
}

interface Store {
  [key: string]: any;
  set(key: string, value: any): void;
}

export const generateStore = (): Store => {
  const allData: StoreData = storejs();

  class Store {
    [key: string]: any;

    constructor(data: StoreData) {
      Object.assign(this, data);
    }

    set(key: string, value: any): void {
      storejs.set(key, value);
      this[key] = value;
    }
  }

  return new Store(allData);
};