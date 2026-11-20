export function normalizeProductHighlights(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4)
}

export function highlightsFromText(value: string): string[] {
  return normalizeProductHighlights(value.split(/\r?\n/u))
}

export function productHighlightsMatch(expected: unknown, actual: unknown): boolean {
  return JSON.stringify(normalizeProductHighlights(expected)) === JSON.stringify(normalizeProductHighlights(actual))
}
