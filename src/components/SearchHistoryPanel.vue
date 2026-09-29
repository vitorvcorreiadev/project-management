<script setup lang="ts">
import SearchIcon from '@/assets/images/SearchIcon.vue'
import CloseIcon from '@/assets/images/CloseIcon.vue'
import BaseHighlight from '@/components/BaseHighlight.vue'

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
        <SearchIcon />
        <BaseHighlight :text="item" :term="term" />
      </button>

      <button
        type="button"
        class="search-history-remove"
        :aria-label="`Remover ${item} das buscas recentes`"
        @click="emit('remove', item)"
      >
        <CloseIcon />
      </button>
    </li>
  </ul>
</template>

<style lang="css" scoped>
.search-history {
  margin: 0;
  padding: var(--space-2) 0;
  list-style: none;
  background-color: var(--color-white);
  border-radius: var(--radius-3);
  box-shadow: var(--shadow-default);

  .search-history-row {
    display: flex;
    align-items: center;

    &:not(:last-child) {
      border-bottom: 1px solid var(--color-purple-50);
    }
  }
}

.search-history-term {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex: 1;
  padding: var(--space-3) var(--space-4);
  color: var(--color-purple-500);
  text-align: start;
  cursor: pointer;

  svg {
    flex-shrink: 0;
  }

  &[aria-selected='true'] {
    background-color: var(--color-purple-50);
  }

  &:focus-visible {
    outline: var(--button-focus-ring-width) solid var(--button-accent);
    outline-offset: calc(-1 * var(--button-focus-ring-width));
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
    outline: var(--button-focus-ring-width) solid var(--button-accent);
    outline-offset: calc(-1 * var(--button-focus-ring-width));
  }
}
</style>
