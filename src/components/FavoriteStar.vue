<script setup lang="ts">
import StarIcon from '@/assets/images/StarIcon.vue'

const favorited = defineModel<boolean>({ default: false })
</script>

<template>
  <button
    class="favorite-star"
    :aria-pressed="favorited"
    @click="favorited = !favorited"
  >
    <StarIcon :filled="favorited" />
  </button>
</template>

<style lang="css" scoped>
@layer components {
  .favorite-star {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: none;
    background: none;
    color: var(--color-white);
    cursor: pointer;

    &:focus-visible {
      outline: var(--focus-ring-width) solid var(--focus-ring-color);
      outline-offset: var(--focus-ring-width);
    }
  }
}
</style>
