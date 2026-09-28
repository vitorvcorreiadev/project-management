import { expect, test } from '@playwright/test'
import { buildProject, seedProjects } from './fixtures/projects.js'
import {
  projectCard,
  projectCards,
  projectCount,
  projectListing,
  projectsEmptyState,
  projectsEmptyStateTitle,
  projectsTitle,
} from './fixtures/locators.js'

test.describe('projects listing', () => {
  test('shows the empty state when there are no projects', async ({ page }) => {
    await seedProjects(page, [])
    await page.goto('/')

    await expect(projectsEmptyState(page)).toBeVisible()
    await expect(projectsEmptyStateTitle(page)).toBeVisible()
    await expect(projectListing(page)).toHaveCount(0)
  })

  test('lists the projects with their count when there are projects', async ({ page }) => {
    await seedProjects(page, [
      buildProject({ id: 1, name: 'Projeto 1' }),
      buildProject({ id: 2, name: 'Projeto 2' }),
      buildProject({ id: 3, name: 'Projeto 3' }),
    ])
    await page.goto('/')

    await expect(projectsTitle(page)).toBeVisible()
    await expect(projectCount(page)).toHaveText('(3)')
    await expect(projectCards(page)).toHaveCount(3)
    await expect(projectCard(page, 'Projeto 1')).toBeVisible()
    await expect(projectCard(page, 'Projeto 2')).toBeVisible()
    await expect(projectCard(page, 'Projeto 3')).toBeVisible()
    await expect(projectsEmptyState(page)).toHaveCount(0)
  })

  test('shows the name, the client and the dates of a project in its card', async ({ page }) => {
    await seedProjects(page, [buildProject({ id: 1, name: 'Projeto 1', client: 'Clicksign' })])
    await page.goto('/')

    const card = projectCard(page, 'Projeto 1')

    await expect(card.getByRole('heading', { level: 2, name: 'Projeto 1' })).toBeVisible()
    await expect(card).toContainText('Cliente: Clicksign')
    await expect(card).toContainText('27 de janeiro de 2026')
    await expect(card).toContainText('30 de junho de 2026')
  })

  test('shows the day picked in the form', async ({ page }) => {
    await seedProjects(page, [])
    await page.goto('/new-project')

    await page.locator('input[name="name"]').fill('Projeto do form')
    await page.locator('input[name="client"]').fill('Clicksign')
    await page.locator('input[name="started_at"]').fill('2026-09-01')
    await page.locator('input[name="end_at"]').fill('2026-12-15')
    await page.getByRole('button', { name: 'Salvar projeto' }).click()

    const card = projectCard(page, 'Projeto do form')

    await expect(card).toBeVisible()
    await expect(card).toContainText('01 de setembro de 2026')
    await expect(card).toContainText('15 de dezembro de 2026')
  })
})
