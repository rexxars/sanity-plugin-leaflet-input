import {describe, expect, test} from 'vitest'

import {resolveLeafletInputConfig} from '../src/config.ts'
import {
  DEFAULT_LOCATION,
  DEFAULT_SEARCH_LOCATION_BIAS_SCALE,
  DEFAULT_SEARCH_MAX_RESULTS,
  DEFAULT_SEARCH_PLACEHOLDER,
  DEFAULT_SEARCH_URL,
  DEFAULT_TILE_ATTRIBUTION,
  DEFAULT_TILE_URL,
  DEFAULT_ZOOM,
} from '../src/constants.ts'

describe('resolveLeafletInputConfig', () => {
  test('returns OpenStreetMap defaults', () => {
    expect(resolveLeafletInputConfig()).toEqual({
      defaultLocation: DEFAULT_LOCATION,
      defaultZoom: DEFAULT_ZOOM,
      search: {
        locationBiasScale: DEFAULT_SEARCH_LOCATION_BIAS_SCALE,
        maxResults: DEFAULT_SEARCH_MAX_RESULTS,
        placeholder: DEFAULT_SEARCH_PLACEHOLDER,
        url: DEFAULT_SEARCH_URL,
      },
      tileLayer: {
        options: {
          attribution: DEFAULT_TILE_ATTRIBUTION,
          referrerPolicy: 'strict-origin-when-cross-origin',
        },
        templateValues: {},
        url: DEFAULT_TILE_URL,
      },
    })
  })

  test('merges custom tile options with the defaults', () => {
    expect(
      resolveLeafletInputConfig({
        defaultZoom: 10,
        search: false,
        tileLayer: {
          options: {maxZoom: 18, tileSize: 512, zoomOffset: -1},
          templateValues: {accessToken: 'token', id: 'mapbox/streets-v12'},
          url: 'https://example.com/{id}/{z}/{x}/{y}?access_token={accessToken}',
        },
      }),
    ).toMatchSnapshot()
  })

  test('allows overriding the tile request referrer policy', () => {
    expect(
      resolveLeafletInputConfig({
        tileLayer: {options: {referrerPolicy: 'no-referrer'}},
      }).tileLayer.options.referrerPolicy,
    ).toBe('no-referrer')
  })

  test('allows disabling search', () => {
    expect(resolveLeafletInputConfig({search: false}).search).toBe(false)
  })

  test('merges custom Photon search options with the defaults', () => {
    expect(
      resolveLeafletInputConfig({
        search: {placeholder: 'Find a location', url: 'https://photon.example.com/api/'},
      }).search,
    ).toEqual({
      locationBiasScale: DEFAULT_SEARCH_LOCATION_BIAS_SCALE,
      maxResults: DEFAULT_SEARCH_MAX_RESULTS,
      placeholder: 'Find a location',
      url: 'https://photon.example.com/api/',
    })
  })

  test('merges field options over the Studio configuration', () => {
    const studioConfig = resolveLeafletInputConfig({
      defaultLocation: {lat: 59.9139, lng: 10.7522},
      defaultZoom: 9,
      search: {placeholder: 'Search this map'},
      tileLayer: {
        options: {maxZoom: 20},
        templateValues: {language: 'en'},
      },
    })

    expect(
      resolveLeafletInputConfig(
        {
          defaultZoom: 15,
          tileLayer: {
            options: {attribution: 'Mapbox', tileSize: 512, zoomOffset: -1},
            templateValues: {accessToken: 'token', id: 'mapbox/streets-v12'},
            url: 'https://example.com/{id}/{z}/{x}/{y}?access_token={accessToken}',
          },
        },
        studioConfig,
      ),
    ).toEqual({
      defaultLocation: {lat: 59.9139, lng: 10.7522},
      defaultZoom: 15,
      search: {
        locationBiasScale: DEFAULT_SEARCH_LOCATION_BIAS_SCALE,
        maxResults: DEFAULT_SEARCH_MAX_RESULTS,
        placeholder: 'Search this map',
        url: DEFAULT_SEARCH_URL,
      },
      tileLayer: {
        options: {
          attribution: 'Mapbox',
          maxZoom: 20,
          referrerPolicy: 'strict-origin-when-cross-origin',
          tileSize: 512,
          zoomOffset: -1,
        },
        templateValues: {
          accessToken: 'token',
          id: 'mapbox/streets-v12',
          language: 'en',
        },
        url: 'https://example.com/{id}/{z}/{x}/{y}?access_token={accessToken}',
      },
    })
  })

  test('uses Mapbox search when an access token is provided', () => {
    const studioConfig = resolveLeafletInputConfig({
      search: {url: 'https://photon.example.com/api/'},
    })

    expect(
      resolveLeafletInputConfig({search: {accessToken: 'pk.mapbox-token'}}, studioConfig).search,
    ).toEqual({
      accessToken: 'pk.mapbox-token',
      locationBiasScale: DEFAULT_SEARCH_LOCATION_BIAS_SCALE,
      maxResults: DEFAULT_SEARCH_MAX_RESULTS,
      placeholder: DEFAULT_SEARCH_PLACEHOLDER,
      url: 'https://api.mapbox.com/search/geocode/v6/forward',
    })
  })
})
