import Vue from '@huncwot/vue';

import routes from './routes';
import store from './store';

import { App } from 'Base/View';

Vue.init({ element: '#app', routes, store, component: App });
