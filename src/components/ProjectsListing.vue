<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

import BaseButton from './BaseButton.vue'
import BaseCombobox from './BaseCombobox.vue'
import BaseToggle from './BaseToggle.vue'
import ProjectCard from './project-card/ProjectCard.vue'
import type { Project, SortParam, SortRule } from '@/types/project'
import type { ComboboxOption } from '@/types/combobox'
import PlusCircle from '@/assets/images/PlusCircle.vue'
import { useProjectsStore } from '@/stores/projects'

const store = useProjectsStore()
const { filters, sorting } = storeToRefs(store)

withDefaults(
  defineProps<{ projects: Project[]; filterPanel?: boolean; highlightTerm?: string }>(),
  { filterPanel: true, highlightTerm: '' },
)

const router = useRouter()

type SortOption = ComboboxOption & { value: SortParam; rule: SortRule }

const sortOptions: SortOption[] = [
  { value: 'name', label: 'Ordem alfabética', rule: 'asc' },
  { value: 'started_at', label: 'Iniciados mais recentes', rule: 'desc' },
  { value: 'end_at', label: 'Prazo mais próximo', rule: 'desc' },
]

/*
 * The combobox speaks plain strings while the store keeps the param and its rule
 * together, so both are written from the option that carries the rule — the
 * listing never has to know which value means which direction.
 */
const sortParam = computed<string>({
  get: () => sorting.value.param,
  set: (value) => {
    const option = sortOptions.find((candidate) => candidate.value === value)

    if (!option) return

    sorting.value.param = option.value
    sorting.value.rule = option.rule
  },
})
</script>

<template>
  <div class="project-listing">
    <header>
      <slot name="header"></slot>

      <div v-if="filterPanel">
        <BaseToggle v-model="filters.favorited">Apenas Favoritos</BaseToggle>

        <BaseCombobox v-model="sortParam" label="Ordenar por" :options="sortOptions" />

        <BaseButton @click="router.push('/projects/new')">
          <PlusCircle />
          Novo Projeto
        </BaseButton>
      </div>
    </header>

    <ul>
      <li v-for="project in projects" :key="project.id">
        <ProjectCard
          :project="project"
          :highlight-term="highlightTerm"
          @edit="router.push(`/projects/${$event}/edit`)"
          @remove="store.removeProject($event)"
          @toggle-favorite="store.toggleFavorite($event)"
        />
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

    > div:last-child {
      display: flex;
      align-items: center;
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
