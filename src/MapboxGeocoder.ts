// @env browser

import {latLng, latLngBounds} from 'leaflet'
import type {LatLngTuple} from 'leaflet'
import type {geocoders} from 'leaflet-control-geocoder'

export interface MapboxGeocoderOptions {
  accessToken: string
  maxResults: number
  onError?: (error: MapboxGeocodingError) => void
  onSuccess?: () => void
  serviceUrl: string
}

export class MapboxGeocodingError extends Error {
  readonly status: number | undefined

  constructor(message: string, status?: number, options?: ErrorOptions) {
    super(message, options)
    this.name = 'MapboxGeocodingError'
    this.status = status
  }
}

export function getMapboxGeocodingErrorDescription(
  error: MapboxGeocodingError,
  studioOrigin: string,
): string {
  if (error.status === 401) {
    return 'Mapbox rejected the access token (401). Check that the token is active and copied correctly.'
  }

  if (error.status === 403) {
    return `Mapbox rejected geocoding (403). Check the account, token scopes, and URL restrictions for ${studioOrigin}. Permanent geocoding also requires billing.`
  }

  if (error.status === 429) {
    return 'Mapbox geocoding reached its rate limit (429). Check the account limits or try again later.'
  }

  if (error.status) {
    return `Mapbox geocoding failed (${error.status}): ${error.message}`
  }

  return `Could not reach Mapbox: ${error.message}`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getNumberTuple(value: unknown, length: 2): [number, number] | undefined
function getNumberTuple(value: unknown, length: 4): [number, number, number, number] | undefined
function getNumberTuple(
  value: unknown,
  length: 2 | 4,
): [number, number] | [number, number, number, number] | undefined {
  if (
    !Array.isArray(value) ||
    value.length < length ||
    !value.slice(0, length).every((item) => typeof item === 'number' && Number.isFinite(item))
  ) {
    return undefined
  }

  return value.slice(0, length) as [number, number] | [number, number, number, number]
}

function getResultName(properties: Record<string, unknown>): string | undefined {
  for (const key of ['full_address', 'name_preferred', 'name', 'place_formatted']) {
    const value = properties[key]

    if (typeof value === 'string' && value.length > 0) {
      return value
    }
  }

  return undefined
}

async function getResponseErrorMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json()

    if (isRecord(body) && typeof body.message === 'string' && body.message.length > 0) {
      return body.message
    }
  } catch {
    // Mapbox usually returns JSON errors, but the status remains useful if it does not.
  }

  return response.statusText || `Request failed with status ${response.status}`
}

function parseFeature(feature: unknown): geocoders.GeocodingResult | undefined {
  if (!isRecord(feature) || !isRecord(feature.geometry) || !isRecord(feature.properties)) {
    return undefined
  }

  const coordinates = getNumberTuple(feature.geometry.coordinates, 2)
  const name = getResultName(feature.properties)

  if (!coordinates || !name) {
    return undefined
  }

  const [longitude, latitude] = coordinates
  const center = latLng(latitude, longitude)
  const bounds = getNumberTuple(feature.bbox, 4)
  const bbox = bounds
    ? latLngBounds([bounds[1], bounds[0]] as LatLngTuple, [bounds[3], bounds[2]] as LatLngTuple)
    : latLngBounds(center, center)

  return {bbox, center, name, properties: feature.properties}
}

export class MapboxGeocoder implements geocoders.IGeocoder {
  readonly options: MapboxGeocoderOptions

  constructor(options: MapboxGeocoderOptions) {
    this.options = options
  }

  async geocode(
    query: string,
    context?: geocoders.GeocodingContext,
  ): Promise<geocoders.GeocodingResult[]> {
    const requestUrl = new URL(this.options.serviceUrl)
    requestUrl.searchParams.set('access_token', this.options.accessToken)
    requestUrl.searchParams.set('autocomplete', 'true')
    requestUrl.searchParams.set('limit', String(Math.max(1, Math.min(10, this.options.maxResults))))
    requestUrl.searchParams.set('permanent', 'true')
    requestUrl.searchParams.set('q', query)

    const center = context?.map.getCenter()

    if (center) {
      requestUrl.searchParams.set('proximity', `${center.lng},${center.lat}`)
    }

    let response: Response

    try {
      response = await fetch(requestUrl, {headers: {Accept: 'application/json'}})
    } catch (cause) {
      const error = new MapboxGeocodingError(
        cause instanceof Error ? cause.message : 'Network request failed',
        undefined,
        {cause},
      )
      this.options.onError?.(error)
      return []
    }

    if (!response.ok) {
      const error = new MapboxGeocodingError(
        await getResponseErrorMessage(response),
        response.status,
      )
      this.options.onError?.(error)
      return []
    }

    let data: unknown

    try {
      data = await response.json()
    } catch (cause) {
      const error = new MapboxGeocodingError('Mapbox returned an invalid response', undefined, {
        cause,
      })
      this.options.onError?.(error)
      return []
    }

    this.options.onSuccess?.()

    if (!isRecord(data) || !Array.isArray(data.features)) {
      return []
    }

    return data.features.flatMap((feature) => {
      const result = parseFeature(feature)
      return result ? [result] : []
    })
  }

  suggest(
    query: string,
    context?: geocoders.GeocodingContext,
  ): Promise<geocoders.GeocodingResult[]> {
    return this.geocode(query, context)
  }
}
