export type BuilderOption = {
  useSemicolonAtTheEnd?: boolean
  addAscAfterOrderByItem?: 'always'|'never'|'when mentioned'
  addNullsLastAfterOrderByItem?: 'always'|'never'|'when mentioned'
  addAsBeforeColumnAlias?: 'always'|'never'
  addPublicSchemaName?: 'always'|'never'|'when other schema mentioned'
  addTableName?: 'always'|'when two tables or more' //TODO: add more options like 'when needed' and 'when conflict'
  addAsBeforeTableAlias?: 'always'|'never'
  allowDeleteWithoutWhereConditions?: 'always'|'never'
}

export type BuilderOptionRequired = Required<BuilderOption>

const defaultOption: BuilderOptionRequired = {
  useSemicolonAtTheEnd: true,
  addAscAfterOrderByItem: 'when mentioned',
  addNullsLastAfterOrderByItem: 'when mentioned',
  addAsBeforeColumnAlias: 'always',
  addPublicSchemaName: 'never',
  addTableName: 'when two tables or more',
  addAsBeforeTableAlias: 'always',
  allowDeleteWithoutWhereConditions: 'never',
} as const
Object.freeze(defaultOption)

export function fillUndefinedOptionsWithDefault(option: BuilderOption): BuilderOptionRequired {
  return {
    useSemicolonAtTheEnd: option.useSemicolonAtTheEnd ?? defaultOption.useSemicolonAtTheEnd,
    addAscAfterOrderByItem: option.addAscAfterOrderByItem ?? defaultOption.addAscAfterOrderByItem,
    addNullsLastAfterOrderByItem: option.addNullsLastAfterOrderByItem ?? defaultOption.addNullsLastAfterOrderByItem,
    addAsBeforeColumnAlias: option.addAsBeforeColumnAlias ?? defaultOption.addAsBeforeColumnAlias,
    addPublicSchemaName: option.addPublicSchemaName ?? defaultOption.addPublicSchemaName,
    addTableName: option.addTableName ?? defaultOption.addTableName,
    addAsBeforeTableAlias: option.addAsBeforeTableAlias ?? defaultOption.addAsBeforeTableAlias,
    allowDeleteWithoutWhereConditions: option.allowDeleteWithoutWhereConditions ?? defaultOption.allowDeleteWithoutWhereConditions,
  }
}
