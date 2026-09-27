import type { Locator, Page } from '@playwright/test'

export const projectListing = (page: Page): Locator => page.locator('.project-listing')

export const projectsTitle = (page: Page): Locator =>
  page.getByRole('heading', { level: 1, name: 'Projetos' })

export const projectCount = (page: Page): Locator => page.locator('.project-listing h1 + span')

export const projectCards = (page: Page): Locator => page.getByRole('article')

export const projectCard = (page: Page, name: string): Locator =>
  projectCards(page).filter({ has: page.getByRole('heading', { level: 2, name }) })

export const favoriteStar = (card: Locator): Locator => card.locator('button.favorite-star')

export const favoritedFilter = (page: Page): Locator => page.getByRole('switch')

export const projectsEmptyState = (page: Page): Locator => page.getByRole('status')

export const projectsEmptyStateTitle = (page: Page): Locator =>
  page.getByRole('heading', { level: 1, name: 'Nenhum projeto' })
