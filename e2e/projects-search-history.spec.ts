import { expect, test } from '@playwright/test'
import { buildProject, seedProjects, seedSearchHistory } from './fixtures/projects.js'
import {
  projectCard,
  searchHistoryOption,
  searchHistoryOptions,
  searchHistoryRemove,
  searchInput,
  searchResultTitle,
  searchToggle,
} from './fixtures/locators.js'

const searchableProjects = () => [
  buildProject({ id: 1, name: 'Projeto Alpha' }),
  buildProject({ id: 2, name: 'Projeto Beta' }),
  buildProject({ id: 3, name: 'Projeto Gamma' }),
]

test.describe('search history', () => {
  test('lists the five most recent searches from the newest to the oldest', async ({ page }) => {
    await seedProjects(page, searchableProjects())
    await seedSearchHistory(page, ['s01', 's02', 's03', 's04', 's05', 's06'])
    await page.goto('/')

    await expect(searchHistoryOptions(page)).toHaveCount(0)

    await searchToggle(page).click()

    await expect(searchHistoryOptions(page)).toHaveText(['s06', 's05', 's04', 's03', 's02'])
  })

  test('records the search when the box is dismissed by clicking outside', async ({ page }) => {
    await seedProjects(page, searchableProjects())
    await page.goto('/')

    await searchToggle(page).click()
    await searchInput(page).fill('Alp')
    await expect(page).toHaveURL('/search')

    await projectCard(page, 'Projeto Alpha').getByRole('heading', { level: 3 }).click()

    await expect(searchInput(page)).toHaveCount(0)

    await searchToggle(page).click()

    await expect(searchHistoryOption(page, 'Alp')).toBeVisible()
  })

  test('keeps the history out of the list when the search is cancelled with escape', async ({
    page,
  }) => {
    await seedProjects(page, searchableProjects())
    await page.goto('/')

    await searchToggle(page).click()
    await searchInput(page).fill('Alp')
    await searchInput(page).press('Escape')

    await searchToggle(page).click()

    await expect(searchHistoryOptions(page)).toHaveCount(0)
  })

  test('fills the input and shows the results when a search is picked', async ({ page }) => {
    await seedProjects(page, searchableProjects())
    await seedSearchHistory(page, ['Gam', 'Alp'])
    await page.goto('/')

    await searchToggle(page).click()
    await searchHistoryOption(page, 'Alp').click()

    await expect(searchInput(page)).toHaveValue('Alp')
    await expect(page).toHaveURL('/search')
    await expect(searchResultTitle(page)).toBeVisible()
    await expect(searchHistoryOptions(page)).toHaveCount(0)
  })

  test('lists the searches again once the term is typed after a pick', async ({ page }) => {
    await seedProjects(page, searchableProjects())
    await seedSearchHistory(page, ['Gam', 'Alp'])
    await page.goto('/')

    await searchToggle(page).click()
    await searchHistoryOption(page, 'Alp').click()
    await expect(searchHistoryOptions(page)).toHaveCount(0)

    await searchInput(page).fill('Gam')

    await expect(searchHistoryOptions(page)).toHaveText(['Gam'])
  })

  test('removes a search and promotes the next one', async ({ page }) => {
    await seedProjects(page, searchableProjects())
    await seedSearchHistory(page, ['s01', 's02', 's03', 's04', 's05', 's06'])
    await page.goto('/')

    await searchToggle(page).click()
    await searchHistoryRemove(page, 's06').click()

    await expect(searchHistoryOptions(page)).toHaveText(['s05', 's04', 's03', 's02', 's01'])

    await page.reload()
    await searchToggle(page).click()

    await expect(searchHistoryOptions(page)).toHaveText(['s05', 's04', 's03', 's02', 's01'])
  })

  test('picks a search with the keyboard', async ({ page }) => {
    await seedProjects(page, searchableProjects())
    await seedSearchHistory(page, ['Gam', 'Alp'])
    await page.goto('/')

    await searchToggle(page).click()
    // Seeded `Gam` then `Alp`, so the panel lists `Alp` first and the second arrow
    // down walks onto `Gam`.
    await searchInput(page).press('ArrowDown')
    await searchInput(page).press('ArrowDown')
    await searchInput(page).press('Enter')

    await expect(searchInput(page)).toHaveValue('Gam')
    await expect(searchHistoryOptions(page)).toHaveCount(0)
  })

  test('hides the listed searches when the box is closed', async ({ page }) => {
    await seedProjects(page, searchableProjects())
    await seedSearchHistory(page, ['Alp'])
    await page.goto('/')

    await searchToggle(page).click()
    await expect(searchHistoryOptions(page)).toHaveCount(1)

    await searchInput(page).press('Escape')

    await expect(searchHistoryOptions(page)).toHaveCount(0)
  })

  test('narrows the listed searches as the term is typed', async ({ page }) => {
    await seedProjects(page, searchableProjects())
    await seedSearchHistory(page, ['Alfa', 'Beta', 'Gam'])
    await page.goto('/')

    await searchToggle(page).click()
    await searchInput(page).fill('a')

    await expect(searchHistoryOptions(page)).toHaveText(['Gam', 'Beta', 'Alfa'])

    await searchInput(page).fill('Al')

    await expect(searchHistoryOptions(page)).toHaveText(['Alfa'])
  })

  test('hides the listed searches when the term matches none', async ({ page }) => {
    await seedProjects(page, searchableProjects())
    await seedSearchHistory(page, ['Alfa'])
    await page.goto('/')

    await searchToggle(page).click()
    await searchInput(page).fill('zzz')

    await expect(searchHistoryOptions(page)).toHaveCount(0)
    await expect(searchInput(page)).toBeFocused()
  })

  test('surfaces a stored search below the recent five once the filter excludes them', async ({
    page,
  }) => {
    await seedProjects(page, searchableProjects())
    await seedSearchHistory(page, ['s01', 's02', 's03', 's04', 's05', 's06'])
    await page.goto('/')

    await searchToggle(page).click()
    await expect(searchHistoryOptions(page)).toHaveText(['s06', 's05', 's04', 's03', 's02'])

    await searchInput(page).fill('s01')

    await expect(searchHistoryOptions(page)).toHaveText(['s01'])
  })
})
