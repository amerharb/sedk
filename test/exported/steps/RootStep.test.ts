import { BinderStore } from 'Non-Exported/binder'
import { BuilderData } from 'Non-Exported/builder'
import { RootStep } from 'Non-Exported/steps'
import { database } from 'test/database'

describe('RootStep', () => {
	const data: BuilderData = {
		binderStore: new BinderStore(),
		database,
		distinct: undefined,
		fromItemInfos: [],
		groupByItems: [],
		havingParts: [],
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
		orderByItemInfos: [],
		selectItemInfos: [],
		whereParts: [],
		insertIntoTable: undefined,
		insertIntoColumns: [],
		insertIntoValues: [],
		insertIntoDefaultValues: false,
		updateTable: undefined,
		updateSetItemInfos: [],
		returning: [],
	}

	it('Root return empty string',()=> {
		expect(new RootStep(data).getSQL()).toEqual(';')
	})
})
