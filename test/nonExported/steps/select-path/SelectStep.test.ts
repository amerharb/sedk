import { BinderStore } from 'Non-Exported/binder'
import { BuilderData } from 'Non-Exported/builder'
import { RootStep, SelectStep } from 'Non-Exported/steps'
import { database } from 'test/database'

//Aliases
const table1 = database.s.public.t.table1
const col1 = table1.c.col1

describe('SelectStep', () => {
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

	it('Select return: [SELECT 1]', () => {
		const actual = new SelectStep(data, new RootStep(data), [1]).getSQL()
		expect(actual).toEqual('SELECT 1;')
	})

	it(`Select return: [SELECT 'A']`, () => {
		const actual = new SelectStep(data, new RootStep(data), ['A']).getSQL()
		expect(actual).toEqual(`SELECT 'A';`)
	})

	it(`Select return: [SELECT "col1"]`, () => {
		const actual = new SelectStep(data, new RootStep(data), [col1]).getSQL()
		expect(actual).toEqual(`SELECT "col1";`)
	})
})
