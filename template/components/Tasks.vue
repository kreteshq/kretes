<template>
  <div class="content">
    <h2>Tasks</h2>
    <article class="message is-info">
      <div class="message-body">
        <code>Tasks</code> component shows how to integrat with a REST endpoint. It is
        located in <code>components/Tasks.vue</code>. It connects to Huncwot's REST endpoint
        defined in the backend via controllers. It uses Axios library. Each controller is
        located in a separate directory with up to five actions i.e. <code>browse</code>,
        <code>read</code>, <code>edit</code>, <code>add</code> and <code>destroy</code>
        (BREAD)
      </div>
    </article>

    <article class="message is-warning">
      <div class="message-body">
        If you don't see the list of tasks below, verify that you populated the
        <code>development</code> database with the sample data from <code>db/tasks.sql</code>.
        For <code>sqlite3</code>, run the following command in the root of your project:
        <code>sqlite3 db/development.sqlite3 < db/tasks.sql</code>.
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
