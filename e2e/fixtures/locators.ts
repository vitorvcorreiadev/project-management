import type { Locator, Page } from '@playwright/test'

export const projectListing = (page: Page): Locator => page.locator('.project-list')

// Scoped to the listing: the topbar has its own h1, "Gerenciador de Projetos",
// which a substring match on "Projetos" would also hit.
export const projectsTitle = (page: Page): Locator =>
  projectListing(page).getByRole('heading', { level: 2, name: 'Projetos', exact: true })

export const projectCount = (page: Page): Locator => page.locator('.project-list h2 + span')

export const projectCards = (page: Page): Locator => page.getByRole('article')

export const projectCard = (page: Page, name: string): Locator =>
  projectCards(page).filter({ has: page.getByRole('heading', { level: 3, name }) })

// Every card carries a remove dialog with an h3 of its own, so a bare `h3`
// selector would read the hidden "Remover projeto" title as a project name.
export const projectNames = (page: Page): Locator =>
  projectCards(page).locator('h3:not(.dialog-title)')

export const projectNameHighlight = (card: Locator): Locator => card.locator('h3 mark')

export const favoriteStar = (card: Locator): Locator => card.locator('button.favorite-star')

export const cardActionsTrigger = (page: Page, name: string): Locator =>
  projectCard(page, name).locator('details.dropdown-menu > summary')

export const cardMenuItem = (card: Locator, label: string): Locator =>
  card.locator('details.dropdown-menu').getByRole('button', { name: label, exact: true })

export const removeProjectDialog = (card: Locator): Locator => card.locator('dialog.dialog')

export const removeProjectTitle = (card: Locator): Locator =>
  removeProjectDialog(card).getByRole('heading', { name: 'Remover projeto' })

export const removeProjectWarning = (card: Locator): Locator =>
  removeProjectDialog(card).locator('.dialog-content')

export const removeProjectCancel = (card: Locator): Locator =>
  removeProjectDialog(card).getByRole('button', { name: 'Cancelar', exact: true })

export const removeProjectConfirm = (card: Locator): Locator =>
  removeProjectDialog(card).getByRole('button', { name: 'Confirmar', exact: true })

export const favoritedFilter = (page: Page): Locator => page.getByRole('switch')

// Scoped to the listing: the search input is a combobox of its own, so a bare
// `getByRole('combobox')` reads two elements whenever the search is open.
export const sortSelect = (page: Page): Locator => projectListing(page).getByRole('combobox')
export const sortCombobox = (page: Page): Locator => projectListing(page).getByRole('combobox')

export const sortOption = (page: Page, label: string): Locator =>
  page.getByRole('listbox').getByRole('option', { name: label, exact: true })

export const chooseSorting = async (page: Page, label: string): Promise<void> => {
  await sortCombobox(page).click()
  await sortOption(page, label).click()
}

export const searchToggle = (page: Page): Locator => page.locator('.search-box > button')

export const searchInput = (page: Page): Locator =>
  page.getByPlaceholder('Digite o nome do projeto...')

export const searchResultTitle = (page: Page): Locator =>
  page.getByRole('heading', { level: 2, name: 'Resultado da busca' })

// Scoped to the listbox: a native `<select>` carries implicit `option` roles on
// each of its choices, so a bare `getByRole('option')` would read the listing's
// sort select as well as the history panel.
export const searchHistoryPanel = (page: Page): Locator => page.getByRole('listbox')

export const searchHistoryOptions = (page: Page): Locator =>
  searchHistoryPanel(page).getByRole('option')

export const searchHistoryOption = (page: Page, term: string): Locator =>
  searchHistoryOptions(page).filter({ hasText: term })

export const searchHistoryRemove = (page: Page, term: string): Locator =>
  page.getByRole('button', { name: `Remover ${term} das buscas recentes` })

export const searchBackButton = (page: Page): Locator =>
  page.getByRole('button', { name: 'Voltar' })

export const projectsEmptyState = (page: Page): Locator => page.locator('.projects-empty-state')

export const projectsEmptyStateTitle = (page: Page): Locator =>
  projectsEmptyState(page).getByRole('heading', { name: 'Nenhum projeto' })

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

export const backButton = (page: Page): Locator => page.getByRole('button', { name: 'Voltar' })

export const projectSaveButton = (page: Page): Locator =>
  projectForm(page).getByRole('button', { name: 'Salvar projeto' })

export const projectFieldError = (page: Page, field: string): Locator =>
  projectForm(page).locator(`input[name="${field}"]`).locator('xpath=../..').getByRole('alert')
