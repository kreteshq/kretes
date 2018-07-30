import axios from 'axios';

const delay = time => new Promise(resolve => setTimeout(() => resolve(), time));

export default {
  async browse({ commit }) {
    try {
      const { data } = await axios.get('/rest/tasks');
      await delay(700);
      commit('browse', data);
      commit('loaded');
    } catch (error) {
      commit('error', error.message);
    }
  },

  async add({ commit, state }) {
    const task = {
      name: state.name,
      completed: false
    };

    const result = await axios.post('/rest/tasks', task);

    commit('add', task);
    commit('clear', 'name');
  },

  async destroy({ commit }, id) {
    try {
      const result = await axios.delete(`/rest/tasks/${id}`);
    } catch (error) {
      commit('error', error.message);
    }
    commit('destroy', id);
  }
};
