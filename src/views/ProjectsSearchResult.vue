<script setup lang="ts">
import ProjectList from '@/components/project-list/ProjectList.vue'
import BaseBreadcrumb from '@/components/base/BaseBreadcrumb.vue'
import useSearchBox from '@/composables/useSearchBox'
import { useProjectSearch } from '@/composables/useProjectSearch'

const { searchTerm, searchedProjects } = useProjectSearch()
const { resetSearch } = useSearchBox()
</script>

<template>
  <ProjectList :projects="searchedProjects" :filterPanel="false" :highlightTerm="searchTerm">
    <template #header>
      <BaseBreadcrumb title="Resultado da busca" @back="resetSearch" />
    </template>
  </ProjectList>
</template>
