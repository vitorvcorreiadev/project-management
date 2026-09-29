<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary'
    size?: 'medium' | 'large'
    full?: boolean
    disabled?: boolean
  }>(),
  {
    variant: 'primary',
    size: 'medium',
    full: false,
    disabled: false,
  },
)

const classes = computed(() => [
  'button',
  `${props.variant}`,
  `${props.size}`,
  { 'full': props.full },
])
</script>

<template>
  <button :class="classes" :disabled="disabled">
    <slot />
  </button>
</template>

<style lang="css" scoped>
@layer components {
  .button {
    --button-bg: var(--color-purple-500);
    --button-text: var(--color-white);
    --button-border: var(--color-purple-500);
    --button-padding-block: var(--space-2);
    --button-padding-inline: var(--space-5);
    --button-font-size: var(--font-size-sm);
    --button-line-height: var(--line-height-xl);
    --button-gap: var(--space-2);

    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--button-gap);
    padding: var(--button-padding-block) var(--button-padding-inline);
    box-shadow: inset 0 0 0 1px var(--button-border);
    border-radius: var(--radius-5);
    background-color: var(--button-bg);
    color: var(--button-text);
    font-size: var(--button-font-size);
    font-weight: var(--font-weight-regular);
    line-height: var(--button-line-height);
    white-space: nowrap;
    text-decoration: none;
    cursor: pointer;

    &:focus-visible {
      outline: 0.2rem solid var(--color-purple-500);
      outline-offset: 0.2rem;
    }

    &:disabled {
      cursor: not-allowed;
    }

    &.primary:disabled {
      --button-bg: var(--color-purple-200);
      --button-border: var(--color-purple-200);
    }

    &.secondary {
      --button-bg: var(--color-white);
      --button-text: var(--color-purple-500);

      &:disabled {
        --button-text: var(--color-purple-200);
        --button-border: var(--color-purple-200);
      }
    }

    &.large {
      --button-padding-block: 1.5rem;
      --button-padding-inline: var(--space-6);
      --button-font-size: var(--font-size-lg);
      --button-line-height: var(--line-height-lg);
      --button-gap: var(--space-4);
    }

    &.full {
      width: 100%;
    }
  }
}
</style>
