<script setup lang="ts">
import BaseBreadcrumb from '@/components/BaseBreadcrumb.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseInput from '@/components/BaseInput.vue'
import CalendarCheckLight from '@/assets/images/CalendarCheckLight.vue'
import CalendarDayLight from '@/assets/images/CalendarDayLight.vue'
import ImageInput from '@/components/ImageInput.vue'
</script>

<template>
  <div>
    <BaseBreadcrumb title="Novo projeto" />

    <div class="project-form-wrapper">
      <form>
        <BaseInput label="Nome do projeto" required />
        <BaseInput label="Cliente" required />
        <div>
          <BaseInput label="Data de Início" required type="date">
            <template #custom-icon>
              <CalendarDayLight />
            </template>
          </BaseInput>

          <BaseInput label="Data Final" required type="date">
            <template #custom-icon>
              <CalendarCheckLight />
            </template>
          </BaseInput>
        </div>

        <BaseInput label="Capa do projeto">
          <template #custom-input>
            <ImageInput />
          </template>
        </BaseInput>

        <BaseButton disabled full>Salvar projeto</BaseButton>
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
