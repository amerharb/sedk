import * as v1 from './options.1'
import * as v2 from './options.2'
import * as v3 from './options.3'

export type BuilderOption = v3.BuilderOption
type AllBuilderOption = v1.BuilderOption|v2.BuilderOption|v3.BuilderOption

export function getOption(option: AllBuilderOption): BuilderOption {
  let o = option
  switch (option.$optionVersion) {
  case 1:
    o = v2.migrate(o as v1.BuilderOption)
  case 2:
    o = v3.migrate(o as v2.BuilderOption)
  case 3:
    return o as BuilderOption
  default:
    throw new Error(`Builder option version ${option} is not supported`)
  }
}
