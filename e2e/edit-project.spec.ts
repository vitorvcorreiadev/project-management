import { expect, test, type Page } from '@playwright/test'
import { buildProject, seedProjects } from './fixtures/projects.js'
import {
  editProjectTitle,
  projectCard,
  projectCount,
  projectEndAtInput,
  projectFieldError,
  projectNameInput,
  projectSaveButton,
  projectStartedAtInput,
  projectsTitle,
} from './fixtures/locators.js'

const SEEDED = buildProject({
  id: 42,
  name: 'Projeto editável',
  client: 'Clicksign',
  started_at: '2026-01-27',
  end_at: '2026-06-30',
})

const OTHER = buildProject({ id: 7, name: 'Projeto vizinho' })

async function gotoEditProject(page: Page, id = SEEDED.id): Promise<void> {
  await seedProjects(page, [SEEDED, OTHER])
  await page.goto(`/projects/${id}/edit`)
  await expect(editProjectTitle(page)).toBeVisible()
}

test.describe('edit project', () => {
  test('fills the form with the project behind the id', async ({ page }) => {
    await gotoEditProject(page)

    await expect(projectNameInput(page)).toHaveValue(SEEDED.name)
    await expect(projectStartedAtInput(page)).toHaveValue(SEEDED.started_at)
    await expect(projectEndAtInput(page)).toHaveValue(SEEDED.end_at)
  })

  test('saves the edits over the same project and returns to the listing', async ({ page }) => {
    await gotoEditProject(page)

    await projectNameInput(page).fill('Projeto editável renomeado')
    await projectSaveButton(page).click()

    await expect(page).toHaveURL(/\/$/)
    await expect(projectCard(page, 'Projeto editável renomeado')).toBeVisible()
    await expect(projectCount(page)).toHaveText('(2)')
  })

  test('does not add a project to the listing', async ({ page }) => {
    await gotoEditProject(page)

    await projectNameInput(page).fill('Projeto editável renomeado')
    await projectSaveButton(page).click()

    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByRole('article')).toHaveCount(2)
  })

  test('leaves the other projects alone', async ({ page }) => {
    await gotoEditProject(page)

    await projectNameInput(page).fill('Projeto editável renomeado')
    await projectSaveButton(page).click()

    await expect(projectCard(page, OTHER.name)).toBeVisible()
  })

  test('keeps the edited project favorited', async ({ page }) => {
    await seedProjects(page, [{ ...SEEDED, favorited: true }, OTHER])

    await page.goto(`/projects/${SEEDED.id}/edit`)
    await projectNameInput(page).fill('Projeto editável renomeado')
    await projectSaveButton(page).click()

    await expect(page).toHaveURL(/\/$/)
    await expect(page.locator('.favorite-star[aria-pressed="true"]')).toHaveCount(1)
  })

  test('refuses an edit that breaks the shared rules', async ({ page }) => {
    await gotoEditProject(page)

    await projectNameInput(page).fill('X')
    await projectSaveButton(page).click()

    await expect(projectFieldError(page, 'name')).toBeVisible()
    await expect(page).toHaveURL(/\/edit$/)
  })

  test('sends an unknown id back to the listing', async ({ page }) => {
    await seedProjects(page, [SEEDED, OTHER])

    await page.goto('/projects/999/edit')

    await expect(page).toHaveURL(/\/$/)
    await expect(projectsTitle(page)).toBeVisible()
  })

  test('sends a non-numeric id back to the listing', async ({ page }) => {
    await seedProjects(page, [SEEDED, OTHER])

    await page.goto('/projects/abc/edit')

    await expect(page).toHaveURL(/\/$/)
    await expect(projectsTitle(page)).toBeVisible()
  })
})
