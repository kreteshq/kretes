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

    <ul>
      <li v-for="task in tasks" :key="task.id">
        <label class="checkbox">
          <input type="checkbox">
          {{ task.name }}
        </label>
      </li>
    </ul>

  </div>
</template>

<script>
import axios from 'axios';

export default {
  docs: true,
  data() {
    return {
      tasks: []
    }
  },
  async created() {
    try {
      const response = await axios.get('/rest/tasks');
      this.tasks = response.data;
      console.log(this.tasks);
    } catch (error) {
      this.errors.push(error);
    }
  }
}

</script>

<style scoped>

</style>
