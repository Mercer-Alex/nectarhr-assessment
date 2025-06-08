<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <nav class="header">
    <img alt="Vue logo" class="logo" src="@/assets/nectarhr.png" width="128" height="31" />
    <div class="nav-links">
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/about">About</RouterLink>
      <RouterLink to="/weather">Weather</RouterLink>
      <RouterLink to="/users">Users</RouterLink>
    </div>
  </nav>
  <header>
  </header>

  <RouterView />
</template>

<style scoped>
.header {
  color: black;
  font-family:'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.nav-links {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 45px;
  a {
    color: black;
    text-decoration: none;
    margin: 15px;
  }
}
</style>
