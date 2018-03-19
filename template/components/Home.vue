<template>
  <div class="content">
    <h2>Home</h2>
    <article class="message is-info">
      <div class="message-body">
        <code>Home</code> is the simplest possible component. It is located in
        <code>components/Home.vue</code>. It just displays a message.
      </div>
    </article>
    <p>{{ message }}</p>
  </div>
</template>

<script>
export default {
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
