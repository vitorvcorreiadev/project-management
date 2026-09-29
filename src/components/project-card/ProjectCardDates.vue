<script setup lang="ts">
import { computed } from 'vue'

import CalendarCheckLight from '@/assets/images/CalendarCheckLight.vue'
import CalendarDayLight from '@/assets/images/CalendarDayLight.vue'
import { formatProjectDate } from '@/utils/dates'

const props = defineProps<{ startedAt: string; endAt: string }>()

const rows = computed(() => [
  {
    id: 'started_at',
    label: 'Início',
    icon: CalendarDayLight,
    value: formatProjectDate(props.startedAt),
  },
  {
    id: 'end_at',
    label: 'Prazo',
    icon: CalendarCheckLight,
    value: formatProjectDate(props.endAt),
  },
])
</script>

<template>
  <div class="project-card-dates">
    <div v-for="row in rows" :key="row.id" class="project-card-date">
      <component :is="row.icon" aria-hidden="true" />

      <p class="project-card-date-value">
        <span class="visually-hidden">{{ row.label }}:</span>
        {{ row.value }}
      </p>
    </div>
  </div>
</template>

<style lang="css" scoped>
.project-card-dates {
  padding-block-start: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.project-card-date {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}
</style>
