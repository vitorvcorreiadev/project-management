<script setup lang="ts">
import { useRouter } from 'vue-router'

import ProjectCard from '@/components/project-card/ProjectCard.vue'
import ProjectToolbar from '@/components/project-list/ProjectToolbar.vue'
import { useProjectsStore } from '@/stores/projects'
import type { Project } from '@/types/project'

const store = useProjectsStore()

const router = useRouter()

withDefaults(
  defineProps<{ projects: Project[]; filterPanel?: boolean; highlightTerm?: string }>(),
  { filterPanel: true, highlightTerm: '' },
)
</script>

<template>
  <div class="project-list">
    <header>
      <slot name="header"></slot>

      <ProjectToolbar v-if="filterPanel" />
    </header>

    <ul>
      <li v-for="project in projects" :key="project.id">
        <ProjectCard
          :project="project"
          :highlight-term="highlightTerm"
          @edit="router.push({ name: 'edit-project', params: { id: $event } })"
          @remove="store.removeProject($event)"
          @toggle-favorite="store.toggleFavorite($event)"
        />
      </li>
    </ul>
  </div>
</template>

<style lang="css" scoped>
.project-list {
  > header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  > ul {
    display: flex;
    gap: var(--space-6);
    flex-wrap: wrap;
    margin-top: var(--space-5);
  }
}
</style>
