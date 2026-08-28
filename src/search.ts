import {ADDRESS_SEARCH_FIELDS, CONTEXT_SEARCH_FIELDS, SEARCH_TOKEN_GROUPS} from './constants.ts'
import type {SearchResult} from './types.ts'

function getPropertyTokens(value: unknown, fields: string[]): string[] {
  if (typeof value !== 'object' || value === null) {
    return []
  }

  const properties = value as Record<string, unknown>

  return fields.flatMap((field) => {
    if (!(field in properties)) {
      return []
    }

    const property = properties[field]
    return typeof property === 'string' || typeof property === 'number'
      ? tokenize(String(property))
      : []
  })
}

function getTokenScore(queryToken: string, candidateToken: string): number {
  if (queryToken === candidateToken) {
    return 2
  }

  if (
    SEARCH_TOKEN_GROUPS.some(
      (group) => group.includes(queryToken) && group.includes(candidateToken),
    )
  ) {
    return 2
  }

  if (
    queryToken.length >= 3 &&
    (candidateToken.startsWith(queryToken) || queryToken.startsWith(candidateToken))
  ) {
    return 1
  }

  return 0
}

function scoreTokens(queryTokens: string[], candidateTokens: string[], weight: number): number {
  return queryTokens.reduce((score, queryToken) => {
    const tokenScore = candidateTokens.reduce(
      (bestScore, candidateToken) => Math.max(bestScore, getTokenScore(queryToken, candidateToken)),
      0,
    )

    return score + tokenScore * weight
  }, 0)
}

function scoreSearchResult(queryTokens: string[], result: SearchResult): number {
  const addressTokens = getPropertyTokens(result.properties, ADDRESS_SEARCH_FIELDS)
  const contextTokens = getPropertyTokens(result.properties, CONTEXT_SEARCH_FIELDS)
  const fallbackTokens = addressTokens.length === 0 ? tokenize(result.name) : []

  return (
    scoreTokens(queryTokens, addressTokens, 4) +
    scoreTokens(queryTokens, contextTokens, 1) +
    scoreTokens(queryTokens, fallbackTokens, 2)
  )
}

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .split(/\s+/u)
    .filter(Boolean)
}

export function rankSearchResults<Result extends SearchResult>(
  query: string,
  results: Result[],
): Result[] {
  const queryTokens = tokenize(query)

  return results
    .map((result, index) => ({
      index,
      result,
      score: scoreSearchResult(queryTokens, result),
    }))
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .map(({result}) => result)
}
