import type {TileLayerOptions} from 'leaflet'
import type {InputProps} from 'sanity'

export interface GeopointLocation {
  lat: number
  lng: number
}

export interface LeafletTileLayerConfig {
  options?: TileLayerOptions
  templateValues?: Record<string, number | string>
  url?: string
}

export interface LeafletSearchConfig {
  accessToken?: string
  locationBiasScale?: number
  maxResults?: number
  placeholder?: string
  url?: string
}

export interface LeafletInputConfig {
  defaultLocation?: GeopointLocation
  defaultZoom?: number
  search?: boolean | LeafletSearchConfig
  tileLayer?: LeafletTileLayerConfig
}

declare module 'sanity' {
  export interface GeopointOptions {
    leaflet?: LeafletInputConfig
  }
}

export interface ResolvedLeafletTileLayerConfig {
  options: TileLayerOptions
  templateValues: Record<string, number | string>
  url: string
}

export interface ResolvedLeafletInputConfig {
  defaultLocation: GeopointLocation
  defaultZoom: number
  search: false | ResolvedLeafletSearchConfig
  tileLayer: ResolvedLeafletTileLayerConfig
}

export interface ResolvedLeafletSearchConfig {
  accessToken?: string
  locationBiasScale: number
  maxResults: number
  placeholder: string
  url: string
}

export interface SearchResult {
  name: string
  properties?: unknown
}

export type LeafletGeopointInputProps = InputProps & {
  config: ResolvedLeafletInputConfig
}

export interface GeoSearchControlProps {
  config: ResolvedLeafletSearchConfig
  onSearchError: (message: string | undefined) => void
  onSelectLocation: (location: GeopointLocation) => void
}

export interface MapEventsProps {
  onSelectLocation: (location: GeopointLocation) => void
  readOnly: boolean
}
