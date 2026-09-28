import type { Project } from '@/types/project'

export type ProjectField = 'name' | 'client' | 'started_at' | 'end_at'

export type ProjectDraft = Pick<Project, ProjectField>

export type ProjectErrors = Partial<Record<ProjectField, string>>

type Rule = (value: string, form: ProjectDraft) => string | undefined
export const projectFieldOrder: ProjectField[] = ['name', 'client', 'started_at', 'end_at']

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

const DATE_ONLY_ISO_SUFFIX = 'T00:00:00.000Z'

export function isValidDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false

  const parsed = new Date(`${value}${DATE_ONLY_ISO_SUFFIX}`)

  if (Number.isNaN(parsed.getTime())) return false

  return parsed.toISOString().slice(0, 10) === value
}

const atLeastTwoWords: Rule = (value) => {
  const words = value.split(/\s+/).filter(Boolean)

  return words.length >= 2 ? undefined : 'Por favor, digite ao menos duas palavras'
}

const atLeastOneWord: Rule = (value) =>
  value.split(/\s+/).filter(Boolean).length >= 1
    ? undefined
    : 'Por favor, digite ao menos uma palavra'

const validDate: Rule = (value) => (isValidDate(value) ? undefined : 'Selecione uma data válida')

const endOnOrAfterStart: Rule = (value, form) => {
  if (!isValidDate(value) || !isValidDate(form.started_at)) return undefined

  return value >= form.started_at
    ? undefined
    : 'A data final deve ser igual ou posterior à data de início.'
}

const projectRules: Record<ProjectField, Rule[]> = {
  name: [atLeastTwoWords],
  client: [atLeastOneWord],
  started_at: [validDate],
  end_at: [validDate, endOnOrAfterStart],
}

export function validateProject(form: ProjectDraft): ProjectErrors {
  const errors: ProjectErrors = {}

  for (const field of projectFieldOrder) {
    for (const rule of projectRules[field]) {
      const message = rule(form[field], form)

      if (message) {
        errors[field] = message
        break
      }
    }
  }

  return errors
}

export function firstInvalidField(errors: ProjectErrors): ProjectField | undefined {
  return projectFieldOrder.find((field) => Boolean(errors[field]))
}
