<script setup lang="ts">
import { computed } from 'vue'

const model = defineModel<boolean>({ default: false })

defineOptions({ inheritAttrs: false })

defineSlots<{
  default(): unknown
}>()

const classes = computed(() => ['toggle', model.value ? 'toggle--on' : 'toggle--off'])
</script>

<template>
  <label :class="classes">
    <button
      v-bind="$attrs"
      type="button"
      role="switch"
      class="switch"
      :aria-checked="model"
      @click="model = !model"
    >
      <span class="ball" />
    </button>
    <span v-if="$slots.default" class="label"><slot /></span>
  </label>
</template>

<style lang="css" scoped>
@layer components {
  .toggle {
    --toggle-bg: var(--color-gray-600);
    --toggle-ball-offset: 0;

    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    cursor: pointer;
  }

  .toggle--on {
    --toggle-bg: var(--color-amber-400);
    --toggle-ball-offset: var(--space-5);
  }

  .switch {
    display: block;
    flex: none;
    inline-size: var(--space-7);
    block-size: var(--space-5);
    padding: 0.6rem;
    border-radius: var(--radius-3);
    background-color: var(--toggle-bg);
    cursor: pointer;
    transition: background-color var(--duration-moderate) ease;

    &:focus-visible {
      outline: var(--focus-ring-width) solid var(--focus-ring-color);
      outline-offset: var(--focus-ring-width);
    }
  }

  .ball {
    display: block;
    inline-size: var(--space-3);
    block-size: var(--space-3);
    border-radius: var(--radius-full);
    background-color: var(--color-white);
    translate: var(--toggle-ball-offset);
    transition: translate var(--duration-moderate) ease;
  }

  .label {
    color: var(--color-gray-900);
    font-size: var(--font-size-sm);
    line-height: var(--line-height-lg);
    font-weight: var(--font-weight-regular);
  }

  @media (prefers-reduced-motion: reduce) {
    .switch,
    .ball {
      transition: none;
    }
  }
}
</style>
