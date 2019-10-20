import Vue from 'vue';
import Router from 'vue-router';

import { Home } from 'Base/View';

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
