<template>
  <div class="content">
    <h2 class="subtitle">Home</h2>

    <p>{{ message }}</p>
  </div>
</template>

<script lang="ts">
import { Component, Base } from "@huncwot/vue";

export default class Home extends Base {
  message = "This is the most basic component.";
}
</script>

<style scoped>
</style>
