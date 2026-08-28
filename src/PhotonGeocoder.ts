// @env browser

import {geocoders} from 'leaflet-control-geocoder'

import {rankSearchResults} from './search.ts'

export class PhotonGeocoder extends geocoders.Photon {
  override async geocode(
    query: string,
    context?: geocoders.GeocodingContext,
  ): Promise<geocoders.GeocodingResult[]> {
    const results = await super.geocode(query, context)
    return rankSearchResults(query, results)
  }

  override suggest(
    query: string,
    context?: geocoders.GeocodingContext,
  ): Promise<geocoders.GeocodingResult[]> {
    return this.geocode(query, context)
  }
}
