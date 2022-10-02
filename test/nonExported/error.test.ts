import {
	Builder,
	InvalidConditionError,
	e,
} from 'src'

// test non-exported Classes
import { Condition } from 'Non-Exported/models/Condition'
import { Expression } from 'Non-Exported/models/Expression'
import { Parenthesis } from 'Non-Exported/steps/BaseStep'
import { OnStep } from 'Non-Exported/steps/OnStep'
import { Binder, BinderStore } from 'Non-Exported/binder'
import { BuilderData } from 'Non-Exported/builder'
import { ItemInfo } from 'Non-Exported/ItemInfo'
import { Column } from 'Non-Exported/database'

import { database } from 'test/database'

//Alias
const table1 = database.s.public.t.table1

describe('Throw desired Errors', () => {
	const sql = new Builder(database)
	afterEach(() => { sql.cleanUp() })

	describe('Error: InvalidConditionError', () => {
		it(`Throws error when condition created with only "NUMBER"`, () => {
			function actual() {
				sql
					.selectAsteriskFrom(table1)
					.where(new Condition(new Expression(1)))
					.getSQL()
			}

			expect(actual).toThrow(InvalidConditionError)
			expect(actual).toThrow(`Condition can not created with only "NUMBER"`)
		})
	})

	describe('Error: "Step property in builder data is not initialized"', () => {
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
		it(`Throws error when Step is not initialized`, () => {
			function actual() {
				new OnStep(data).crossJoin(table1)
			}

			expect(actual).toThrow(`Step property in builder data is not initialized`)
		})
	})

	describe('Binder', () => {
		it('Throws: "This binder already stored"', () => {
			function actual() {
				const binderStore = new BinderStore()
				const binder = new Binder('value')
				binderStore.add(binder)
				binderStore.add(binder)
			}

			expect(actual).toThrow(`This binder already stored`)
		})

		it('Throws: "This Binder already has a number"', () => {
			function actual() {
				const binder = new Binder('value', 1)
				binder.no = 2
			}

			expect(actual).toThrow(`This Binder already has a number`)
		})
	})

	describe('BaseStep', () => {
		it('Throws: "Invalid conditions build, opening parentheses are more than closing ones"', () => {
			function actual() {
				sql
					.selectAsteriskFrom(table1)
					// @ts-ignore
					.where(Parenthesis.Open)
					.getSQL()
			}

			expect(actual).toThrow(`Invalid conditions build, opening parentheses are more than closing ones`)
		})

		it('Throws: "Invalid conditions build, closing parenthesis must occur after Opening one"', () => {
			function actual() {
				sql
					.selectAsteriskFrom(table1)
					// @ts-ignore
					.where(Parenthesis.Close)
					.getSQL()
			}

			expect(actual).toThrow(`Invalid conditions build, closing parenthesis must occur after Opening one`)
		})
	})

	it(`Throws: ItemInfo is an abstract class`, () => {
		class DummyItemInfo extends ItemInfo {
			constructor() {super()}

			getColumns(): Column[] {
				return []
			}

			getStmt(data: BuilderData): string {
				return ''
			}
		}

		function actual() {
			sql
				.deleteFrom(table1)
				.where(e(1).eq(1))
				.returning(new DummyItemInfo())
				.getSQL()
		}

		expect(actual).toThrow(`ItemInfo is an abstract class`)
	})
})
