import { expect, test } from '@playwright/test'
import { buildProject, seedProjects } from './fixtures/projects.js'
import { projectCard, projectCards, searchInput, searchToggle } from './fixtures/locators.js'

const searchableProjects = () => [
  buildProject({
    id: 1,
    name: 'Projeto Beta',
    started_at: '2024-03-01T14:30:00.000Z',
    end_at: '2026-12-01T14:30:00.000Z',
  }),
  buildProject({
    id: 2,
    name: 'Projeto Alpha',
    started_at: '2026-01-15T14:30:00.000Z',
    end_at: '2025-06-01T14:30:00.000Z',
  }),
  buildProject({
    id: 3,
    name: 'Projeto Gamma',
    started_at: '2025-07-20T14:30:00.000Z',
    end_at: '2024-05-01T14:30:00.000Z',
  }),
]

test.describe('projects search', () => {
  test('opens the search input focused from the header button', async ({ page }) => {
    await seedProjects(page, searchableProjects())
    await page.goto('/')

    await expect(searchInput(page)).toHaveCount(0)

    await searchToggle(page).click()

    await expect(searchInput(page)).toBeVisible()
    await expect(searchInput(page)).toBeFocused()
    await expect(searchInput(page)).toHaveValue('')
    await expect(searchToggle(page)).toHaveCount(0)
  })

  test('searches the projects ignoring the case of the term', async ({ page }) => {
    await seedProjects(page, searchableProjects())
    await page.goto('/')

    await searchToggle(page).click()
    await searchInput(page).fill('aLP')

    await expect(page).toHaveURL('/search')
    await expect(projectCards(page)).toHaveCount(1)
    await expect(projectCard(page, 'Projeto Alpha')).toBeVisible()
  })

  test('closes the search input when clicking outside of it keeping the term', async ({ page }) => {
    await seedProjects(page, searchableProjects())
    await page.goto('/')

    await searchToggle(page).click()
    await searchInput(page).fill('Alp')

    await expect(page).toHaveURL('/search')
    await expect(projectCards(page)).toHaveCount(1)

    await projectCard(page, 'Projeto Alpha').getByRole('heading', { level: 3 }).click()

    await expect(searchInput(page)).toHaveCount(0)
    await expect(searchToggle(page)).toBeVisible()
    await expect(page).toHaveURL('/search')
    await expect(projectCards(page)).toHaveCount(1)

    await searchToggle(page).click()

    await expect(searchInput(page)).toHaveValue('Alp')
  })
})
