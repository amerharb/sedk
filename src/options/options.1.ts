export type BuilderOption = {
  $optionVersion: 1
  useSemicolonAtTheEnd?: boolean
  addAscAfterOrderByItem?: 'always'|'never'|'when mentioned'
  addNullsLastAfterOrderByItem?: 'always'|'never'|'when mentioned'
}

export const defaultBuilderOption: BuilderOption = {
  $optionVersion: 1,
  useSemicolonAtTheEnd: true,
  addAscAfterOrderByItem: 'when mentioned',
  addNullsLastAfterOrderByItem: 'when mentioned',
}
