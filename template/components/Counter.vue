<template>
  <div class="content">
    <h2>Counter</h2>
    <article class="message is-info">
      <div class="message-body">
        <code>Counter</code> component shows how to integrate with a store. It is
        located in <code>components/Counter.vue</code>. It uses Vuex library to manage the
        application state. It is configured via <code>store/index.js</code>.
      </div>
    </article>
    <div>
      <span class="counter">{{ $store.state.count }}</span>
      <span class="notice">(count is: {{ evenOrOdd }})</span>
    </div>

    <div class="buttons has-addons">
      <a class="button is-success" @click="increment">Increment</a>
      <a class="button is-danger" @click="decrement">Decrement</a>
      <a class="button is-info" @click="incrementIfOdd">Increment if odd</a>
      <a class="button is-dark" @click="incrementAsync">Increment async</a>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  computed: mapGetters([
    'evenOrOdd'
  ]),
  methods: mapActions([
    'increment',
    'decrement',
    'incrementIfOdd',
    'incrementAsync'
  ])
}
</script>

<style scoped>
.counter {
  font-size: 5rem;
}

.notice {
  color: #666;
  font-weight: 500;
}
</style>
