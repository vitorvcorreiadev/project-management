<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'

import ChevronDownIcon from '@/assets/images/ChevronDownIcon.vue'
import { useCombobox } from '@/composables/useCombobox'
import type { ComboboxOption } from '@/types/combobox'

const props = withDefaults(
  defineProps<{
    label: string
    options: ComboboxOption[]
    placeholder?: string
  }>(),
  { placeholder: 'Escolha uma opção' },
)

const model = defineModel<string>({ default: '' })

const comboRef = useTemplateRef<HTMLDivElement>('combo')
const optionRefs = useTemplateRef<HTMLElement[]>('option')

const {
  isOpen,
  selectedIndex,
  activeDescendant,
  listboxId,
  optionId,
  isActive,
  isSelected,
  toggleMenu,
  onKeydown,
  onOptionClick,
  onBlur,
} = useCombobox({
  model,
  options: () => props.options,
  optionElements: () => optionRefs.value ?? [],
})

const displayText = computed(() => props.options[selectedIndex.value]?.label ?? props.placeholder)

function optionClasses(index: number) {
  return [
    'combobox-option',
    {
      'combobox-option--active': isActive(index),
      'combobox-option--selected': isSelected(index),
    },
  ]
}

function focusCombo(): void {
  comboRef.value?.focus()
}

function selectOption(index: number): void {
  onOptionClick(index)
  focusCombo()
}
</script>

<template>
  <div class="combobox">
    <div class="combobox-control">
      <div
        ref="combo"
        class="combobox-trigger"
        role="combobox"
        tabindex="0"
        aria-haspopup="listbox"
        :aria-expanded="isOpen"
        :aria-controls="listboxId"
        :aria-label="label"
        :aria-activedescendant="activeDescendant"
        @click="toggleMenu"
        @keydown="onKeydown"
        @blur="onBlur"
      >
        {{ displayText }}

        <ChevronDownIcon aria-hidden="true" />
      </div>

      <div
        v-show="isOpen"
        :id="listboxId"
        class="combobox-listbox"
        role="listbox"
        tabindex="-1"
        @mousedown.prevent
      >
        <div
          v-for="(option, index) in options"
          :id="optionId(index)"
          :key="option.value"
          ref="option"
          :class="optionClasses(index)"
          role="option"
          :aria-selected="isSelected(index)"
          @click="selectOption(index)"
        >
          {{ option.label }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.combobox {
  display: flex;
  flex-direction: column;
  min-inline-size: 29.5rem;
}

.combobox-control {
  position: relative;
}

.combobox-trigger {
  position: relative;
  padding: 1.1rem var(--space-6) 1.1rem var(--space-3);
  border: 1px solid var(--color-gray-400);
  border-radius: var(--radius-2);
  background-color: var(--color-white);
  color: var(--color-purple-950);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-sm);
  cursor: pointer;

  svg {
    position: absolute;
    inset-inline-end: var(--space-3);
    inset-block-start: 50%;
    translate: 0 -50%;
    pointer-events: none;
    transition: rotate var(--duration-moderate) ease;
  }

  &[aria-expanded='true'] {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    border-color: var(--color-purple-500);

    &:focus-visible {
      outline: none;
    }

    svg {
      rotate: 180deg;
      color: var(--color-purple-500);
    }
  }

  &:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-width);
  }
}

.combobox-listbox {
  position: absolute;
  inset-inline: 0;
  z-index: 2;
  max-block-size: 24rem;
  overscroll-behavior: contain;
  overflow-y: auto;
  border: 1px solid var(--color-purple-500);
  border-top: none;
  border-radius: 0 0 var(--radius-4) var(--radius-4);
  background-color: var(--color-white);
  box-shadow: var(--shadow-default);

  .combobox-option {
    position: relative;
    padding: 1.8rem var(--space-4);
    color: var(--color-purple-950);
    font-size: var(--font-size-sm);
    line-height: var(--line-height-xs);
    cursor: pointer;

    &:not(:last-child) {
      border-bottom: 1px solid var(--color-gray-200);
    }

    &.combobox-option--active {
      background-color: var(--color-purple-50);
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .combobox-trigger svg {
    transition: none;
  }
}
</style>
