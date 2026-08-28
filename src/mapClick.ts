import type {GeopointLocation} from './types.ts'

const SINGLE_CLICK_DELAY = 300

export interface MapClickHandler {
  click: (location: GeopointLocation) => void
  dispose: () => void
  doubleClick: () => void
}

export function createMapClickHandler(
  onSelectLocation: (location: GeopointLocation) => void,
): MapClickHandler {
  let pendingClick: ReturnType<typeof setTimeout> | undefined

  function cancelPendingClick(): void {
    if (pendingClick !== undefined) {
      clearTimeout(pendingClick)
      pendingClick = undefined
    }
  }

  return {
    click(location): void {
      cancelPendingClick()
      pendingClick = setTimeout(() => {
        pendingClick = undefined
        onSelectLocation(location)
      }, SINGLE_CLICK_DELAY)
    },
    dispose: cancelPendingClick,
    doubleClick: cancelPendingClick,
  }
}
