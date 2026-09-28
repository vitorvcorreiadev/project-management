<script setup lang="ts">
import ProjectsEmptyState from '@/components/ProjectsEmptyState.vue'
import ProjectsListing from '@/components/ProjectsListing.vue'
import { useProjectsStore } from '@/stores/projects'
import { storeToRefs } from 'pinia'

const store = useProjectsStore()
const { sortedProjects, projects } = storeToRefs(store)
</script>

<template>
  <ProjectsListing v-if="projects.length" :projects="sortedProjects">
    <template #header>
      <div class="projects-listing-header">
        <h1>Projetos</h1>
        <span>({{ sortedProjects.length }})</span>
      </div>
    </template>
  </ProjectsListing>
  <ProjectsEmptyState v-else />
</template>

<style lang="css" scoped>
.projects-listing-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);

  span {
    font-size: var(--font-size-17);
    color: var(--color-purple-500);
  }
}
</style>
