<script setup lang="ts">
import ClockRotateLeftIcon from '@/icons/ClockRotateLeftIcon.vue'
import CrossIcon from '@/icons/CrossIcon.vue'
import BaseHighlight from '@/components/base/BaseHighlight.vue'

defineProps<{ items: string[]; term: string; activeIndex: number; listboxId: string }>()
const emit = defineEmits<{ select: [term: string]; remove: [term: string] }>()
</script>

<template>
  <ul :id="listboxId" class="search-history" role="listbox" aria-label="Buscas recentes">
    <li v-for="(item, index) in items" :key="item" class="search-history-row" role="presentation">
      <button
        :id="`${listboxId}-option-${index}`"
        type="button"
        role="option"
        class="search-history-term"
        :aria-selected="index === activeIndex"
        @click="emit('select', item)"
      >
        <ClockRotateLeftIcon />
        <BaseHighlight :text="item" :term="term" />
      </button>

      <button
        type="button"
        class="search-history-remove"
        :aria-label="`Remover ${item} das buscas recentes`"
        @click="emit('remove', item)"
      >
        <CrossIcon />
      </button>
    </li>
  </ul>
</template>

<style lang="css" scoped>
.search-history {
  background-color: var(--color-white);
  box-shadow: var(--shadow-default);
  border-radius: 0 0 var(--radius-4) var(--radius-4);
  border: 2px solid var(--color-purple-500);
  border-top: none;

  .search-history-row {
    display: flex;
    align-items: center;
    border-top: 1px solid var(--color-purple-50);

    .search-history-term {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      flex: 1;
      padding: var(--space-4) var(--space-5);
      color: var(--color-gray-400);
      cursor: pointer;
      font-size: var(--font-size-sm);

      &[aria-selected='true'] {
        background-color: var(--color-purple-50);
      }

      &:focus-visible {
        outline: var(--focus-ring-width) solid var(--focus-ring-color);
        outline-offset: calc(-1 * var(--focus-ring-width));
      }
    }
  }
}

.search-history-remove {
  padding: var(--space-3) var(--space-4);
  color: var(--color-gray-300);
  cursor: pointer;

  &:hover,
  &:focus-visible {
    color: var(--color-purple-500);
  }

  &:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: calc(-1 * var(--focus-ring-width));
  }
}
</style>
