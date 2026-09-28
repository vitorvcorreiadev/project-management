<script setup lang="ts">
import BaseButton from '@/components/BaseButton.vue'
import BaseInput from '@/components/BaseInput.vue'
import CalendarCheckLight from '@/assets/images/CalendarCheckLight.vue'
import CalendarDayLight from '@/assets/images/CalendarDayLight.vue'
import ImageInput from '@/components/ImageInput.vue'
import { computed, nextTick, ref, watch } from 'vue'
import { deleteCover, saveCover } from '@/db/covers'
import useProjectForm from '@/composables/useProjectForm'
import { useCoverUrl } from '@/composables/useCoverUrl'
import { firstInvalidField } from '@/validation/project'
import type { Project } from '@/types/project'

const props = defineProps<{ initial?: Partial<Project> }>()

const emit = defineEmits<{ save: [project: Project] }>()

const { form, errors, visibleErrors, touch, validateAll } = useProjectForm(props.initial)

const formRef = ref<HTMLFormElement | null>(null)
const coverFile = ref<File | null>(null)
const coverRemoved = ref(false)
const savedCoverUrl = useCoverUrl(() => form)
const existingCover = computed(() => (coverRemoved.value ? null : savedCoverUrl.value))
const isSaving = ref(false)
const saveError = ref<string | null>(null)

watch([coverFile, coverRemoved], () => {
  saveError.value = null
})

async function focusFirstError(): Promise<void> {
  await nextTick()

  const field = firstInvalidField(errors.value)

  if (!field) return

  formRef.value?.querySelector<HTMLInputElement>(`[name="${field}"]`)?.focus()
}

const handleSubmit = async () => {
  if (isSaving.value) return

  if (!validateAll()) {
    await focusFirstError()
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
    <form ref="formRef" novalidate @submit.prevent="handleSubmit">
      <BaseInput
        label="Nome do projeto"
        required
        name="name"
        v-model="form.name"
        :error-message="visibleErrors.name"
        @blur="touch('name')"
      />
      <BaseInput
        label="Cliente"
        required
        name="client"
        v-model="form.client"
        :error-message="visibleErrors.client"
        @blur="touch('client')"
      />
      <div>
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

      <BaseButton full :disabled="isSaving">Salvar projeto</BaseButton>
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

  form {
    max-width: 704px;
    width: 100%;
    padding-block: var(--space-7);
    display: flex;
    flex-direction: column;
    gap: var(--space-6);

    > div {
      display: flex;
      gap: 4rem;
      width: 100%;
      justify-content: space-between;
    }
  }
}
</style>
