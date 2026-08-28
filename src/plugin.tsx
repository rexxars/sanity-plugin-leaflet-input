// @env browser

import type {ReactElement} from 'react'
import {definePlugin} from 'sanity'
import type {InputProps} from 'sanity'

import {resolveLeafletInputConfig} from './config.ts'
import {PLUGIN_NAME} from './constants.ts'
import {LeafletGeopointInput} from './GeopointInput.tsx'
import type {LeafletInputConfig, ResolvedLeafletInputConfig} from './types.ts'
import {isGeopointSchemaType} from './value.ts'

function createInputComponent(
  config: ResolvedLeafletInputConfig,
): (props: InputProps) => ReactElement {
  return function LeafletInputComponent(props: InputProps): ReactElement {
    if (!isGeopointSchemaType(props.schemaType)) {
      return props.renderDefault(props)
    }

    const fieldConfig = props.schemaType.options?.leaflet
    const resolvedConfig = fieldConfig ? resolveLeafletInputConfig(fieldConfig, config) : config

    return <LeafletGeopointInput {...props} config={resolvedConfig} />
  }
}

export const leafletInput = definePlugin<LeafletInputConfig | void>((options) => {
  const config = resolveLeafletInputConfig(options)

  return {
    name: PLUGIN_NAME,
    form: {
      components: {
        input: createInputComponent(config),
      },
    },
  }
})
