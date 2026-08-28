import {defineConfig, defineField, defineType} from 'sanity'
import {structureTool} from 'sanity/structure'

import {leafletInput} from './src/index.ts'

const documentId = 'leaflet-input-test'
const schemaType = 'leafletInputTest'
const projectId = process.env.SANITY_STUDIO_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET
const mapboxAccessToken = process.env.SANITY_STUDIO_MAPBOX_ACCESS_TOKEN

if (!projectId || !dataset) {
  throw new Error('Set SANITY_STUDIO_PROJECT_ID and SANITY_STUDIO_DATASET in .env')
}

const testDocument = defineType({
  name: schemaType,
  title: 'Leaflet input test',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'location',
      title: 'Location (OpenStreetMap)',
      type: 'geopoint',
    }),
    defineField({
      name: 'mapboxLocation',
      title: 'Location (Mapbox)',
      description: mapboxAccessToken
        ? 'This field uses Mapbox Streets and Mapbox geocoding.'
        : 'Set SANITY_STUDIO_MAPBOX_ACCESS_TOKEN in .env to load Mapbox tiles.',
      type: 'geopoint',
      options: {
        leaflet: {
          search: mapboxAccessToken ? {accessToken: mapboxAccessToken} : true,
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
              accessToken: mapboxAccessToken ?? '',
              id: 'mapbox/streets-v12',
            },
          },
        },
      },
    }),
  ],
})

const studioConfig = defineConfig({
  name: 'leaflet-input-test',
  title: 'Leaflet input test',
  projectId,
  dataset,
  plugins: [
    structureTool({
      structure: (S) =>
        S.document()
          .id(documentId)
          .schemaType(schemaType)
          .documentId(documentId)
          .title('Leaflet input test'),
    }),
    leafletInput({
      defaultLocation: {lat: 37.779048, lng: -122.415214},
      defaultZoom: 13,
    }),
  ],
  schema: {types: [testDocument]},
})

export {studioConfig as default}
