import {describe, expect, test} from 'vitest'

import {rankSearchResults} from '../src/search.ts'

describe('rankSearchResults', () => {
  test('prefers exact address fields over matches in regional context', () => {
    const results = [
      {
        name: '351 21st Avenue, San Francisco, California',
        properties: {
          city: 'San Francisco',
          housenumber: '351',
          state: 'California',
          street: '21st Avenue',
        },
      },
      {
        name: '351 McCarthy Street, Hollister, California',
        properties: {
          city: 'Hollister',
          housenumber: '351',
          state: 'California',
          street: 'McCarthy Street',
        },
      },
      {
        name: '351 California Street, San Francisco, California',
        properties: {
          city: 'San Francisco',
          housenumber: '351',
          state: 'California',
          street: 'California Street',
        },
      },
    ]

    expect(rankSearchResults('351 california st', results)[0]?.name).toBe(
      '351 California Street, San Francisco, California',
    )
  })

  test('preserves provider order when text relevance is equal', () => {
    const results = [{name: 'First result'}, {name: 'Second result'}]

    expect(rankSearchResults('unmatched query', results)).toEqual(results)
  })
})
