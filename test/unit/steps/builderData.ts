import { BinderStore } from 'Non-Exported/binder'
import { BuilderData } from 'Non-Exported/builder'
import { database } from 'test/database'

export const builderData: BuilderData = {
	binderStore: new BinderStore(),
	database,
	option: {
		useSemicolonAtTheEnd: true,
		addAscAfterOrderByItem: 'when mentioned',
		addNullsLastAfterOrderByItem: 'when mentioned',
		addAsBeforeColumnAlias: 'always',
		addPublicSchemaName: 'never',
		addTableName: 'when two tables or more',
		addAsBeforeTableAlias: 'always',
		throwErrorIfDeleteHasNoCondition: true,
	},
}