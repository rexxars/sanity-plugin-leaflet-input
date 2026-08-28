// @env browser

import {useEffect, useMemo} from 'react'
import type {ReactElement} from 'react'
import {useMapEvents} from 'react-leaflet'

import {createMapClickHandler} from './mapClick.ts'
import type {MapEventsProps} from './types.ts'

export function MapEvents({onSelectLocation, readOnly}: MapEventsProps): ReactElement | null {
  const clickHandler = useMemo(() => createMapClickHandler(onSelectLocation), [onSelectLocation])

  useEffect(() => {
    if (readOnly) {
      clickHandler.dispose()
    }

    return clickHandler.dispose
  }, [clickHandler, readOnly])

  useMapEvents({
    click(event): void {
      if (!readOnly) {
        clickHandler.click(event.latlng)
      }
    },
    dblclick: clickHandler.doubleClick,
  })

  return null
}
