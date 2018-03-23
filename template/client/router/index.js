import Vue from 'vue'
import Router from 'vue-router'

import Home from '../components/Home'
import Widgets from '../components/Widgets'
import Counter from '../components/Counter'
import Tasks from '../components/Tasks'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/widgets',
      name: 'Widgets',
      component: Widgets
    },
    {
      path: '/counter',
      name: 'Counter',
      component: Counter
    },
    {
      path: '/tasks',
      name: 'Tasks',
      component: Tasks
    }
  ]
})
