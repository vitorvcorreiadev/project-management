<script setup lang="ts">
import { computed } from 'vue'
import { splitByTerm } from '@/utils/highlight'

const props = withDefaults(defineProps<{ text: string; term?: string }>(), { term: '' })

const segments = computed(() => splitByTerm(props.text, props.term))
</script>

<template>
  <span class="base-highlight">
    <template v-for="(segment, index) in segments" :key="index">
      <mark v-if="segment.matched">{{ segment.text }}</mark>
      <template v-else>{{ segment.text }}</template>
    </template>
  </span>
</template>

<style lang="css" scoped>
.base-highlight {
  mark {
    background-color: var(--color-amber-400);
    color: var(--color-white);
  }
}
</style>
