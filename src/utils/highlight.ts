export type HighlightSegment = {
  text: string
  matched: boolean
}

export function splitByTerm(text: string, term: string): HighlightSegment[] {
  if (!term) return [{ text, matched: false }]

  const segments: HighlightSegment[] = []
  const haystack = text.toLowerCase()
  const needle = term.toLowerCase()

  let cursor = 0
  let index = haystack.indexOf(needle)

  while (index !== -1) {
    if (index > cursor) segments.push({ text: text.slice(cursor, index), matched: false })

    segments.push({ text: text.slice(index, index + needle.length), matched: true })

    cursor = index + needle.length
    index = haystack.indexOf(needle, cursor)
  }

  if (!segments.length) return [{ text, matched: false }]

  if (cursor < text.length) segments.push({ text: text.slice(cursor), matched: false })

  return segments
}
