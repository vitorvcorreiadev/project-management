<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{ label: string; errorMessage?: string }>()

defineOptions({ inheritAttrs: false })

const errorClass = computed(() => props.errorMessage && 'has-error')
const requiredLabel = ref('"(Obrigatório)"')
</script>

<template>
  <label :class="errorClass" class="base-input">
    <span>{{ label }}</span>

    <input v-bind="$attrs" />
    <small v-if="errorMessage">{{ errorMessage }}</small>
  </label>
</template>

<style lang="css" scoped>
.base-input {
  display: flex;
  flex-direction: column;
  width: 100%;

  > span {
    font-size: var(--font-size-18);
    line-height: 2.2rem;
    color: var(--color-purple-500);
    margin-bottom: var(--space-1);

    &:has(~ input[required]) {
      &::after {
        content: v-bind(requiredLabel);
        font-size: var(--font-size-14);
        color: var(--color-gray-400);
        margin-left: var(--space-2);
      }
    }
  }

  input {
    padding: var(--space-2) var(--space-3);
    font-size: var(--font-size-16);
    line-height: 2.2rem;
    color: var(--color-purple-950);
    border: 1px solid var(--color-gray-400);
    border-radius: var(--radius-2);
  }
}
</style>
