<docs>
  <code>Tasks</code> component shows how to integrat with a REST endpoint. It is
  located in <code>components/Tasks.vue</code> on the client side, i.e. within
  <code>client/</code> directory. It connects to Huncwot's REST endpoint defined
  in the backend via controllers. It uses Axios library.

  Each controller is a separate directory (a module) defined on the server side (i.e.
  within <code>server/</code> directory). Each module contains actions as separate files.
  There is a convention that defines five names as special:
  <ul>
    <li><code>browse</code> in <code>browse.js</code> to return a list of resources,</li>
    <li><code>read</code> in <code>read.js</code> to return a single resource,</li>
    <li><code>edit</code> in <code>edit.js</code> to update a single resource,</li>
    <li><code>add</code> in <code>add.js</code> to create a new resource,</li>
    <li><code>destroy</code> in <code>destroy.js</code> to delete a resource</li>
  </ul>

  <br/>

  Those names form a <a href="http://paul-m-jones.com/archives/291" target="_blank">BREAD</a> acronym.
</docs>

<template>
  <div class="content">
    <h2>Tasks</h2>

    <article class="message is-info" v-if="this.$options.docs">
      <div class="message-body">
        <span v-html="this.$options.__docs"></span>
      </div>
    </article>

    <input
      class="input is-medium"
      autofocus
      autocomplete="off"
      placeholder="Enter task's name"
      v-model="taskName"
      @keyup.enter="add"
    >

    <div class="message is-danger" v-show="error">
      <div class="message-body">
        Tasks cannot be fetched from the server. Probably you forgot to setup the database. Does <code>db/development.sqlite</code> exist?  
        If not, run <code>sqlite3 db/development.sqlite3 < db/tasks.sql</code> from the project directory.
      </div>
    </div>

    <ul>
      <li v-for="task in tasks" :key="task.id">
        <label class="checkbox">
          <input type="checkbox" v-model="task.completed">
          {{ task.name }}
        </label>
        <a class="delete" @click="destroy(task.id)"></a>
      </li>
    </ul>

    <div class="is-loading">Loading? {{ loading }}</div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'

const filters = {
  all: tasks => tasks,
  active: tasks => tasks.filter(_ => !_.done),
  completed: tasks => tasks.filter(_ => _.done)
}

export default {
  docs: true,
  async created() {
    this.browse();
  },
  computed: {
    ...mapState('tasks', [
      'tasks',
      'name',
      'loading',
      'error'
    ]),
    ...mapGetters('tasks', [
    ]),
    taskName: {
      get() {
        return this.name;
      },
      set(name) {
        this.setName(name);
      }
    }
  },
  methods: {
    ...mapMutations('tasks', [
      'setName',
      'clear'
    ]),
    ...mapActions('tasks', [
      'browse',
      'add',
      'destroy'
    ]),
  }
}

</script>

<style scoped>
 .input {
     margin-bottom: 1rem;
 }

</style>
