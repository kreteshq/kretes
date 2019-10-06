<template>
  <div class="content">
    <h2 class="subtitle">Home</h2>

    <p>{{ message }}</p>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

export default class Home extends Vue {
  message = "This is the most basic component.";
}
</script>

<style scoped>
</style>
