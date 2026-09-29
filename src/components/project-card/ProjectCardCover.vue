<script setup lang="ts">
import { computed } from 'vue'

import BaseDropdownMenu from '@/components/BaseDropdownMenu.vue'
import FavoriteStar from '@/components/FavoriteStar.vue'
import ElipsisIcon from '@/assets/images/ElipsisIcon.vue'
import EditIcon from '@/assets/images/EditIcon.vue'
import TrashIcon from '@/assets/images/TrashIcon.vue'
import fallbackCover from '@/assets/images/project-cover.png'
import { useCoverUrl } from '@/composables/useCoverUrl'
import type { DropdownItem } from '@/types/dropdown'
import type { Project } from '@/types/project'

const EDIT = 'edit'
const REMOVE = 'remove'

const menuItems: DropdownItem[] = [
  { id: EDIT, label: 'Editar', icon: EditIcon },
  { id: REMOVE, label: 'Remover', icon: TrashIcon },
]

const props = defineProps<{
  project: Pick<Project, 'id' | 'name' | 'hasCover'>
  favorited: boolean
}>()

const emit = defineEmits<{ edit: []; remove: []; toggleFavorite: [] }>()

/*
 * Resolution lives here rather than on the card so the object URL is created and
 * revoked with the image that uses it, not with whatever the card renders.
 */
const coverUrl = useCoverUrl(props.project)

const menuAriaLabel = computed(() => `Ações do projeto ${props.project.name}`)

function handleMenuSelect(item: DropdownItem) {
  if (item.id === EDIT) {
    emit('edit')

    return
  }

  if (item.id === REMOVE) emit('remove')
}
</script>

<template>
  <div class="project-card-cover">
    <img class="project-card-cover-image" :src="coverUrl ?? fallbackCover" alt="" />

    <div class="project-card-cover-actions">
      <FavoriteStar :model-value="favorited" @update:model-value="emit('toggleFavorite')" />
      <BaseDropdownMenu :ariaLabel="menuAriaLabel" :items="menuItems" @select="handleMenuSelect">
        <ElipsisIcon />
      </BaseDropdownMenu>
    </div>
  </div>
</template>

<style lang="css" scoped>
.project-card-cover {
  position: relative;
}

.project-card-cover-image {
  border-start-start-radius: var(--radius-4);
  border-start-end-radius: var(--radius-4);
  block-size: 231px;
  object-fit: cover;
}

.project-card-cover-actions {
  position: absolute;
  inset-block-end: 25px;
  inset-inline-end: 25px;
  display: flex;
  gap: var(--space-5);
}
</style>
