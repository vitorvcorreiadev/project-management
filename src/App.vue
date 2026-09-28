<script setup lang="ts">
import { useRoute } from 'vue-router'

import HeaderLogo from './assets/images/HeaderLogo.vue'
import SearchBox from './components/SearchBox.vue'

const route = useRoute()
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

      <SearchBox v-if="!route.meta.hideSearch" />
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

  > header {
    position: relative;
    background-color: var(--color-purple-950);
    box-shadow: var(--shadow-default);
    width: 100%;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-areas: 'empty logo search-box';
    place-items: center;
    padding-inline: var(--space-8);

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

    .search-box {
      grid-area: search-box;
      place-self: center end;
    }
  }

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
