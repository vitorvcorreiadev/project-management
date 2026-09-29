<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import HeaderLogo from '@/assets/images/HeaderLogo.vue'
import SearchBox from '@/components/search/SearchBox.vue'

import { useProjectsStore } from '@/stores/projects'
import { storeToRefs } from 'pinia'

const route = useRoute()

const store = useProjectsStore()
const { projects } = storeToRefs(store)

const showSearchBox = computed(() => !route.meta.hideSearch && projects.value.length)
</script>

<template>
  <header>
    <div class="logo">
      <RouterLink :to="{ name: 'projects' }">
        <HeaderLogo />

        <h1>
          Gerenciador<br />
          de Projetos
        </h1>
      </RouterLink>
    </div>

    <SearchBox v-if="showSearchBox" />
  </header>
</template>

<style scoped>
header {
  position: relative;
  padding-inline: var(--space-8);
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  grid-template-areas: 'empty logo search-box';
  place-items: center;
  background-color: var(--color-purple-950);
  box-shadow: var(--shadow-default);

  .logo {
    grid-area: logo;

    a {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding-block: var(--space-2);

      h1 {
        color: var(--color-white);
        font-size: var(--font-size-md);
      }
    }
  }

  .search-box {
    grid-area: search-box;
    place-self: center end;
  }
}
</style>
