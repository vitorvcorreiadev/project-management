export type HighlightSegment = {
  text: string
  matched: boolean
}

export function splitByTerm(text: string, term: string): HighlightSegment[] {
  if (!term) return [{ text, matched: false }]

  const needle = term.toLowerCase()
  const index = text.toLowerCase().indexOf(needle)

  if (index === -1) return [{ text, matched: false }]

  const segments: HighlightSegment[] = []
  const matchEnd = index + needle.length

  if (index > 0) segments.push({ text: text.slice(0, index), matched: false })

  segments.push({ text: text.slice(index, matchEnd), matched: true })

  if (matchEnd < text.length) segments.push({ text: text.slice(matchEnd), matched: false })

  return segments
}
