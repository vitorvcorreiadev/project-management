<script setup lang="ts">
import CalendarCheckLight from '@/assets/images/CalendarCheckLight.vue'
import CalendarDayLight from '@/assets/images/CalendarDayLight.vue'
import type { Project } from '@/types/project'

defineProps<{ project: Project }>()
</script>

<template>
  <article>
    <div>
      <img src="@/assets/images/project-cover.png" />
    </div>

    <div>
      <div>
        <h2>{{ project.title }}</h2>
        <p><strong>Cliente:</strong> {{ project.client }}</p>
      </div>

      <div>
        <div>
          <CalendarDayLight />
          <p>{{ project.started_at }}</p>
        </div>
        <div>
          <CalendarCheckLight />
          <p>{{ project.ended_at }}</p>
        </div>
      </div>
    </div>
  </article>
</template>

<style lang="css" scoped>
article {
  border-radius: var(--radius-4);
  width: 346px;

  > div:first-child {
    img {
      border-top-left-radius: var(--radius-4);
      border-top-right-radius: var(--radius-4);
    }
  }

  > div:last-child {
    border: 1px solid var(--color-gray-100);
    border-bottom-left-radius: var(--radius-4);
    border-bottom-right-radius: var(--radius-4);
    padding: var(--space-5);

    > div:first-child {
      padding-bottom: var(--space-4);
      border-bottom: 1px solid var(--color-gray-100);

      h2 {
        margin-bottom: var(--space-2);
      }
    }

    > div:last-child {
      padding-top: var(--space-4);
      display: flex;
      flex-direction: column;
      gap: var(--space-4);

      div {
        display: flex;
        align-items: center;
        gap: var(--space-4);
      }
    }
  }
}
</style>
