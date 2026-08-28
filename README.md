# sanity-plugin-leaflet-input

A Leaflet map input for Sanity Studio `geopoint` fields.

Version 2 requires Sanity v5 or higher and React 19.
For a version that supports Sanity Studio v2, see the [v1](https://github.com/rexxars/sanity-plugin-leaflet-input/tree/v1) branch/versions.

## Install

```sh
npm install sanity-plugin-leaflet-input
```

Import the `leafletInput` plugin and add it to your Studio configuration:

```ts
// sanity.config.ts
import {defineConfig} from 'sanity'
import {leafletInput} from 'sanity-plugin-leaflet-input'

export default defineConfig({
  // projectId, dataset, schema, and other Studio options
  plugins: [
    leafletInput({
      defaultLocation: {lat: 37.779048, lng: -122.415214},
      defaultZoom: 13,
    }),
  ],
})
```

The plugin replaces the default input for every `geopoint` field. No field-level component configuration is needed:

```ts
import {defineField, defineType} from 'sanity'

export const place = defineType({
  name: 'place',
  title: 'Place',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
    }),
    defineField({
      name: 'location',
      type: 'geopoint',
    }),
  ],
})
```

## Configuration

Calling `leafletInput()` without options uses OpenStreetMap tiles, centers the map on San Francisco, starts at zoom level 13, and searches with Photon.

The plugin accepts these options:

- `defaultLocation`: The `{lat, lng}` used when the field has no value.
- `defaultZoom`: The initial Leaflet zoom level.
- `search`: Set to `false` to hide search, or pass `{accessToken?, locationBiasScale?, maxResults?, placeholder?, url?}`. Providing `accessToken` selects Mapbox Geocoding. Search is always hidden for read-only fields.
- `tileLayer.url`: A Leaflet tile URL template.
- `tileLayer.options`: [Leaflet tile layer options](https://leafletjs.com/reference.html#tilelayer-option), including attribution, tile size, and zoom limits.
- `tileLayer.templateValues`: Values for provider-specific placeholders in the tile URL.

Tile requests default to `referrerPolicy: 'strict-origin-when-cross-origin'`. Leaflet applies this policy only to tile images, so OpenStreetMap receives the Studio origin without changing the policy for the rest of the Studio. Override `tileLayer.options.referrerPolicy` when another tile provider has different requirements.

### Field-level options

Add `options.leaflet` to a `geopoint` field to override the Studio-wide plugin configuration. The field values take precedence. Omitted values, including nested tile options and template values, inherit from `leafletInput(...)`.

This field uses Mapbox while other `geopoint` fields continue to use the configured default tile layer:

```ts
import {defineField} from 'sanity'

const mapboxAccessToken = process.env.SANITY_STUDIO_MAPBOX_ACCESS_TOKEN

if (!mapboxAccessToken) {
  throw new Error('Set SANITY_STUDIO_MAPBOX_ACCESS_TOKEN in .env')
}

export const mapboxLocation = defineField({
  name: 'mapboxLocation',
  title: 'Location (Mapbox)',
  type: 'geopoint',
  options: {
    leaflet: {
      search: {accessToken: mapboxAccessToken},
      tileLayer: {
        url: 'https://api.mapbox.com/styles/v1/{id}/tiles/512/{z}/{x}/{y}?access_token={accessToken}',
        options: {
          attribution:
            '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 18,
          tileSize: 512,
          zoomOffset: -1,
        },
        templateValues: {
          accessToken: mapboxAccessToken,
          id: 'mapbox/streets-v12',
        },
      },
    },
  },
})
```

Field-level options use the same `LeafletInputConfig` shape as `leafletInput(...)`. Set `search: false` on a field to disable search for that field.

### Search

[Photon](https://github.com/komoot/photon) provides keyless, search-as-you-type geocoding based on OpenStreetMap data. The plugin uses Photon’s public demo endpoint by default.

The public endpoint permits reasonable project use, but it may throttle extensive traffic and does not guarantee availability, nor is the accuracy great. Disable search or point the plugin at a self-hosted Photon service when you need different operational guarantees:

```ts
leafletInput({
  search: {
    locationBiasScale: 0.1,
    maxResults: 10,
    placeholder: 'Find a location',
    url: 'https://photon.example.com/api/',
  },
})
```

The current map center and zoom bias search ranking without filtering out other locations. Exact matches in Photon’s house number, street, and name fields are ranked above matches that only occur in regional fields such as state or country. `locationBiasScale` accepts values from `0` to `1`; lower values favor nearby results more strongly.

Provide a public Mapbox access token under `search.accessToken` to use the [Mapbox Geocoding API v6](https://docs.mapbox.com/api/search/geocoding/) instead of Photon:

```ts
leafletInput({
  search: {
    accessToken: process.env.SANITY_STUDIO_MAPBOX_ACCESS_TOKEN,
    maxResults: 10,
    placeholder: 'Find a location',
  },
})
```

Mapbox search uses the current map center as a proximity bias, not as a geographic filter. The plugin sends `permanent=true` because a selected result is stored in the Sanity document. Mapbox requires a billing-enabled account for permanent geocoding. Its autocomplete is also billed for each request, including each request sent while the user types. The search control waits for three characters and debounces requests by 250 milliseconds.

Mapbox requires results from its Geocoding API to be used with a Mapbox map. Configure Mapbox tiles alongside Mapbox search. The plugin does not infer a search token from `tileLayer.templateValues`; pass `search.accessToken` explicitly.

### Studio-wide Mapbox configuration

To use Mapbox for every `geopoint` field, pass the tile configuration to `leafletInput(...)`:

```ts
import {defineConfig} from 'sanity'
import {leafletInput} from 'sanity-plugin-leaflet-input'

const mapboxAccessToken = process.env.SANITY_STUDIO_MAPBOX_ACCESS_TOKEN

if (!mapboxAccessToken) {
  throw new Error('Set SANITY_STUDIO_MAPBOX_ACCESS_TOKEN in .env')
}

export default defineConfig({
  // projectId, dataset, schema, and other Studio options
  plugins: [
    leafletInput({
      search: {accessToken: mapboxAccessToken},
      tileLayer: {
        url: 'https://api.mapbox.com/styles/v1/{id}/tiles/512/{z}/{x}/{y}?access_token={accessToken}',
        options: {
          attribution:
            '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> <a href="https://apps.mapbox.com/feedback/">Improve this map</a>',
          maxZoom: 18,
          tileSize: 512,
          zoomOffset: -1,
        },
        templateValues: {
          accessToken: mapboxAccessToken,
          id: 'mapbox/streets-v12',
        },
      },
    }),
  ],
})
```

Variables prefixed with `SANITY_STUDIO_` are included in the Studio bundle. Use a public Mapbox token here, not a secret token.

## Local development

The repository includes a minimal Studio with one fixed document at `leaflet-input-test`. Its schema has a title and a geopoint field, and its structure opens the document editor as the only pane.

```sh
cp .env.example .env
npm install
npm run dev
```

Set `SANITY_STUDIO_PROJECT_ID` and `SANITY_STUDIO_DATASET` in `.env` before starting the Studio. Set the optional `SANITY_STUDIO_MAPBOX_ACCESS_TOKEN` variable to use Mapbox tiles and geocoding for the field-level Mapbox example.

Run all package checks with:

```sh
npm run check
```

## License

MIT © [Espen Hovlandsdal](https://espen.codes/)
