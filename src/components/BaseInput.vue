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

    <div>
      <slot name="custom-input" />
      <input v-bind="$attrs" v-if="!$slots['custom-input']" />

      <div class="custom-icon" v-if="$slots['custom-icon']">
        <slot name="custom-icon" />
      </div>
    </div>

    <small v-if="errorMessage">{{ errorMessage }}</small>
  </label>
</template>

<style lang="css" scoped>
.base-input {
  display: flex;
  flex-direction: column;
  width: 100%;

  &.has-error {
    color: var(--color-red-500);

    span {
      color: var(--color-red-800);

      &:has(~ div > input[required]) {
        &::after {
          color: var(--color-red-500);
        }
      }
    }

    input {
      color: var(--color-red-500);
      border-color: var(--color-red-500);
    }
  }

  > span {
    font-size: var(--font-size-18);
    line-height: 2.2rem;
    color: var(--color-purple-500);
    margin-bottom: var(--space-1);
    font-weight: 500;

    &:has(~ div > input[required]) {
      &::after {
        content: v-bind(requiredLabel);
        font-size: var(--font-size-14);
        color: var(--color-gray-400);
        margin-left: var(--space-2);
      }
    }
  }

  > div {
    position: relative;

    input {
      width: 100%;
      padding: var(--space-2) var(--space-3);
      font-size: var(--font-size-16);
      line-height: 2.2rem;
      color: var(--color-purple-950);
      border: 1px solid var(--color-gray-400);
      border-radius: var(--radius-2);

      &[type='date']::-webkit-calendar-picker-indicator {
        display: none;
        -webkit-appearance: none;
      }
    }

    .custom-icon {
      position: absolute;
      top: var(--space-2);
      right: var(--space-2);
    }
  }

  > small {
    font-size: var(--font-size-14);
    line-height: 2.2rem;
    margin-top: var(--space-1);
  }
}
</style>
