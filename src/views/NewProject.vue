<script setup lang="ts">
import BaseBreadcrumb from '@/components/BaseBreadcrumb.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseInput from '@/components/BaseInput.vue'
import CalendarCheckLight from '@/assets/images/CalendarCheckLight.vue'
import CalendarDayLight from '@/assets/images/CalendarDayLight.vue'
// import ImageInput from '@/components/ImageInput.vue'
import { reactive } from 'vue'
import { useProjectsStore } from '@/stores/projects'
import type { Project } from '@/types/project'
import { useRouter } from 'vue-router'

const store = useProjectsStore()
const router = useRouter()

const form = reactive<Project>({
  id: Date.now() * 1000 + Math.floor(Math.random() * 1000),
  name: '',
  client: '',
  started_at: '',
  end_at: '',
  favorited: false,
})

const handleSubmit = () => {
  store.createProject(form)
  router.push('/')
}
</script>

<template>
  <div>
    <BaseBreadcrumb title="Novo projeto" />

    <div class="project-form-wrapper">
      <form @submit.prevent="handleSubmit">
        <BaseInput label="Nome do projeto" required name="name" v-model="form.name" />
        <BaseInput label="Cliente" required name="client" v-model="form.client" />
        <div>
          <BaseInput
            label="Data de Início"
            required
            type="date"
            name="started_at"
            v-model="form.started_at"
          >
            <template #custom-icon>
              <CalendarDayLight />
            </template>
          </BaseInput>

          <BaseInput label="Data Final" required type="date" name="end_at" v-model="form.end_at">
            <template #custom-icon>
              <CalendarCheckLight />
            </template>
          </BaseInput>
        </div>

        <!-- <BaseInput label="Capa do projeto">
          <template #custom-input>
            <ImageInput />
          </template>
        </BaseInput> -->

        <BaseButton full>Salvar projeto</BaseButton>
      </form>
    </div>
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
      align-items: center;
      gap: 4rem;
      width: 100%;
      justify-content: space-between;
    }
  }
}
</style>
