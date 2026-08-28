import {
  DEFAULT_LOCATION,
  DEFAULT_MAPBOX_SEARCH_URL,
  DEFAULT_SEARCH_LOCATION_BIAS_SCALE,
  DEFAULT_SEARCH_MAX_RESULTS,
  DEFAULT_SEARCH_PLACEHOLDER,
  DEFAULT_SEARCH_URL,
  DEFAULT_TILE_ATTRIBUTION,
  DEFAULT_TILE_URL,
  DEFAULT_ZOOM,
} from './constants.ts'
import type {
  LeafletInputConfig,
  LeafletSearchConfig,
  ResolvedLeafletInputConfig,
  ResolvedLeafletSearchConfig,
} from './types.ts'

function resolveSearchConfig(
  search: boolean | LeafletSearchConfig | undefined,
  fallback?: false | ResolvedLeafletSearchConfig,
): false | ResolvedLeafletSearchConfig {
  if (search === false) {
    return false
  }

  if (search === undefined && fallback !== undefined) {
    return fallback
  }

  const options = typeof search === 'object' && search !== null ? search : undefined
  const inherited = fallback || undefined
  const accessToken = options?.accessToken ?? inherited?.accessToken
  const usesMapbox = Boolean(accessToken)
  const inheritedUsesMapbox = Boolean(inherited?.accessToken)

  return {
    ...(accessToken ? {accessToken} : {}),
    locationBiasScale:
      options?.locationBiasScale ??
      inherited?.locationBiasScale ??
      DEFAULT_SEARCH_LOCATION_BIAS_SCALE,
    maxResults: options?.maxResults ?? inherited?.maxResults ?? DEFAULT_SEARCH_MAX_RESULTS,
    placeholder: options?.placeholder ?? inherited?.placeholder ?? DEFAULT_SEARCH_PLACEHOLDER,
    url:
      options?.url ??
      (usesMapbox === inheritedUsesMapbox ? inherited?.url : undefined) ??
      (usesMapbox ? DEFAULT_MAPBOX_SEARCH_URL : DEFAULT_SEARCH_URL),
  }
}

export function resolveLeafletInputConfig(
  config: LeafletInputConfig | void,
  fallback?: ResolvedLeafletInputConfig,
): ResolvedLeafletInputConfig {
  return {
    defaultLocation: config?.defaultLocation ?? fallback?.defaultLocation ?? DEFAULT_LOCATION,
    defaultZoom: config?.defaultZoom ?? fallback?.defaultZoom ?? DEFAULT_ZOOM,
    search: resolveSearchConfig(config?.search, fallback?.search),
    tileLayer: {
      options: {
        attribution: DEFAULT_TILE_ATTRIBUTION,
        referrerPolicy: 'strict-origin-when-cross-origin',
        ...fallback?.tileLayer.options,
        ...config?.tileLayer?.options,
      },
      templateValues: {
        ...fallback?.tileLayer.templateValues,
        ...config?.tileLayer?.templateValues,
      },
      url: config?.tileLayer?.url ?? fallback?.tileLayer.url ?? DEFAULT_TILE_URL,
    },
  }
}
