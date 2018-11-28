export default class Container {
  static register(store) {
    this.store = store;
  }

  static fetch() {
    return this.store;
  }
}

Container.store = 'store is empty';
