<script setup lang="ts">
import AppHeader from './components/AppHeader.vue'
</script>

<template>
  <div class="app">
    <AppHeader />

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
