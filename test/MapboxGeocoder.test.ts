/** @vitest-environment jsdom */

import {afterEach, describe, expect, test, vi} from 'vitest'

import {
  getMapboxGeocodingErrorDescription,
  MapboxGeocoder,
  MapboxGeocodingError,
} from '../src/MapboxGeocoder.ts'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('MapboxGeocoder', () => {
  test('uses Geocoding v6 with permanent storage and map proximity', async () => {
    const onSuccess = vi.fn()
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({
        features: [
          {
            bbox: [-122.41, 37.78, -122.39, 37.8],
            geometry: {coordinates: [-122.4001, 37.7936], type: 'Point'},
            id: 'mapbox-address',
            properties: {
              full_address: '351 California Street, San Francisco, California 94104, United States',
              name: '351 California Street',
            },
            type: 'Feature',
          },
        ],
        type: 'FeatureCollection',
      }),
      ok: true,
    })
    vi.stubGlobal('fetch', fetchMock)

    const geocoder = new MapboxGeocoder({
      accessToken: 'pk.mapbox-token',
      maxResults: 7,
      onSuccess,
      serviceUrl: 'https://api.mapbox.com/search/geocode/v6/forward',
    })
    const results = await geocoder.suggest('351 california st', {
      map: {
        getCenter: () => ({lat: 37.7925, lng: -122.3974}),
      } as never,
    })

    const requestUrl = new URL(String(fetchMock.mock.calls[0]?.[0]))
    expect(requestUrl.origin + requestUrl.pathname).toBe(
      'https://api.mapbox.com/search/geocode/v6/forward',
    )
    expect(Object.fromEntries(requestUrl.searchParams)).toMatchObject({
      access_token: 'pk.mapbox-token',
      limit: '7',
      permanent: 'true',
      proximity: '-122.3974,37.7925',
      q: '351 california st',
    })
    expect(results).toHaveLength(1)
    expect(results[0]?.name).toBe(
      '351 California Street, San Francisco, California 94104, United States',
    )
    expect(results[0]?.center).toMatchObject({lat: 37.7936, lng: -122.4001})
    expect(results[0]?.bbox.getWest()).toBe(-122.41)
    expect(results[0]?.bbox.getNorth()).toBe(37.8)
    expect(onSuccess).toHaveBeenCalledOnce()
  })

  test('reports a 403 without rejecting the search request', async () => {
    const onError = vi.fn()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: async () => ({message: 'Forbidden'}),
        ok: false,
        status: 403,
      }),
    )

    const geocoder = new MapboxGeocoder({
      accessToken: 'pk.mapbox-token',
      maxResults: 10,
      onError,
      serviceUrl: 'https://api.mapbox.com/search/geocode/v6/forward',
    })
    const results = await geocoder.suggest('351 california st')

    expect(results).toEqual([])
    expect(onError).toHaveBeenCalledOnce()

    const error: unknown = onError.mock.calls[0]?.[0]
    expect(error).toBeInstanceOf(MapboxGeocodingError)
    expect(error).toMatchObject({message: 'Forbidden', status: 403})
    expect(
      getMapboxGeocodingErrorDescription(error as MapboxGeocodingError, 'http://localhost:3333'),
    ).toBe(
      'Mapbox rejected geocoding (403). Check the account, token scopes, and URL restrictions for http://localhost:3333. Permanent geocoding also requires billing.',
    )
  })
})
