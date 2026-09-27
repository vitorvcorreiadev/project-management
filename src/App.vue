<script setup lang="ts">
import HeaderLogo from './assets/images/HeaderLogo.vue'
</script>

<template>
  <header>
    <div class="logo">
      <HeaderLogo />
      <span
        >Gerenciador<br />
        de Projetos</span
      >
    </div>
  </header>

  <RouterView />
</template>

<style lang="css" scoped>
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
</style>
