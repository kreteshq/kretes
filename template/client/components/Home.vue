<docs>
  <code>Home</code> is the simplest possible component. It just displays a
  message. It is located in <code>components/Home.vue</code> on the client
  side, i.e. within <code>client/</code> directory.
</docs>

<template>
  <div class="content">
    <h2>Home</h2>

    <article class="message is-info" v-if="this.$options.docs">
      <div class="message-body">
        <span v-html="this.$options.__docs"></span>
      </div>
    </article>

    <p>{{ message }}</p>
  </div>
</template>

<script>
export default {
  docs: true,
  name: 'Home',
  data () {
    return {
      message: 'This is the most basic component.',
    }
  }
}
</script>

<style scoped>
</style>
