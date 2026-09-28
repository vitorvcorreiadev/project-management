import { expect, test } from '@playwright/test'
import { buildProject, seedProjects } from './fixtures/projects.js'
import {
  favoriteStar,
  favoritedFilter,
  projectCard,
  projectCount,
  projectNames,
  searchBackButton,
  searchInput,
  searchResultTitle,
  searchToggle,
  sortSelect,
} from './fixtures/locators.js'

const sortableProjects = () => [
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

test.describe('projects sorting', () => {
  test('sorts the projects alphabetically by name by default', async ({ page }) => {
    await seedProjects(page, sortableProjects())
    await page.goto('/')

    const select = sortSelect(page)

    await expect(select).toHaveValue('name')
    await expect(select.locator('option')).toHaveText([
      'Ordem alfabética',
      'Iniciados mais recentes',
      'Prazo mais próximo',
    ])
    await expect(projectNames(page)).toHaveText(['Projeto Alpha', 'Projeto Beta', 'Projeto Gamma'])
  })

  test('sorts the projects from the most recent start date', async ({ page }) => {
    await seedProjects(page, sortableProjects())
    await page.goto('/')

    await sortSelect(page).selectOption('started_at')

    await expect(projectNames(page)).toHaveText(['Projeto Alpha', 'Projeto Gamma', 'Projeto Beta'])
  })

  test('sorts the projects from the closest deadline', async ({ page }) => {
    await seedProjects(page, sortableProjects())
    await page.goto('/')

    await sortSelect(page).selectOption('end_at')

    await expect(projectNames(page)).toHaveText(['Projeto Beta', 'Projeto Alpha', 'Projeto Gamma'])
  })

  test('keeps the selected sorting after searching and coming back', async ({ page }) => {
    await seedProjects(page, sortableProjects())
    await page.goto('/')

    await sortSelect(page).selectOption('started_at')

    await searchToggle(page).click()
    await searchInput(page).fill('Alp')

    await expect(page).toHaveURL('/search')
    await expect(searchResultTitle(page)).toBeVisible()

    await searchBackButton(page).click()

    await expect(page).toHaveURL('/')
    await expect(sortSelect(page)).toHaveValue('started_at')
    await expect(projectNames(page)).toHaveText(['Projeto Alpha', 'Projeto Gamma', 'Projeto Beta'])
  })

  test('keeps the selected sorting when the favorited filter is on', async ({ page }) => {
    await seedProjects(page, sortableProjects())
    await page.goto('/')

    await favoriteStar(projectCard(page, 'Projeto Beta')).click()
    await favoriteStar(projectCard(page, 'Projeto Alpha')).click()

    const filter = favoritedFilter(page)

    await expect(projectCount(page)).toHaveText('(3)')

    await filter.click()

    await expect(filter).toBeChecked()
    await expect(sortSelect(page)).toHaveValue('name')
    await expect(projectCount(page)).toHaveText('(2)')
    await expect(projectNames(page)).toHaveText(['Projeto Alpha', 'Projeto Beta'])
  })
})
