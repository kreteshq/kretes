import Container from './container';

export class Model {
  static store() {
    return Container.store;
  }

  static dispatch(action, item) {
    this.store().dispatch(`${this.entity}/${action}`, item);
  }

  static fetch() {
    this.dispatch('fetch');
  }

  static create(item) {
    this.dispatch('create', item);
  }

  static update(item) {
    this.dispatch('update', item);
  }

  static destroy(id) {
    this.dispatch('destroy', id);
  }
}
