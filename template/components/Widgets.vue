<template>
  <div class="content">
    <h2>Widgets</h2>
    <article class="message is-info">
      <div class="message-body">
        <code>Widgets</code> component shows how to integrat with a GraphQL endpoint. It is
        located in <code>components/Widgets.vue</code>. It connects to Huncwot's GraphQL endpoint
        defined in the backend at <code>/graphql</code> using Apollo library. You can adjust the
        schema in <code>schema/index.js</code> and its resolvers in <code>resolvers/index.js</code>.
      </div>
    </article>

    <ul>
      <li v-for="widget in widgets">{{ widget.name }}</li>
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
