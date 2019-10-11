import Vue from 'vue';
import Router from 'vue-router';

import { Home } from 'Base/Component';

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
