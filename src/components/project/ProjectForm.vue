<script setup lang="ts">
import { computed, nextTick, shallowRef, useTemplateRef, watch } from 'vue'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import CalendarCheckLight from '@/assets/images/CalendarCheckLight.vue'
import CalendarDayLight from '@/assets/images/CalendarDayLight.vue'
import ImageInput from '@/components/image-input/ImageInput.vue'
import { deleteCover, saveCover } from '@/db/covers'
import useProjectForm from '@/composables/useProjectForm'
import { useCoverUrl } from '@/composables/useCoverUrl'
import type { Project } from '@/types/project'
import type { ProjectField } from '@/validation/project'

const props = defineProps<{ initial?: Partial<Project> }>()

const emit = defineEmits<{ save: [project: Project] }>()

const { form, visibleErrors, touch, validateAll } = useProjectForm(props.initial)

const formRef = useTemplateRef<HTMLFormElement>('form')
const coverFile = shallowRef<File | null>(null)
const coverRemoved = shallowRef(false)
const savedCoverUrl = useCoverUrl(form)
const existingCover = computed(() => (coverRemoved.value ? null : savedCoverUrl.value))
const isSaving = shallowRef(false)
const saveError = shallowRef<string | null>(null)

watch(coverFile, (file) => {
  // A new pick supersedes an earlier removal: the stored cover is still on disk,
  // so throwing this pick away must bring it back rather than leave the field
  // empty and delete that cover on submit.
  if (file) coverRemoved.value = false

  saveError.value = null
})

watch(coverRemoved, () => {
  saveError.value = null
})

async function focusFirstError(field: ProjectField): Promise<void> {
  await nextTick()

  formRef.value?.querySelector<HTMLInputElement>(`[name="${field}"]`)?.focus()
}

async function handleSubmit(): Promise<void> {
  if (isSaving.value) return

  const invalidField = validateAll()

  if (invalidField) {
    await focusFirstError(invalidField)

    return
  }

  isSaving.value = true
  saveError.value = null

  try {
    const file = coverFile.value

    if (file) {
      await saveCover(form.id, file)
    } else if (coverRemoved.value) {
      await deleteCover(form.id)
    }

    // A picked file always wins and an explicit removal always clears the flag;
    // only leaving the cover alone keeps whatever the project already had, so an
    // edit never drops a cover the user did not ask to touch.
    emit('save', {
      ...form,
      hasCover: file ? true : coverRemoved.value ? false : form.hasCover,
    })
  } catch {
    saveError.value = 'Não foi possível salvar a capa do projeto. Tente novamente.'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="project-form-wrapper">
    <form ref="form" class="project-form" novalidate @submit.prevent="handleSubmit">
      <BaseInput
        label="Nome do projeto"
        required
        name="name"
        v-model="form.name"
        :error-message="visibleErrors.name"
        @blur="touch('name')"
        autocomplete="off"
      />

      <BaseInput
        label="Cliente"
        required
        name="client"
        v-model="form.client"
        :error-message="visibleErrors.client"
        @blur="touch('client')"
        autocomplete="off"
      />

      <div class="row">
        <BaseInput
          label="Data de Início"
          required
          type="date"
          name="started_at"
          v-model="form.started_at"
          :error-message="visibleErrors.started_at"
          @blur="touch('started_at')"
        >
          <template #custom-icon>
            <CalendarDayLight />
          </template>
        </BaseInput>

        <BaseInput
          label="Data Final"
          required
          type="date"
          name="end_at"
          v-model="form.end_at"
          :error-message="visibleErrors.end_at"
          @blur="touch('end_at')"
        >
          <template #custom-icon>
            <CalendarCheckLight />
          </template>
        </BaseInput>
      </div>

      <BaseInput label="Capa do projeto" :error-message="saveError ?? undefined">
        <template #custom-input>
          <ImageInput
            v-model="coverFile"
            :existing="existingCover"
            @remove-existing="coverRemoved = true"
          />
        </template>
      </BaseInput>

      <BaseButton full :disabled="isSaving" size="large">Salvar projeto</BaseButton>
    </form>
  </div>
</template>

<style lang="css" scoped>
.project-form-wrapper {
  border: 1px solid var(--color-gray-100);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: var(--space-6);
  border-radius: var(--radius-2);

  .project-form {
    max-width: 702px;
    width: 100%;
    padding-block: var(--space-7);
    display: flex;
    flex-direction: column;
    gap: var(--space-6);

    > .row {
      display: flex;
      gap: 4rem;
      width: 100%;
      justify-content: space-between;
    }
  }
}
</style>
