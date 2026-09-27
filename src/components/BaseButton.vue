<script setup lang="ts">
import { computed } from 'vue'

type Variant = 'primary' | 'secondary'
type Size = 'medium' | 'large'

const props = withDefaults(
  defineProps<{
    variant?: Variant
    size?: Size
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
  ...(props.full ? ['full'] : []),
])
</script>

<template>
  <button :class="classes" :disabled="disabled">
    <slot />
  </button>
</template>
