import React, {createRef, useState} from 'react'
import PropTypes from 'prop-types'
import Leaflet from 'leaflet'
import {Map, TileLayer, Marker, ZoomControl, Popup} from 'react-leaflet'
import Button from 'part:@sanity/components/buttons/default'
import Fieldset from 'part:@sanity/components/fieldsets/default'
import {PatchEvent, set, setIfMissing, unset} from 'part:@sanity/form-builder/patch-event'
import config from 'config:leaflet-input'
import leafStyles from './Leaflet.css'
import styles from './GeopointInput.css'
import GeoSearchInput from './GeoSearchPlugin'
import MapBoxAccessTokenMissing from './MapBoxAccessTokenMissing'

Leaflet.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
})

const EMPTY_MARKERS = []
const DEFAULT_ZOOM = 13
const DEFAULT_CENTER = [37.779048, -122.415214]

const clickToMove =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  !matchMedia('(pointer:fine)').matches

function getKeyPlaceholder(url) {
  const [, key] = url.match(/access_token=\{(.*?)\}/) || []
  return key
}

function isMissingMapboxApiKey(tileConfig) {
  const url = tileConfig.url || ''
  const hasStaticAccessKey = /accessToken=[^{]/.test(url)
  const keyPlaceholder = !hasStaticAccessKey && getKeyPlaceholder(url)
  return url.includes('tiles.mapbox.com') && keyPlaceholder && !tileConfig[keyPlaceholder]
}

function getHelpText(value) {
  if (!value || !value.lat) {
    return `Click on map to set location`
  }

  if (clickToMove) {
    return `Click on map to change location. Click marker to remove it.`
  }

  return `Drag marker to change location. Click marker to remove it.`
}

// eslint-disable-next-line prefer-arrow-callback
const GeopointInput = React.forwardRef(function GeopointInput(props, ref) {
  const {type, level, value, markers, onChange} = props
  const typeOptions = type.options?.leaflet || {}
  const tileConfig = {...config.tileLayer, ...typeOptions.tileLayer}
  const center = value || typeOptions.defaultLocation || config.defaultLocation || DEFAULT_CENTER
  const [zoom, setZoom] = useState(typeOptions.defaultZoom || config.defaultZoom || DEFAULT_ZOOM)
  const markerRef = createRef()

  if (isMissingMapboxApiKey(tileConfig)) {
    return (
      <Fieldset legend={type.title} description={type.description} markers={markers} label={level}>
        <MapBoxAccessTokenMissing />
      </Fieldset>
    )
  }

  function setMarkerLocation(latLng) {
    onChange(
      PatchEvent.from([
        setIfMissing({
          _type: type.name,
        }),
        set(latLng.lat, ['lat']),
        set(latLng.lng, ['lng']),
      ])
    )
  }

  function handleMapClick(evt) {
    if (!clickToMove && value && value.lat) {
      return
    }

    setMarkerLocation(evt.latlng)
  }

  function handleMarkerDragEnd() {
    if (!markerRef.current) {
      return
    }

    setMarkerLocation(markerRef.current.leafletElement.getLatLng())
  }

  function handleUnsetMarker() {
    onChange(PatchEvent.from(unset()))
  }

  function onZoom(evt) {
    setZoom(evt.target.getZoom())
  }

  return (
    <Fieldset legend={type.title} description={type.description} markers={markers} level={level}>
      <div className={leafStyles.leaflet}>
        <Map
          ref={ref}
          className={styles.map}
          center={center}
          zoom={zoom}
          zoomControl={false}
          onZoomEnd={onZoom}
          scrollWheelZoom={false}
          onClick={handleMapClick}
          trackResize
        >
          <TileLayer {...tileConfig} />

          {value && value.lat && (
            <Marker
              draggable={!type.readOnly}
              onDragend={handleMarkerDragEnd}
              position={center}
              ref={markerRef}
            >
              {!type.readOnly && (
                <Popup>
                  <Button color="danger" inverted onClick={handleUnsetMarker}>
                    Remove point
                  </Button>
                </Popup>
              )}
            </Marker>
          )}

          <GeoSearchInput onSelectLocation={setMarkerLocation} />

          <ZoomControl position="topright" />
        </Map>

        <p className={styles.helpText}>{getHelpText(value)}</p>
      </div>
    </Fieldset>
  )
})

GeopointInput.propTypes = {
  value: PropTypes.shape({
    _type: PropTypes.string.isRequired,
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }),
  level: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  type: PropTypes.shape({
    name: PropTypes.string.isRequired,
    title: PropTypes.string,
    description: PropTypes.string,
    readOnly: PropTypes.bool,
    options: PropTypes.shape({
      leaflet: PropTypes.shape({
        tileLayer: PropTypes.shape({
          url: PropTypes.string.isRequired,
          maxZoom: PropTypes.number,
          attribution: PropTypes.string,
          accessToken: PropTypes.string,
        }),
        defaultLocation: PropTypes.shape({
          lat: PropTypes.number,
          lng: PropTypes.number,
        }),
        defaultZoom: PropTypes.number,
      }),
    }),
  }).isRequired,
  markers: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string,
    })
  ),
}

GeopointInput.defaultProps = {
  value: undefined,
  markers: EMPTY_MARKERS,
}

export default GeopointInput
