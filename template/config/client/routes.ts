import Vue from 'vue';
import Router from 'vue-router';

import Home from '../../features/base/component/Home.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    }
  ]
});
