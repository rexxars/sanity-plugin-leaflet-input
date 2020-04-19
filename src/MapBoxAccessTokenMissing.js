import React from 'react'
import styles from './GeopointInput.css'

const MapBoxAccessTokenMissing = () => (
  <div className={styles.errorContainer}>
    <h2 className={styles.errorHeading}>Error</h2>
    <p>Mapbox access token is missing from configuration.</p>
    <p>
      Please add it to the <code>tileLayer.accessToken</code> property in{' '}
      <code>&lt;sanity-studio&gt;/config/leaflet-input.json</code>.
    </p>
    <p>
      <a
        href="https://docs.mapbox.com/help/how-mapbox-works/access-tokens/"
        rel="noopener noreferrer"
      >
        Read more
      </a>{' '}
      about how to get hold of an access token, or consider specifying the URL of a different tile
      provider in the <code>tileLayer.url</code> property.
    </p>
  </div>
)

export default MapBoxAccessTokenMissing
