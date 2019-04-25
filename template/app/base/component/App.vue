<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-6">
        <div class="text-center">
          <a href="#" class="flex">
            <HuncwotLogo class="logo"/>
          </a>
          <h1 class="display-1">{{ title }}</h1>
          <p class="lead">
            Macro framework for monolithic JavaScript applications,
            batteries included
          </p>

          <ul class="nav justify-content-center">
            <li class="nav-item">
              <a href="https://huncwot.org" class="nav-link">Website</a>
            </li>
            <li class="nav-item">
              <a href="https://github.com/zaiste/huncwot#getting-started" class="nav-link">Guide</a>
            </li>
            <li class="nav-item">
              <a href="https://github.com/zaiste/huncwot" class="nav-link">GitHub</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import HuncwotLogo from "~/../static/huncwot.svg";

@Component({ components: { HuncwotLogo } })
export default class App extends Vue {
  title: string = "Huncwot";
}
</script>

<style>
body {
  margin-top: 2rem;
}
.logo {
  display: block;
  width: 196px;
  height: 196px;
  margin: auto;
}

.display-1 {
  font-weight: 100;
}

.lead {
  font-size: 1.5rem;
}
</style>
