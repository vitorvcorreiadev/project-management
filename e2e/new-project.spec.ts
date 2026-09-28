import { expect, test, type Page } from '@playwright/test'
import { COVER_PNG } from './fixtures/cover.js'
import { seedProjects } from './fixtures/projects.js'
import {
  newProjectTitle,
  projectCard,
  projectClientInput,
  projectCoverInput,
  projectCount,
  projectEndAtInput,
  projectFieldError,
  projectNameInput,
  projectSaveButton,
  projectStartedAtInput,
} from './fixtures/locators.js'

const VALID = {
  name: 'Projeto do form',
  client: 'Clicksign',
  started_at: '2026-09-01',
  end_at: '2026-12-15',
}

async function gotoNewProject(page: Page): Promise<void> {
  await seedProjects(page, [])
  await page.goto('/projects/new')
  await expect(newProjectTitle(page)).toBeVisible()
}

async function fillProjectForm(page: Page, values: Partial<typeof VALID> = {}): Promise<void> {
  const fields = { ...VALID, ...values }

  await projectNameInput(page).fill(fields.name)
  await projectClientInput(page).fill(fields.client)
  await projectStartedAtInput(page).fill(fields.started_at)
  await projectEndAtInput(page).fill(fields.end_at)
}

test.describe('new project', () => {
  test('creates the project and returns to the listing', async ({ page }) => {
    await gotoNewProject(page)

    await fillProjectForm(page)
    await projectSaveButton(page).click()

    await expect(page).toHaveURL(/\/$/)
    await expect(projectCard(page, VALID.name)).toBeVisible()
    await expect(projectCount(page)).toHaveText('(1)')
  })

  test('shows the day picked in the form', async ({ page }) => {
    await gotoNewProject(page)

    await fillProjectForm(page)
    await projectSaveButton(page).click()

    const card = projectCard(page, VALID.name)

    await expect(card).toBeVisible()
    await expect(card).toContainText('01 de setembro de 2026')
    await expect(card).toContainText('15 de dezembro de 2026')
  })

  test('refuses an empty form and names every field', async ({ page }) => {
    await gotoNewProject(page)

    await projectSaveButton(page).click()

    await expect(projectFieldError(page, 'name')).toHaveText(
      'Por favor, digite ao menos duas palavras',
    )
    await expect(projectFieldError(page, 'client')).toHaveText(
      'Por favor, digite ao menos uma palavra',
    )
    await expect(projectFieldError(page, 'started_at')).toHaveText('Selecione uma data válida')
    await expect(projectFieldError(page, 'end_at')).toHaveText('Selecione uma data válida')

    await expect(page).toHaveURL(/\/projects\/new$/)
    await expect(projectNameInput(page)).toBeFocused()
  })

  test('refuses a single-word name and keeps the other fields quiet', async ({ page }) => {
    await gotoNewProject(page)

    await fillProjectForm(page, { name: 'Loja' })
    await projectSaveButton(page).click()

    await expect(projectFieldError(page, 'name')).toHaveText(
      'Por favor, digite ao menos duas palavras',
    )
    await expect(projectFieldError(page, 'client')).toHaveCount(0)
  })

  test('refuses an end date before the start date', async ({ page }) => {
    await gotoNewProject(page)

    await fillProjectForm(page, { end_at: '2026-08-31' })
    await projectSaveButton(page).click()

    await expect(projectFieldError(page, 'end_at')).toHaveText(
      'A data final deve ser igual ou posterior à data de início.',
    )
    await expect(page).toHaveURL(/\/projects\/new$/)
  })

  test('reports a field as soon as it is left, and clears it once corrected', async ({ page }) => {
    await gotoNewProject(page)

    await projectNameInput(page).fill('Loja')
    await projectNameInput(page).blur()

    await expect(projectFieldError(page, 'name')).toHaveText(
      'Por favor, digite ao menos duas palavras',
    )

    await projectNameInput(page).fill('Loja Virtual')

    await expect(projectFieldError(page, 'name')).toHaveCount(0)
  })

  test('saves the chosen cover and shows it in the card', async ({ page }) => {
    await gotoNewProject(page)

    await projectCoverInput(page).setInputFiles({
      name: 'capa.png',
      mimeType: 'image/png',
      buffer: COVER_PNG,
    })

    await fillProjectForm(page)
    await projectSaveButton(page).click()

    const card = projectCard(page, VALID.name)

    await expect(card).toBeVisible()
    // The listing falls back to a bundled placeholder until the bytes come back
    // out of IndexedDB, so a `blob:` src is proof the cover survived the trip.
    await expect(card.locator('img')).toHaveAttribute('src', /^blob:/)
  })

  test('refuses a file that is not an image', async ({ page }) => {
    await gotoNewProject(page)

    await projectCoverInput(page).setInputFiles({
      name: 'notas.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('nao sou uma imagem'),
    })

    await expect(page.getByRole('alert')).toHaveText(
      'Formato inválido. Escolha um arquivo .jpg ou .png.',
    )

    await fillProjectForm(page)
    await projectSaveButton(page).click()

    const card = projectCard(page, VALID.name)

    await expect(card).toBeVisible()
    await expect(card.locator('img')).not.toHaveAttribute('src', /^blob:/)
  })
})
