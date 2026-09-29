<script setup lang="ts">
import AppTopbar from './components/AppTopbar.vue'
</script>

<template>
  <div class="app">
    <AppTopbar />

    <main>
      <RouterView />
    </main>
  </div>
</template>

<style lang="css" scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  main {
    flex: 1;
    display: flex;
    padding: var(--space-7) var(--space-8);
    width: 100%;

    > div {
      width: 100%;
    }
  }
}
</style>
