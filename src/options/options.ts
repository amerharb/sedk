import * as v3 from './options.3'
import * as v2 from './options.2'
import * as v1 from './options.1'

export type BuilderOption = v3.BuilderOption

export function getOption(option: { $optionVersion: number }): BuilderOption {
  switch (option.$optionVersion) {
  case 1:
    return v3.migrate(v2.migrate(option as v1.BuilderOption))
  case 2:
    return v3.migrate(option as v2.BuilderOption)
  case 3:
    return option as BuilderOption
  default:
    throw new Error(`Builder option version ${option.$optionVersion} is not supported`)
  }
}
