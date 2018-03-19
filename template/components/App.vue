<template>
  <div id="app">
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
  name: 'App'
}
</script>

<style scoped>

</style>
