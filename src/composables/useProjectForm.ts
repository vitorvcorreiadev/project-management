import { computed, reactive, ref, watch } from 'vue'

import type { Project } from '@/types/project'
import {
  firstInvalidField,
  projectFieldOrder,
  validateProject,
  type ProjectErrors,
  type ProjectField,
} from '@/validation/project'

function createDraft(initial?: Partial<Project>): Project {
  return {
    id: Date.now() * 1000 + Math.floor(Math.random() * 1000),
    name: '',
    client: '',
    started_at: '',
    end_at: '',
    favorited: false,
    hasCover: false,
    ...initial,
  }
}

export default function useProjectForm(initial?: Partial<Project>) {
  const form = reactive<Project>(createDraft(initial))

  const errors = ref<ProjectErrors>({})
  const submitted = ref(false)
  const touched = reactive<Record<ProjectField, boolean>>({
    name: false,
    client: false,
    started_at: false,
    end_at: false,
  })

  function revalidate(): void {
    errors.value = validateProject(form)
  }

  const visibleErrors = computed<ProjectErrors>(() => {
    if (submitted.value) return errors.value

    const visible: ProjectErrors = {}

    for (const field of projectFieldOrder) {
      if (touched[field]) visible[field] = errors.value[field]
    }

    return visible
  })

  function touch(field: ProjectField): void {
    touched[field] = true
    // Blur alone does not change the draft, so the watcher below would not run.
    revalidate()
  }

  /**
   * Unlocks every message and reports the first field to fix, so a caller that
   * wants to move focus gets the answer without re-deriving it.
   */
  function validateAll(): ProjectField | undefined {
    submitted.value = true
    revalidate()

    return firstInvalidField(errors.value)
  }

  function reset(): void {
    Object.assign(form, createDraft(initial))
    submitted.value = false

    for (const field of projectFieldOrder) touched[field] = false

    revalidate()
  }

  watch(form, revalidate, { deep: true })

  return { form, errors, visibleErrors, touch, validateAll, reset }
}
