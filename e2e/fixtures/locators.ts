import type { Locator, Page } from '@playwright/test'

export const projectListing = (page: Page): Locator => page.locator('.project-listing')

export const projectsTitle = (page: Page): Locator =>
  page.getByRole('heading', { level: 1, name: 'Projetos' })

export const projectCount = (page: Page): Locator => page.locator('.project-listing h1 + span')

export const projectCards = (page: Page): Locator => page.getByRole('article')

export const projectCard = (page: Page, name: string): Locator =>
  projectCards(page).filter({ has: page.getByRole('heading', { level: 2, name }) })

export const projectNames = (page: Page): Locator => projectCards(page).locator('h2')

export const favoriteStar = (card: Locator): Locator => card.locator('button.favorite-star')

export const favoritedFilter = (page: Page): Locator => page.getByRole('switch')

export const sortSelect = (page: Page): Locator => page.getByRole('combobox')

export const searchToggle = (page: Page): Locator => page.locator('.search-box > button')

export const searchInput = (page: Page): Locator =>
  page.getByPlaceholder('Digite o nome do projeto...')

export const searchResultTitle = (page: Page): Locator =>
  page.getByRole('heading', { level: 2, name: 'Resultado da busca' })

export const searchBackButton = (page: Page): Locator =>
  page.getByRole('button', { name: 'Voltar' })

export const projectsEmptyState = (page: Page): Locator => page.getByRole('status')

export const projectsEmptyStateTitle = (page: Page): Locator =>
  page.getByRole('heading', { level: 1, name: 'Nenhum projeto' })

export const newProjectTitle = (page: Page): Locator =>
  page.getByRole('heading', { level: 2, name: 'Novo projeto' })

export const newProjectButton = (page: Page): Locator =>
  page.getByRole('button', { name: 'Novo Projeto' })

export const editProjectTitle = (page: Page): Locator =>
  page.getByRole('heading', { level: 2, name: 'Editar projeto' })

export const projectForm = (page: Page): Locator => page.locator('form')

export const projectNameInput = (page: Page): Locator =>
  projectForm(page).locator('input[name="name"]')

export const projectClientInput = (page: Page): Locator =>
  projectForm(page).locator('input[name="client"]')

export const projectStartedAtInput = (page: Page): Locator =>
  projectForm(page).locator('input[name="started_at"]')

export const projectEndAtInput = (page: Page): Locator =>
  projectForm(page).locator('input[name="end_at"]')

export const projectCoverInput = (page: Page): Locator =>
  projectForm(page).locator('input[type="file"]')

export const projectCoverPreview = (page: Page): Locator =>
  projectForm(page).locator('.image-input img')

export const projectCoverRemoveButton = (page: Page): Locator =>
  projectForm(page).getByRole('button', { name: 'Remover imagem' })

export const backButton = (page: Page): Locator =>
  page.getByRole('button', { name: 'Voltar' })

export const projectSaveButton = (page: Page): Locator =>
  projectForm(page).getByRole('button', { name: 'Salvar projeto' })

export const projectFieldError = (page: Page, field: string): Locator =>
  projectForm(page)
    .locator(`input[name="${field}"]`)
    .locator('xpath=../..')
    .getByRole('alert')
