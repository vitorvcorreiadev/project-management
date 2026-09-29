<script setup lang="ts">
import { shallowRef } from 'vue'

import BaseHighlight from '@/components/BaseHighlight.vue'
import ProjectCardCover from './ProjectCardCover.vue'
import ProjectCardDates from './ProjectCardDates.vue'
import ProjectCardRemoveDialog from './ProjectCardRemoveDialog.vue'
import type { Project } from '@/types/project'

const props = withDefaults(defineProps<{ project: Project; highlightTerm?: string }>(), {
  highlightTerm: '',
})

const emit = defineEmits<{
  edit: [id: number]
  remove: [id: number]
  'toggle-favorite': [id: number]
}>()

const isRemoveDialogOpen = shallowRef(false)

function handleRemoveConfirm(): void {
  isRemoveDialogOpen.value = false

  emit('remove', props.project.id)
}
</script>

<template>
  <article class="project-card">
    <ProjectCardCover
      :project="project"
      :favorited="project.favorited"
      @edit="emit('edit', project.id)"
      @remove="isRemoveDialogOpen = true"
      @toggle-favorite="emit('toggle-favorite', project.id)"
    />

    <div class="project-card-body">
      <div class="project-card-summary">
        <h3 class="project-card-name" :title="project.name">
          <BaseHighlight :text="project.name" :term="highlightTerm" />
        </h3>

        <p class="project-card-client" :title="project.client">
          <strong>Cliente:</strong> {{ project.client }}
        </p>
      </div>

      <ProjectCardDates :started-at="project.started_at" :end-at="project.end_at" />
    </div>

    <ProjectCardRemoveDialog
      v-model:open="isRemoveDialogOpen"
      :project-name="project.name"
      @confirm="handleRemoveConfirm"
    />
  </article>
</template>

<style lang="css" scoped>
.project-card {
  border-radius: var(--radius-4);
  width: 346px;
}

.project-card-body {
  border: 1px solid var(--color-gray-100);
  border-end-start-radius: var(--radius-4);
  border-end-end-radius: var(--radius-4);
  padding: var(--space-5);
  background: white;
}

.project-card-summary {
  padding-block-end: var(--space-4);
  border-block-end: 1px solid var(--color-gray-100);
}

.project-card-name,
.project-card-client {
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.project-card-name {
  margin-block-end: 0.5rem;
}

.project-card-client strong {
  margin-inline-end: var(--space-2);
}
</style>
