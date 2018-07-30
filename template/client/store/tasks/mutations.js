export default {
  browse(state, tasks) {
    state.tasks.push(...tasks);
  },

  add(state, task) {
    state.tasks.push(task);
  },

  destroy(state, id) {
    const index = state.tasks.findIndex(t => t.id === id);
    state.tasks.splice(index, 1)
  },

  setName(state, name) {
    state.name = name;
  },

  loaded(state) {
    state.loading = false;
  },

  error(state, message) {
    state.error = message;
  },

  clear(state, name) {
    state[name] = '';
  }
}
