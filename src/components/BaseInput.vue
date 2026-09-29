<script setup lang="ts">
import { computed, ref, useId } from 'vue'

const props = defineProps<{ label: string; errorMessage?: string }>()

const modelValue = defineModel<string | number>()

defineOptions({ inheritAttrs: false })

const errorClass = computed(() => props.errorMessage && 'has-error')
const requiredLabel = ref('"(Obrigatório)"')
const errorId = useId()
</script>

<template>
  <label :class="errorClass" class="base-input">
    <span>{{ label }}</span>

    <div>
      <slot name="custom-input" />
      <input
        v-bind="$attrs"
        v-if="!$slots['custom-input']"
        v-model="modelValue"
        :aria-invalid="errorMessage ? true : undefined"
        :aria-describedby="errorMessage ? errorId : undefined"
      />

      <div class="custom-icon" v-if="$slots['custom-icon']">
        <slot name="custom-icon" />
      </div>
    </div>

    <small v-if="errorMessage" :id="errorId" role="alert">{{ errorMessage }}</small>
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

    .custom-icon {
      color: var(--color-red-500);
    }
  }

  > span {
    font-size: var(--font-size-md);
    line-height: var(--line-height-lg);
    color: var(--color-purple-500);
    margin-bottom: var(--space-1);
    font-weight: 500;

    &:has(~ div > input[required]) {
      &::after {
        content: v-bind(requiredLabel);
        font-size: var(--font-size-xs);
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
      font-size: var(--font-size-sm);
      line-height: var(--line-height-lg);
      color: var(--color-purple-950);
      border: 1px solid var(--color-gray-400);
      border-radius: var(--radius-2);

      &[type='date']::-webkit-calendar-picker-indicator {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        cursor: pointer;
      }
    }

    .custom-icon {
      position: absolute;
      top: var(--space-2);
      right: var(--space-2);
      color: var(--color-gray-400);
      pointer-events: none;
    }

    /* Necessary to hide the date input's placeholder */
    input[type='date']:invalid:not(:focus) {
      &::-webkit-datetime-edit,
      &::-webkit-datetime-edit-day-field,
      &::-webkit-datetime-edit-month-field,
      &::-webkit-datetime-edit-year-field,
      &::-webkit-datetime-edit-text {
        color: transparent;
        -webkit-text-fill-color: transparent;
      }
    }
  }

  > small {
    font-size: var(--font-size-xs);
    line-height: var(--line-height-lg);
    margin-top: var(--space-1);
  }
}
</style>
