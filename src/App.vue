<script setup lang="ts">
import HeaderLogo from './assets/images/HeaderLogo.vue'
</script>

<template>
  <div class="app">
    <header>
      <div class="logo">
        <HeaderLogo />
        <span
          >Gerenciador<br />
          de Projetos</span
        >
      </div>
    </header>

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

  header {
    background-color: var(--color-purple-950);
    box-shadow: var(--shadow-default);
    width: 100%;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-areas: 'empty logo search';
    place-items: center;

    .logo {
      grid-area: logo;
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-2) var(--space-8);

      span {
        color: white;
        font-size: var(--font-size-18);
        line-height: var(--line-height-tight);
      }
    }
  }

  main {
    flex: 1;
    display: flex;
    padding: var(--space-7) var(--space-8);
  }
}
</style>
