export type BuilderOption = {
  useSemicolonAtTheEnd?: boolean
  addAscAfterOrderByItem?: 'always'|'never'|'when mentioned'
  addNullsLastAfterOrderByItem?: 'always'|'never'|'when mentioned'
  addAsBeforeColumnAlias?: 'always'|'never'
  addPublicSchemaName?: 'always'|'never'|'when other schema mentioned'
  addTableName?: 'always'|'when two tables or more' //TODO: add more options like 'when needed' and 'when conflict'
  addAsBeforeTableAlias?: 'always'|'never'
}

const defaultOption: BuilderOption = {
  useSemicolonAtTheEnd: true,
  addAscAfterOrderByItem: 'when mentioned',
  addNullsLastAfterOrderByItem: 'when mentioned',
  addAsBeforeColumnAlias: 'always',
  addPublicSchemaName: 'never',
  addTableName: 'when two tables or more',
  addAsBeforeTableAlias: 'always',
}
Object.freeze(defaultOption)

export function fillUndefinedOptionsWithDefault(option: BuilderOption): BuilderOption {
  const result: BuilderOption = {}
  result.useSemicolonAtTheEnd = option.useSemicolonAtTheEnd ?? defaultOption.useSemicolonAtTheEnd
  result.addAscAfterOrderByItem = option.addAscAfterOrderByItem ?? defaultOption.addAscAfterOrderByItem
  result.addNullsLastAfterOrderByItem = option.addNullsLastAfterOrderByItem ?? defaultOption.addNullsLastAfterOrderByItem
  result.addAsBeforeColumnAlias = option.addAsBeforeColumnAlias ?? defaultOption.addAsBeforeColumnAlias
  result.addPublicSchemaName = option.addPublicSchemaName ?? defaultOption.addPublicSchemaName
  result.addTableName = option.addTableName ?? defaultOption.addTableName
  result.addAsBeforeTableAlias = option.addAsBeforeTableAlias ?? defaultOption.addAsBeforeTableAlias
  return result
}
