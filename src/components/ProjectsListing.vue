<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from './BaseButton.vue'
import BaseToggle from './BaseToggle.vue'
import ProjectCard from './ProjectCard.vue'
import type { Project } from '@/types/project'
import PlusCircle from '@/assets/images/PlusCircle.vue'

const favorites = ref(false)

defineProps<{ projects: Project[] }>()
</script>

<template>
  <div class="project-listing">
    <header>
      <div>
        <h1>Projetos</h1>
        <span>(9)</span>
      </div>

      <div>
        <BaseToggle v-model="favorites">Apenas Favoritos</BaseToggle>
        <BaseButton>
          <PlusCircle />
          Novo Projeto
        </BaseButton>
      </div>
    </header>

    <ul>
      <li v-for="(project, index) in projects" :key="index">
        <ProjectCard :project="project" />
      </li>
    </ul>
  </div>
</template>

<style lang="css" scoped>
.project-listing {
  > header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    > div {
      display: flex;
      align-items: center;
    }

    > div:first-child {
      gap: var(--space-2);

      span {
        font-size: var(--font-size-17);
        color: var(--color-purple-500);
      }
    }

    > div:last-child {
      gap: var(--space-6);
    }
  }

  > ul {
    display: flex;
    gap: var(--space-6);
    flex-wrap: wrap;
    margin-top: var(--space-5);
  }
}
</style>
