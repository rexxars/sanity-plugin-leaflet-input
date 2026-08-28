// @env browser

import type {LeafletEvent} from 'leaflet'
import {Geocoder} from 'leaflet-control-geocoder'
import {useEffect} from 'react'
import type {ReactElement} from 'react'
import {useMap} from 'react-leaflet'

import type {GeoSearchControlProps} from './types.ts'
import {getMapboxGeocodingErrorDescription, MapboxGeocoder} from './MapboxGeocoder.ts'
import {PhotonGeocoder} from './PhotonGeocoder.ts'
import {getGeopointLocation} from './value.ts'

export function GeoSearchControl({
  config,
  onSearchError,
  onSelectLocation,
}: GeoSearchControlProps): ReactElement | null {
  const map = useMap()

  useEffect(() => {
    const geocoder = config.accessToken
      ? new MapboxGeocoder({
          accessToken: config.accessToken,
          maxResults: config.maxResults,
          onError: (error) => {
            onSearchError(getMapboxGeocodingErrorDescription(error, window.location.origin))
          },
          onSuccess: () => onSearchError(undefined),
          serviceUrl: config.url,
        })
      : new PhotonGeocoder({
          geocodingQueryParams: {
            limit: config.maxResults,
            location_bias_scale: config.locationBiasScale,
          },
          nameProperties: [
            'housenumber',
            'street',
            'name',
            'locality',
            'district',
            'city',
            'state',
            'country',
          ],
          serviceUrl: config.url,
        })

    const control = new Geocoder({
      defaultMarkGeocode: false,
      geocoder,
      placeholder: config.placeholder,
      position: 'topleft',
    })

    function handleGeocode(event: LeafletEvent): void {
      if (
        !('geocode' in event) ||
        typeof event.geocode !== 'object' ||
        event.geocode === null ||
        !('center' in event.geocode)
      ) {
        return
      }

      const location = getGeopointLocation(event.geocode.center)

      if (location) {
        map.panTo(location)
        onSelectLocation(location)
      }
    }

    control.on('markgeocode', handleGeocode)
    control.addTo(map)

    return () => {
      control.off('markgeocode', handleGeocode)
      control.remove()
    }
  }, [
    config.accessToken,
    config.locationBiasScale,
    config.maxResults,
    config.placeholder,
    config.url,
    map,
    onSearchError,
    onSelectLocation,
  ])

  return null
}
