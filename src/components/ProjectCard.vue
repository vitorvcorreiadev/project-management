<script setup lang="ts">
import CalendarCheckLight from '@/assets/images/CalendarCheckLight.vue'
import CalendarDayLight from '@/assets/images/CalendarDayLight.vue'
import fallbackCover from '@/assets/images/project-cover.png'
import FavoriteStar from '@/components/FavoriteStar.vue'
import { useProjectsStore } from '@/stores/projects'
import { useCoverUrl } from '@/composables/useCoverUrl'
import { formatProjectDate } from '@/utils/dates'
import type { Project } from '@/types/project'

const props = defineProps<{ project: Project }>()

const store = useProjectsStore()
const coverUrl = useCoverUrl(() => props.project)
</script>

<template>
  <article>
    <div>
      <img :src="coverUrl ?? fallbackCover" alt="" />
      <FavoriteStar
        :model-value="project.favorited"
        @update:model-value="store.toggleFavorite(project.id)"
      />
    </div>

    <div>
      <div>
        <h2>{{ project.name }}</h2>
        <p><strong>Cliente:</strong> {{ project.client }}</p>
      </div>

      <div>
        <div>
          <CalendarDayLight />
          <p>{{ formatProjectDate(project.started_at) }}</p>
        </div>

        <div>
          <CalendarCheckLight />
          <p>{{ formatProjectDate(project.end_at) }}</p>
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
    position: relative;

    img {
      border-top-left-radius: var(--radius-4);
      border-top-right-radius: var(--radius-4);
      height: 231px;
      object-fit: cover;
    }

    .favorite-star {
      position: absolute;
      bottom: 25px;
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

      p strong {
        margin-right: var(--space-2);
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
