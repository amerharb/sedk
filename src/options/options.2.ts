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
