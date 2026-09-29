<script setup lang="ts">
import ProjectList from '@/components/project-list/ProjectList.vue'
import BaseBreadcrumb from '@/components/base/BaseBreadcrumb.vue'
import { useProjectsStore } from '@/stores/projects'
import { storeToRefs } from 'pinia'
import useSearchBox from '@/composables/useSearchBox'

const store = useProjectsStore()
const { searchedProjects, filters } = storeToRefs(store)

const { resetSearch } = useSearchBox()
</script>

<template>
  <ProjectList :projects="searchedProjects" :filterPanel="false" :highlightTerm="filters.term">
    <template #header>
      <BaseBreadcrumb title="Resultado da busca" @back="resetSearch" />
    </template>
  </ProjectList>
</template>
