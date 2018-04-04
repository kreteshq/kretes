<template>
  <div id="app">
    <article class="message is-info" v-if="this.$options.docs">
      <div class="message-body">
        <span v-html="this.$options.__docs"></span>
      </div>
    </article>

    <div class="field control">
      <router-link to="/" class="button is-outlined">Home</router-link>
      <router-link to="/widgets" class="button is-outlined">GraphQL: Widgets</router-link>
      <router-link to="/tasks" class="button is-outlined">REST: Tasks</router-link>
      <router-link to="/counter" class="button is-outlined">Counter</router-link>
    </div>
    <hr>
    <router-view/>
  </div>
</template>

<script>
export default {
  docs: true,
  name: 'App',
  data () {
    return {
      docs: this.$options.__docs
    }
  },
}
</script>

<style scoped>

</style>

<docs>
Root component with routes. It is located in <code>components/App.vue</code> on the client side,
i.e. within <code>client/</code> directory.
</docs>
