const ApolloClient = require('apollo-client').default;
const HttpLink = require('apollo-link-http').default;
const InMemoryCache = require('apollo-cache-inmemory').default;

const client = new ApolloClient({
  link: new HttpLink({ uri: '/graphql' }),
  cache: new InMemoryCache()
});

module.exports = client;
