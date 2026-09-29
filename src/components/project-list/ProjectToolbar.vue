<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

import BaseButton from '@/components/BaseButton.vue'
import BaseCombobox from '@/components/BaseCombobox.vue'
import BaseToggle from '@/components/BaseToggle.vue'
import PlusCircle from '@/assets/images/PlusCircle.vue'
import { useProjectsStore } from '@/stores/projects'
import type { SortParam, SortRule } from '@/types/project'
import type { ComboboxOption } from '@/types/combobox'

const store = useProjectsStore()
const { filters, sorting } = storeToRefs(store)

const router = useRouter()

type SortOption = ComboboxOption & { value: SortParam; rule: SortRule }

const sortOptions: SortOption[] = [
  { value: 'name', label: 'Ordem alfabética', rule: 'asc' },
  { value: 'started_at', label: 'Iniciados mais recentes', rule: 'desc' },
  { value: 'end_at', label: 'Prazo mais próximo', rule: 'desc' },
]

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
  <div class="project-toolbar">
    <BaseToggle v-model="filters.favorited">Apenas Favoritos</BaseToggle>

    <BaseCombobox v-model="sortParam" label="Ordenar por" :options="sortOptions" />

    <BaseButton @click="router.push('/projects/new')">
      <PlusCircle />
      Novo Projeto
    </BaseButton>
  </div>
</template>

<style lang="css" scoped>
.project-toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-6);
}
</style>
