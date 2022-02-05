import { BuilderOption as v1 } from './options.1'

export type BuilderOption = {
  $optionVersion: 2
  useSemicolonAtTheEnd?: boolean
  addDefaultClauses?: 'always'|'never'|'when mentioned'|{
    addAscAfterOrderByItem?: 'always'|'never'|'when mentioned'
    addNullsLastAfterOrderByItem?: 'always'|'never'|'when mentioned'
  }
}

export const defaultBuilderOption: BuilderOption = {
  $optionVersion: 2,
  useSemicolonAtTheEnd: true,
  addDefaultClauses: 'when mentioned',
}

export function migrate(option: v1): BuilderOption {
  const addDefaultClauses = (option.addAscAfterOrderByItem === option.addNullsLastAfterOrderByItem)
    ? option.addAscAfterOrderByItem
    : {
      addAscAfterOrderByItem: option.addAscAfterOrderByItem,
      addNullsLastAfterOrderByItem: option.addNullsLastAfterOrderByItem,
    }
  return {
    $optionVersion: 2,
    useSemicolonAtTheEnd: option.useSemicolonAtTheEnd,
    addDefaultClauses,

  }
}
