<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{ modelValue?: boolean }>(), {
  modelValue: false,
})

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

defineOptions({ inheritAttrs: false })

const classes = computed(() => ['toggle', props.modelValue ? 'toggle--on' : 'toggle--off'])
</script>

<template>
  <label :class="classes">
    <button
      v-bind="$attrs"
      type="button"
      role="switch"
      class="switch"
      :aria-checked="modelValue"
      @click="emit('update:modelValue', !modelValue)"
    >
      <span class="ball" />
    </button>
    <span v-if="$slots.default" class="label"><slot /></span>
  </label>
</template>
