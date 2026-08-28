// @env browser

import {Button, Card, Text} from '@sanity/ui'
import {Icon, type LeafletEventHandlerFnMap, type Marker as LeafletMarker} from 'leaflet'
import markerIconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import markerIconUrl from 'leaflet/dist/images/marker-icon.png'
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png'
import {forwardRef, useCallback, useRef, useState} from 'react'
import type {ReactElement} from 'react'
import {MapContainer, Marker, Popup, TileLayer, ZoomControl} from 'react-leaflet'
import {PatchEvent, set, setIfMissing, unset} from 'sanity'

import {GEOGRAPHIC_POINT_TYPE} from './constants.ts'
import {GeoSearchControl} from './GeoSearchControl.tsx'
import {MapEvents} from './MapEvents.tsx'
import type {GeopointLocation, LeafletGeopointInputProps} from './types.ts'
import {getGeopointLocation} from './value.ts'

const markerIcon = new Icon({
  iconAnchor: [12, 41],
  iconRetinaUrl: markerIconRetinaUrl,
  iconSize: [25, 41],
  iconUrl: markerIconUrl,
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  shadowUrl: markerShadowUrl,
})

export const LeafletGeopointInput = forwardRef<HTMLDivElement, LeafletGeopointInputProps>(
  function LeafletGeopointInput(props, ref): ReactElement {
    const {config, elementProps, onChange, readOnly, value} = props
    const location = getGeopointLocation(value)
    const center = location ?? config.defaultLocation
    const markerRef = useRef<LeafletMarker | null>(null)
    const [searchError, setSearchError] = useState<string>()

    const handleSetLocation = useCallback(
      (nextLocation: GeopointLocation): void => {
        onChange(
          PatchEvent.from([
            setIfMissing({_type: GEOGRAPHIC_POINT_TYPE}),
            set(nextLocation.lat, ['lat']),
            set(nextLocation.lng, ['lng']),
          ]),
        )
      },
      [onChange],
    )

    const handleMarkerDragEnd = useCallback((): void => {
      const marker = markerRef.current

      if (marker) {
        handleSetLocation(marker.getLatLng())
      }
    }, [handleSetLocation])

    const markerEventHandlers: LeafletEventHandlerFnMap = {
      dragend: handleMarkerDragEnd,
    }

    function handleUnsetMarker(): void {
      onChange(PatchEvent.from(unset()))
    }

    const helpText = readOnly
      ? 'The location is read-only.'
      : location
        ? 'Click the map or drag the marker to change the location.'
        : config.search
          ? 'Click the map or search for a place to set the location.'
          : 'Click the map to set the location.'

    return (
      <div {...elementProps} className="sanity-leaflet-input" ref={ref}>
        <Card border radius={2}>
          <MapContainer
            center={center}
            className="sanity-leaflet-input__map"
            scrollWheelZoom={false}
            zoom={config.defaultZoom}
            zoomControl={false}
          >
            <TileLayer
              {...config.tileLayer.options}
              {...config.tileLayer.templateValues}
              url={config.tileLayer.url}
            />
            <MapEvents onSelectLocation={handleSetLocation} readOnly={readOnly === true} />
            {config.search && !readOnly && (
              <GeoSearchControl
                config={config.search}
                onSearchError={setSearchError}
                onSelectLocation={handleSetLocation}
              />
            )}
            {location && (
              <Marker
                alt="Selected location"
                draggable={!readOnly}
                eventHandlers={markerEventHandlers}
                icon={markerIcon}
                position={location}
                ref={markerRef}
              >
                {!readOnly && (
                  <Popup>
                    <Button
                      mode="ghost"
                      onClick={handleUnsetMarker}
                      text="Remove point"
                      tone="critical"
                    />
                  </Popup>
                )}
              </Marker>
            )}
            <ZoomControl position="topright" />
          </MapContainer>
          {config.search && !readOnly && searchError && (
            <Card padding={2} role="alert" tone="critical">
              <Text size={1}>{searchError}</Text>
            </Card>
          )}
          <Card padding={2} tone="transparent">
            <Text muted size={1}>
              {helpText}
            </Text>
          </Card>
        </Card>
      </div>
    )
  },
)
