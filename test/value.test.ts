import {describe, expect, test} from 'vitest'

import {getGeopointLocation, isGeopointSchemaType} from '../src/value.ts'

describe('getGeopointLocation', () => {
  test('accepts a complete geopoint', () => {
    expect(getGeopointLocation({_type: 'geopoint', lat: 59.9, lng: 10.7})).toEqual({
      lat: 59.9,
      lng: 10.7,
    })
  })

  test.each([
    undefined,
    null,
    {},
    {_type: 'geopoint'},
    {_type: 'geopoint', lat: 59.9},
    {_type: 'geopoint', lat: Number.NaN, lng: 10.7},
  ])('ignores partial or invalid values: %j', (value) => {
    expect(getGeopointLocation(value)).toBeUndefined()
  })
})

describe('isGeopointSchemaType', () => {
  test('accepts built-in and derived geopoint schema types', () => {
    expect(isGeopointSchemaType({name: 'geopoint'})).toBe(true)
    expect(isGeopointSchemaType({name: 'location', type: {name: 'geopoint'}})).toBe(true)
  })

  test('rejects other schema types', () => {
    expect(isGeopointSchemaType({name: 'string'})).toBe(false)
  })
})
