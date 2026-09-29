<script setup lang="ts">
import BaseBreadcrumb from '@/components/base/BaseBreadcrumb.vue'
import ProjectForm from '@/components/project/ProjectForm.vue'
import { useProjectsStore } from '@/stores/projects'
import { useRoute, useRouter } from 'vue-router'
import type { Project } from '@/types/project'

const store = useProjectsStore()
const route = useRoute()
const router = useRouter()

// The route guard sends unknown ids back to the listing, so this always resolves.
const project = store.findProjectById(Number(route.params.id))

function handleSave(updated: Project): void {
  store.updateProject(updated)
  router.push('/')
}
</script>

<template>
  <div>
    <BaseBreadcrumb title="Editar projeto" />

    <ProjectForm :initial="project" @save="handleSave" />
  </div>
</template>
