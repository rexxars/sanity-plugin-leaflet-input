import {GEOGRAPHIC_POINT_TYPE} from './constants.ts'
import type {GeopointLocation} from './types.ts'

export function getGeopointLocation(value: unknown): GeopointLocation | undefined {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('lat' in value) ||
    !('lng' in value) ||
    typeof value.lat !== 'number' ||
    typeof value.lng !== 'number' ||
    !Number.isFinite(value.lat) ||
    !Number.isFinite(value.lng)
  ) {
    return undefined
  }

  return {lat: value.lat, lng: value.lng}
}

export function isGeopointSchemaType(value: unknown): boolean {
  if (typeof value !== 'object' || value === null || !('name' in value)) {
    return false
  }

  if (value.name === GEOGRAPHIC_POINT_TYPE) {
    return true
  }

  if (!('type' in value) || typeof value.type !== 'object' || value.type === null) {
    return false
  }

  return 'name' in value.type && value.type.name === GEOGRAPHIC_POINT_TYPE
}
