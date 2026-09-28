<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import CalendarCheckLight from '@/assets/images/CalendarCheckLight.vue'
import CalendarDayLight from '@/assets/images/CalendarDayLight.vue'
import fallbackCover from '@/assets/images/project-cover.png'
import FavoriteStar from '@/components/FavoriteStar.vue'
import { useProjectsStore } from '@/stores/projects'
import { useCoverUrl } from '@/composables/useCoverUrl'
import { formatProjectDate } from '@/utils/dates'
import type { Project } from '@/types/project'
import type { DropdownItem } from '@/types/dropdown'
import BaseDialog from './BaseDialog.vue'
import BaseDropdownMenu from './BaseDropdownMenu.vue'
import BaseButton from './BaseButton.vue'
import ElipsisIcon from '@/assets/images/ElipsisIcon.vue'
import EditIcon from '@/assets/images/EditIcon.vue'
import TrashIcon from '@/assets/images/TrashIcon.vue'

const EDIT = 'edit'
const REMOVE = 'remove'

const menuItems: DropdownItem[] = [
  { id: EDIT, label: 'Editar', icon: EditIcon },
  { id: REMOVE, label: 'Remover', icon: TrashIcon },
]

const props = defineProps<{ project: Project }>()

const store = useProjectsStore()
const router = useRouter()
const coverUrl = useCoverUrl(() => props.project)
const isRemoveDialogOpen = ref(false)

function handleMenuSelect(item: DropdownItem) {
  if (item.id === EDIT) {
    router.push(`/projects/${props.project.id}/edit`)

    return
  }

  if (item.id === REMOVE) isRemoveDialogOpen.value = true
}

function confirmRemove() {
  store.removeProject(props.project.id)
  isRemoveDialogOpen.value = false
}
</script>

<template>
  <article>
    <div>
      <img :src="coverUrl ?? fallbackCover" alt="" />

      <div>
        <FavoriteStar
          :model-value="project.favorited"
          @update:model-value="store.toggleFavorite(project.id)"
        />
        <BaseDropdownMenu
          :ariaLabel="`Ações do projeto ${project.name}`"
          :items="menuItems"
          @select="handleMenuSelect"
        >
          <ElipsisIcon />
        </BaseDropdownMenu>
      </div>
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

    <BaseDialog v-model:open="isRemoveDialogOpen" title="Remover projeto">
      <template #icon>
        <TrashIcon aria-hidden="true" />
      </template>

      <p>Essa ação removerá definitivamente o projeto</p>
      <span>{{ project.name }}</span>

      <template #actions>
        <BaseButton variant="secondary" @click="isRemoveDialogOpen = false">Cancelar</BaseButton>
        <BaseButton @click="confirmRemove">Confirmar</BaseButton>
      </template>
    </BaseDialog>
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

    > div {
      position: absolute;
      bottom: 25px;
      right: 25px;
      display: flex;
      gap: var(--space-5);
    }
  }

  > div:nth-child(2) {
    border: 1px solid var(--color-gray-100);
    border-bottom-left-radius: var(--radius-4);
    border-bottom-right-radius: var(--radius-4);
    padding: var(--space-5);
    background: white;

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
