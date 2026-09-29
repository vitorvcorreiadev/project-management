import { expect, test } from '@playwright/test'
import { buildProject, seedProjects } from './fixtures/projects.js'
import {
  chooseSorting,
  favoriteStar,
  favoritedFilter,
  projectCard,
  projectCount,
  projectNames,
  searchBackButton,
  searchInput,
  searchResultTitle,
  searchToggle,
  sortCombobox,
  sortOption,
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

    const combobox = sortCombobox(page)

    await expect(combobox).toHaveText('Ordem alfabética')
    await expect(combobox).toHaveAttribute('aria-expanded', 'false')

    await combobox.click()

    await expect(sortOption(page, 'Ordem alfabética')).toHaveAttribute('aria-selected', 'true')
    await expect(page.getByRole('option')).toHaveText([
      'Ordem alfabética',
      'Iniciados mais recentes',
      'Prazo mais próximo',
    ])
    await expect(projectNames(page)).toHaveText(['Projeto Alpha', 'Projeto Beta', 'Projeto Gamma'])
  })

  test('sorts the projects from the most recent start date', async ({ page }) => {
    await seedProjects(page, sortableProjects())
    await page.goto('/')

    await chooseSorting(page, 'Iniciados mais recentes')

    await expect(sortCombobox(page)).toHaveText('Iniciados mais recentes')
    await expect(projectNames(page)).toHaveText(['Projeto Alpha', 'Projeto Gamma', 'Projeto Beta'])
  })

  test('sorts the projects from the closest deadline', async ({ page }) => {
    await seedProjects(page, sortableProjects())
    await page.goto('/')

    await chooseSorting(page, 'Prazo mais próximo')

    await expect(sortCombobox(page)).toHaveText('Prazo mais próximo')
    await expect(projectNames(page)).toHaveText(['Projeto Beta', 'Projeto Alpha', 'Projeto Gamma'])
  })

  test('keeps the popup open while the arrows walk through the options', async ({ page }) => {
    await seedProjects(page, sortableProjects())
    await page.goto('/')

    const combobox = sortCombobox(page)

    await combobox.click()
    await combobox.press('ArrowDown')
    await combobox.press('Enter')

    await expect(combobox).toHaveAttribute('aria-expanded', 'false')
    await expect(combobox).toHaveText('Iniciados mais recentes')
    await expect(projectNames(page)).toHaveText(['Projeto Alpha', 'Projeto Gamma', 'Projeto Beta'])
  })

  test('leaves the sorting untouched on escape', async ({ page }) => {
    await seedProjects(page, sortableProjects())
    await page.goto('/')

    const combobox = sortCombobox(page)

    await combobox.click()
    await combobox.press('ArrowDown')
    await combobox.press('Escape')

    await expect(combobox).toHaveAttribute('aria-expanded', 'false')
    await expect(combobox).toHaveText('Ordem alfabética')
  })

  test('keeps the selected sorting after searching and coming back', async ({ page }) => {
    await seedProjects(page, sortableProjects())
    await page.goto('/')

    await chooseSorting(page, 'Iniciados mais recentes')

    await searchToggle(page).click()
    await searchInput(page).fill('Alp')

    await expect(page).toHaveURL('/search')
    await expect(searchResultTitle(page)).toBeVisible()

    await searchBackButton(page).click()

    await expect(page).toHaveURL('/')
    await expect(sortCombobox(page)).toHaveText('Iniciados mais recentes')
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
    await expect(sortCombobox(page)).toHaveText('Ordem alfabética')
    await expect(projectCount(page)).toHaveText('(2)')
    await expect(projectNames(page)).toHaveText(['Projeto Alpha', 'Projeto Beta'])
  })
})
