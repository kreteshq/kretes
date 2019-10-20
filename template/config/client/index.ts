import Vue from 'vue';
import router from './routes';
import store from './store';

import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import VueApollo from 'vue-apollo';

import { App } from 'Base/View';

Vue.use(VueApollo);

const client = new ApolloClient({
  link: new HttpLink({
    uri: '/graphql',
    headers: {'Content-Type': 'application/json'},
    credentials: 'include'
  }),
  cache: new InMemoryCache(),
  connectToDevTools: true,
});

const apolloProvider = new VueApollo({
  defaultClient: client,
});

/* eslint-disable no-new */
new Vue({
  el: '#app',
  provide: apolloProvider.provide(),
  router,
  store,
  render: h => h(App)
})
