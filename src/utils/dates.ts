const projectDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

export function formatProjectDate(value: string): string {
  if (!value) return ''

  return projectDateFormatter.format(new Date(value))
}
