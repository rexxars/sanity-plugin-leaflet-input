import {afterEach, describe, expect, test, vi} from 'vitest'

import {createMapClickHandler} from '../src/mapClick.ts'

afterEach(() => {
  vi.useRealTimers()
})

describe('createMapClickHandler', () => {
  test('selects a location after a single click', () => {
    vi.useFakeTimers()
    const onSelectLocation = vi.fn()
    const handler = createMapClickHandler(onSelectLocation)
    const location = {lat: 37.792, lng: -122.397}

    handler.click(location)

    expect(onSelectLocation).not.toHaveBeenCalled()
    vi.runAllTimers()
    expect(onSelectLocation).toHaveBeenCalledOnce()
    expect(onSelectLocation).toHaveBeenCalledWith(location)
  })

  test('does not select a location during a double click', () => {
    vi.useFakeTimers()
    const onSelectLocation = vi.fn()
    const handler = createMapClickHandler(onSelectLocation)

    handler.click({lat: 37.792, lng: -122.397})
    vi.advanceTimersByTime(200)
    handler.click({lat: 37.793, lng: -122.396})
    handler.doubleClick()
    vi.runAllTimers()

    expect(onSelectLocation).not.toHaveBeenCalled()
  })
})
