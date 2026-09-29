<script setup lang="ts">
withDefaults(defineProps<{ filled?: boolean; ariaHidden?: boolean }>(), {
  filled: false,
  ariaHidden: true,
})
</script>

<template>
  <svg
    width="22"
    height="22"
    viewBox="0 0 22 22"
    xmlns="http://www.w3.org/2000/svg"
    :aria-hidden="ariaHidden"
  >
    <path
      d="M1.16561 8.75302C0.846832 8.45917 1.01999 7.92793 1.45116 7.87697L7.56064 7.15462C7.73637 7.13385 7.88901 7.02385 7.96313 6.86367L10.54 1.2948C10.7219 0.901783 11.2824 0.901708 11.4642 1.29473L14.0411 6.86355C14.1153 7.02373 14.2669 7.13403 14.4426 7.1548L20.5525 7.87697C20.9836 7.92793 21.1563 8.45932 20.8375 8.75318L16.3211 12.9173C16.1912 13.0371 16.1334 13.2153 16.1679 13.3883L17.3665 19.4034C17.4511 19.828 16.9979 20.1569 16.619 19.9455L11.2506 16.9493C11.0962 16.8631 10.9086 16.8635 10.7542 16.9497L5.38523 19.9447C5.00636 20.1561 4.5523 19.8279 4.63691 19.4034L5.83575 13.3887C5.87023 13.2157 5.81254 13.037 5.68262 12.9173L1.16561 8.75302Z"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      :fill="filled ? 'var(--color-amber-400)' : 'none'"
    />
  </svg>
</template>
