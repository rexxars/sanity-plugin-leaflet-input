import type {GeopointLocation} from './types.ts'

export const ADDRESS_SEARCH_FIELDS = ['housenumber', 'name', 'street']
export const CONTEXT_SEARCH_FIELDS = [
  'city',
  'country',
  'county',
  'district',
  'locality',
  'postcode',
  'state',
]

export const DEFAULT_LOCATION = {
  lat: 37.779048,
  lng: -122.415214,
} satisfies GeopointLocation

export const DEFAULT_TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

export const DEFAULT_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
export const DEFAULT_SEARCH_PLACEHOLDER = 'Search for a place or address'
export const DEFAULT_SEARCH_LOCATION_BIAS_SCALE = 0.1
export const DEFAULT_SEARCH_MAX_RESULTS = 10
export const DEFAULT_SEARCH_URL = 'https://photon.komoot.io/api/'
export const DEFAULT_MAPBOX_SEARCH_URL = 'https://api.mapbox.com/search/geocode/v6/forward'
export const DEFAULT_ZOOM = 13
export const GEOGRAPHIC_POINT_TYPE = 'geopoint'
export const PLUGIN_NAME = 'sanity-plugin-leaflet-input'
export const SEARCH_TOKEN_GROUPS: string[][] = [
  ['avenue', 'ave', 'av'],
  ['boulevard', 'blvd'],
  ['drive', 'dr'],
  ['highway', 'hwy'],
  ['lane', 'ln'],
  ['parkway', 'pkwy'],
  ['place', 'pl'],
  ['road', 'rd'],
  ['street', 'st'],
]
