export type BuilderOption = {
  useSemicolonAtTheEnd?: boolean
  addAscAfterOrderByItem?: 'always'|'never'|'when mentioned'
  addNullsLastAfterOrderByItem?: 'always'|'never'|'when mentioned'
}

const defaultOption: BuilderOption = {
  useSemicolonAtTheEnd: true,
  addAscAfterOrderByItem: 'when mentioned',
  addNullsLastAfterOrderByItem: 'when mentioned',
}
Object.freeze(defaultOption)

export function fillUndefinedOptionsWithDefault(option: BuilderOption): BuilderOption {
  const result: BuilderOption = {}
  result.useSemicolonAtTheEnd = option.useSemicolonAtTheEnd ?? defaultOption.useSemicolonAtTheEnd
  result.addAscAfterOrderByItem = option.addAscAfterOrderByItem ?? defaultOption.addAscAfterOrderByItem
  result.addNullsLastAfterOrderByItem = option.addNullsLastAfterOrderByItem ?? defaultOption.addNullsLastAfterOrderByItem
  return result
}
