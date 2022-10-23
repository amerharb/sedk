import { BinderStore } from 'Non-Exported/binder'
import { BuilderData } from 'Non-Exported/builder'
import { RootStep, SelectFromStep } from 'Non-Exported/steps'
import { database } from 'test/database'

//Aliases
const table1 = database.s.public.t.table1
const table2 = database.s.public.t.table2

describe('SelectFromStep', () => {
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
	const rootStep = new RootStep(data)
	it('returns: [FROM "table1"]', () => {
		const actual = new SelectFromStep(data, rootStep, [table1]).getSQL()
		expect(actual).toEqual('FROM "table1";')
	})
	it('returns: [FROM "table1" AS "t1"]', () => {
		const actual = new SelectFromStep(data, rootStep, [table1.as('t1')]).getSQL()
		expect(actual).toEqual('FROM "table1" AS "t1";')
	})
	it('returns: [FROM "table1", "table2"]', () => {
		const actual = new SelectFromStep(data, rootStep, [table1, table2]).getSQL()
		expect(actual).toEqual('FROM "table1", "table2";')
	})
})
