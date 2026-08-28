// @env browser

import 'leaflet/dist/leaflet.css'
import 'leaflet-control-geocoder/style.css'
import './styles.css'

export {leafletInput} from './plugin.tsx'
export type {
  GeopointLocation,
  LeafletInputConfig,
  LeafletSearchConfig,
  LeafletTileLayerConfig,
} from './types.ts'
