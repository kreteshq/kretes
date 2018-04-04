<docs>
  <code>Widgets</code> component shows how to integrat with a GraphQL endpoint. It is
  located in <code>components/Widgets.vue</code> on the client side, i.e. within
  <code>client/</code> directory. It connects to Huncwot's GraphQL endpoint defined
  in the backend at <code>/graphql</code> using Apollo library.
</docs>

<template>
  <div class="content">
    <h2>Widgets</h2>

    <article class="message is-info" v-if="this.$options.docs">
      <div class="message-body">
        <span v-html="this.$options.__docs"></span>
      </div>
    </article>

    <ul>
      <li v-for="widget in widgets" :key="widget.id">{{ widget.name }}</li>
    </ul>
  </div>
</template>

<script>
import gql from 'graphql-tag';

const query = gql`
  query {
    widgets {
      name
    }
  }
`

export default {
  docs: true,
  data() {
    return {
      widgets: []
    }
  },

  apollo: {
    widgets: {
      query
    }
  }
}
</script>
